import { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Filter, Settings } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/services/api/client';
import { useRolePermissions } from '@/hooks/useRolePermissions';

type Notification = {
  id: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  metadata: Record<string, any>;
};

type NotificationFilter = 'all' | 'unread' | 'opportunity_created' | 'opportunity_stage_changed' | 'opportunity_promoted';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { rbacRole } = useRolePermissions();
  
  // Check if user has notification access (viewer typically doesn't)
  const hasNotificationAccess = rbacRole !== 'viewer';

  // Fetch notifications - gracefully handle 403 errors
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications', filter],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/notifications/', {
          params: {
            unread_only: filter === 'unread',
            limit: 50,
          },
        });
        return response.data;
      } catch (error: any) {
        // Handle 403 gracefully - user doesn't have permission
        if (error.response?.status === 403) {
          return [];
        }
        throw error;
      }
    },
    enabled: hasNotificationAccess,
    refetchInterval: hasNotificationAccess ? 30000 : false, // Refetch every 30 seconds if enabled
    retry: false, // Don't retry on 403 errors
  });

  // Fetch unread count - gracefully handle 403 errors
  const { data: unreadCount = 0 } = useQuery<{ unread_count: number }>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/notifications/unread-count');
        return response.data;
      } catch (error: any) {
        // Handle 403 gracefully - user doesn't have permission
        if (error.response?.status === 403) {
          return { unread_count: 0 };
        }
        throw error;
      }
    },
    enabled: hasNotificationAccess,
    refetchInterval: hasNotificationAccess ? 30000 : false,
    retry: false, // Don't retry on 403 errors
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiClient.post(`/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      toast.success('All notifications marked as read');
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate to related entity
    if (notification.related_entity_type === 'opportunity' && notification.related_entity_id) {
      navigate(`/module/opportunities/${notification.related_entity_id}`);
      setIsOpen(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications.filter(n => n.type === filter);
  
  const unreadCountValue = (typeof unreadCount === 'object' && unreadCount !== null) ? unreadCount.unread_count : 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2.5 sm:p-3 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-[#161950] transition-all shadow-sm hover:shadow-md">
          <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          {unreadCountValue > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shadow-lg ring-2 ring-white">
              {unreadCountValue > 9 ? '9+' : unreadCountValue}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[90vw] sm:w-96 md:w-[420px] lg:w-[480px] p-0 bg-white border-2 border-gray-200 shadow-2xl rounded-xl overflow-hidden" 
        align="end"
        sideOffset={8}
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        <div className="flex flex-col max-h-[85vh] sm:max-h-[600px] bg-white">
          <div className="p-4 sm:p-5 border-b-2 border-gray-200 bg-gradient-to-r from-[#161950] to-[#1E2B5B] flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Notifications
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={filter} onValueChange={(v) => setFilter(v as NotificationFilter)}>
                <SelectTrigger className="w-28 sm:w-32 h-8 bg-white/90 border-white/20 text-gray-900 hover:bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-gray-200">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="opportunity_created">Created</SelectItem>
                  <SelectItem value="opportunity_stage_changed">Stage Changed</SelectItem>
                  <SelectItem value="opportunity_promoted">Promoted</SelectItem>
                </SelectContent>
              </Select>
              {unreadCountValue > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  className="h-8 bg-white/90 hover:bg-white text-gray-900 border border-white/20"
                >
                  <CheckCheck className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Mark all read</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white text-gray-900"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 bg-white" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
            {isLoading ? (
              <div className="p-8 text-center text-gray-500 bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#161950] mx-auto mb-3"></div>
                <p style={{ fontFamily: "'Outfit', sans-serif" }}>Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 sm:p-12 text-center bg-white">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>No notifications</p>
                <p className="text-sm text-gray-400" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {filter === 'unread' ? 'You\'re all caught up!' : 'You don\'t have any notifications yet'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 bg-white">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 sm:p-5 hover:bg-gray-50 cursor-pointer transition-colors bg-white border-l-4 ${
                      !notification.is_read 
                        ? 'bg-blue-50/50 border-l-[#161950]' 
                        : 'border-l-transparent'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-bold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {notification.title}
                          </h4>
                          <Badge className={`text-xs font-semibold border ${getPriorityColor(notification.priority)}`} style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {notification.priority}
                          </Badge>
                          {!notification.is_read && (
                            <div className="w-2.5 h-2.5 bg-[#161950] rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2 leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          <span>
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                          {notification.related_entity_type && (
                            <>
                              <span>•</span>
                              <span className="capitalize font-medium">{notification.related_entity_type}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 flex-shrink-0 hover:bg-gray-200 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsReadMutation.mutate(notification.id);
                          }}
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4 text-gray-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 border-t-2 border-gray-200 bg-gray-50 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigate('/settings/notifications');
                setIsOpen(false);
              }}
              className="w-full hover:bg-gray-200 text-gray-700 font-medium"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Notification Settings
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

