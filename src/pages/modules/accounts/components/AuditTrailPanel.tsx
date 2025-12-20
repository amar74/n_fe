import { useState, useEffect } from 'react';
import { History, User, Clock, FileText, AlertCircle, CheckCircle2, XCircle, RefreshCw, Loader2 } from 'lucide-react';
import { apiClient } from '@/services/api/client';

interface AuditLog {
  id: string;
  account_id: string;
  action: string; // Backend uses 'action' field
  user_id: string | null;
  changes: Record<string, { old_value: any; new_value: any }> | null;
  summary: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface AuditTrailPanelProps {
  accountId: string;
}

export function AuditTrailPanel({ accountId }: AuditTrailPanelProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<string>('all');

  useEffect(() => {
    loadAuditTrail();
  }, [accountId, actionFilter]);

  const loadAuditTrail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (actionFilter !== 'all') {
        params.append('action', actionFilter);
      }
      
      const response = await apiClient.get(`/accounts/${accountId}/audit-trail?${params.toString()}`);
      // Backend returns array directly or wrapped in logs
      const logs = Array.isArray(response.data) ? response.data : (response.data.logs || response.data.audit_logs || []);
      setAuditLogs(logs);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load audit trail');
      console.error('Error loading audit trail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create') || actionLower.includes('ACCOUNT_CREATE')) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
    if (actionLower.includes('update') || actionLower.includes('ACCOUNT_UPDATE')) {
      return <RefreshCw className="w-4 h-4 text-blue-600" />;
    }
    if (actionLower.includes('delete') || actionLower.includes('ACCOUNT_DELETE')) {
      return <XCircle className="w-4 h-4 text-red-600" />;
    }
    if (actionLower.includes('approve') || actionLower.includes('ACCOUNT_APPROVE')) {
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    }
    if (actionLower.includes('decline') || actionLower.includes('ACCOUNT_DECLINE')) {
      return <XCircle className="w-4 h-4 text-amber-600" />;
    }
    return <FileText className="w-4 h-4 text-gray-600" />;
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'update':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'delete':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'approve':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'decline':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatFieldName = (field: string) => {
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading && auditLogs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-gray-600">Loading audit trail...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-6">
        <div className="flex items-center gap-3 text-red-800">
          <AlertCircle className="w-5 h-5" />
          <div>
            <h3 className="font-semibold">Error Loading Audit Trail</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-indigo-50 border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Audit Trail</h3>
              <p className="text-gray-600 text-sm">Complete change history for this account</p>
            </div>
          </div>
          <button
            onClick={loadAuditTrail}
            disabled={isLoading}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
            title="Refresh audit trail"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Actions</option>
            <option value="create">Created</option>
            <option value="update">Updated</option>
            <option value="delete">Deleted</option>
            <option value="approve">Approved</option>
            <option value="decline">Declined</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        {auditLogs.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No audit logs found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getActionIcon(log.action || '')}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getActionColor(log.action || '')}`}>
                          {(log.action || 'UNKNOWN').replace(/_/g, ' ').toUpperCase()}
                        </span>
                        {log.summary && (
                          <span className="text-sm font-medium text-gray-900">{log.summary}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(log.created_at || new Date()).toLocaleString()}</span>
                        </div>
                        {log.user_id && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>User: {log.user_id.slice(0, 8)}...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {log.changes && Object.keys(log.changes).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Field Changes:</h4>
                    <div className="space-y-2">
                      {Object.entries(log.changes).map(([field, change]) => {
                        // Backend returns {old_value, new_value} structure
                        const oldValue = change?.old_value;
                        const newValue = change?.new_value;
                        
                        return (
                          <div key={field} className="bg-gray-50 rounded-lg p-3">
                            <div className="text-sm font-medium text-gray-900 mb-2">
                              {formatFieldName(field)}
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="text-gray-500">Old Value:</span>
                                <p className="text-gray-700 font-medium mt-1">
                                  {oldValue !== null && oldValue !== undefined
                                    ? String(oldValue)
                                    : <span className="text-gray-400 italic">Not set</span>}
                                </p>
                              </div>
                              <div>
                                <span className="text-indigo-600">New Value:</span>
                                <p className="text-indigo-900 font-semibold mt-1">
                                  {newValue !== null && newValue !== undefined
                                    ? String(newValue)
                                    : <span className="text-gray-400 italic">Not set</span>}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

