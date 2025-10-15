import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Shield, 
  Camera,
  Phone,
  MapPin,
  Globe,
  Clock,
  Bell,
  Lock,
  Trash2,
  AlertTriangle,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function ProfileSettingsPage() {
  const { user, backendUser } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const [formData, setFormData] = useState({
    name: backendUser?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    timezone: 'America/New_York',
    language: 'en',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
  });

  const getInitials = () => {
    const email = user?.email || '';
    const name = backendUser?.name || email.split('@')[0] || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // TODO: Implement profile update API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated sucessfully.',
      });
    } catch (e) {
      toast({
        title: 'Update Failed',
        description: 'update failed. please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      
      <div className="relative bg-[#161950] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link 
            to="/profile" 
            className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold mb-3 tracking-tight leading-tight">Edit Profile</h1>
              <p className="text-white/95 text-lg font-medium leading-relaxed">Manage your account settings and preferences</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-white/30">
                <Shield className="h-3 w-3 mr-1" />
                {backendUser?.role || 'Member'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              
              <Card className="border border-gray-100 shadow-md">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl font-bold flex items-center gap-2 tracking-tight leading-tight">
                    <Camera className="h-5 w-5 text-[#161950]" />
                    Profile Picture
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <div className="w-32 h-32 rounded-2xl bg-[#161950] flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                        {getInitials()}
                      </div>
                      <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border-2 border-gray-100">
                        <Camera className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 text-center mb-1 tracking-tight leading-tight">
                      {backendUser?.name || user?.email?.split('@')[0] || 'User'}
                    </h3>
                    <p className="text-base text-gray-600 text-center mb-4 font-medium tracking-tight">{user?.email}</p>
                    <Button variant="outline" size="sm" className="w-full border-[#161950] text-[#161950] hover:bg-[#161950] hover:text-white">
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-3">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </CardContent>
              </Card>

              
              <Card className="border border-gray-100 shadow-md">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Account Status</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-green-600">Active</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Role</span>
                      <Badge className="bg-[#161950]/10 text-[#161950] border-[#161950]/20">
                        {backendUser?.role || 'Member'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Email Verified</span>
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <Card className="border border-gray-100 shadow-md">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl font-bold flex items-center gap-2 tracking-tight leading-tight">
                    <User className="h-5 w-5 text-[#161950]" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        className="border-gray-200 focus:border-[#161950] focus:ring-[#161950]"
                      />
                    </div>

                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                          className="pl-10 border-gray-200 focus:border-[#161950] focus:ring-[#161950]"
                        />
                      </div>
                    </div>

                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          disabled
                          className="pl-10 bg-gray-50 cursor-not-allowed border-gray-200"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Email cannot be changed. Contact support if you need assistance.
                      </p>
                    </div>

                    
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                        Location
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="location"
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="City, Country"
                          className="pl-10 border-gray-200 focus:border-[#161950] focus:ring-[#161950]"
                        />
                      </div>
                    </div>

                    
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                        Role
                      </Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="role"
                          type="text"
                          value={backendUser?.role || 'Member'}
                          disabled
                          className="pl-10 bg-gray-50 cursor-not-allowed capitalize border-gray-200"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Your role is assigned by your organization administrator
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              
              <Card className="border border-gray-100 shadow-md">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2 tracking-tight">
                    <Globe className="h-5 w-5 text-[#161950]" />
                    Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="space-y-2">
                      <Label htmlFor="timezone" className="text-sm font-medium text-gray-700">
                        Timezone
                      </Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                          id="timezone"
                          value={formData.timezone}
                          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:border-[#161950] focus:ring-[#161950] focus:ring-2 focus:ring-offset-0"
                        >
                          <option value="America/New_York">Eastern Time (ET)</option>
                          <option value="America/Chicago">Central Time (CT)</option>
                          <option value="America/Denver">Mountain Time (MT)</option>
                          <option value="America/Los_Angeles">Pacific Time (PT)</option>
                          <option value="Europe/London">London (GMT)</option>
                          <option value="Europe/Paris">Paris (CET)</option>
                          <option value="Asia/Tokyo">Tokyo (JST)</option>
                        </select>
                      </div>
                    </div>

                    
                    <div className="space-y-2">
                      <Label htmlFor="language" className="text-sm font-medium text-gray-700">
                        Language
                      </Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                          id="language"
                          value={formData.language}
                          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:border-[#161950] focus:ring-[#161950] focus:ring-2 focus:ring-offset-0"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="zh">Chinese</option>
                          <option value="ja">Japanese</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              
              <Card className="border border-gray-100 shadow-md">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2 tracking-tight">
                    <Bell className="h-5 w-5 text-[#161950]" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-600">Receive email updates about your account activity</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifications({ ...notifications, emailNotifications: !notifications.emailNotifications })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.emailNotifications ? 'bg-[#161950]' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Push Notifications</h4>
                        <p className="text-sm text-gray-600">Receive push notifications on your devices</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifications({ ...notifications, pushNotifications: !notifications.pushNotifications })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.pushNotifications ? 'bg-[#161950]' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Weekly Digest</h4>
                        <p className="text-sm text-gray-600">Receive a weekly summary of your activity</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifications({ ...notifications, weeklyDigest: !notifications.weeklyDigest })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.weeklyDigest ? 'bg-[#161950]' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications.weeklyDigest ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              
              <div className="flex items-center justify-end gap-4 pt-4">
                <Link to="/profile">
                  <Button type="button" variant="outline" className="border-gray-300">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={isUpdating}
                  className="bg-[#161950] hover:bg-[#161950]/90 text-white"
                >
                  {isUpdating ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>

            
            <Card className="border border-gray-100 shadow-md">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 tracking-tight">
                  <Lock className="h-5 w-5 text-[#161950]" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-[#161950] transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Lock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Change Password</h4>
                        <p className="text-sm text-gray-600">Update your account password</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-[#161950] text-[#161950] hover:bg-[#161950] hover:text-white">
                      Change
                    </Button>
                  </div>

                  
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-[#161950] transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <Shield className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">Add an extra layer of security</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-[#161950] text-[#161950] hover:bg-[#161950] hover:text-white">
                      Enable
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            
            <Card className="border border-red-200 shadow-md">
              <CardHeader className="border-b border-red-100 bg-red-50">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-red-700 tracking-tight">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Delete Account</h4>
                      <p className="text-sm text-gray-600">
                        Permanently delete your account and all associated data
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        This action cannot be undone
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-red-300 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
