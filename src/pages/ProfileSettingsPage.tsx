import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/api/client';
import { authManager } from '@/services/auth';
import { loadGoogleMaps } from '@/lib/google-maps-loader';

export default function ProfileSettingsPage() {
  const { user, backendUser } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    timezone: 'America/New_York',
    language: 'en',
  });

  // Update form when backendUser or user changes - Load all saved data
  useEffect(() => {
    if (backendUser || user) {
      setFormData(prev => ({
        ...prev,
        name: String(backendUser?.name || ''),
        email: String(user?.email || (backendUser as any)?.email || ''),
        phone: String((backendUser as any)?.phone || ''),
        bio: String((backendUser as any)?.bio || ''),
        address: String((backendUser as any)?.address || ''),
        city: String((backendUser as any)?.city || ''),
        state: String((backendUser as any)?.state || ''),
        zipCode: String((backendUser as any)?.zip_code || ''),
        country: String((backendUser as any)?.country || 'United States'),
        timezone: String((backendUser as any)?.timezone || 'America/New_York'),
        language: String((backendUser as any)?.language || 'en'),
      }));
    }
  }, [backendUser, user]);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    const initAutocomplete = async () => {
      try {
        await loadGoogleMaps({ libraries: ['places'] });
        
        if (addressInputRef.current && typeof (window as any).google !== 'undefined') {
          const autocomplete = new (window as any).google.maps.places.Autocomplete(addressInputRef.current, {
            componentRestrictions: { country: 'us' },
            fields: ['address_components', 'formatted_address'],
            types: ['address'],
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.address_components) return;

            let street = '';
            let city = '';
            let state = '';
            let zipCode = '';

            place.address_components.forEach((component: any) => {
              const types = component.types;
              
              if (types.includes('street_number')) {
                street = component.long_name + ' ';
              }
              if (types.includes('route')) {
                street += component.long_name;
              }
              if (types.includes('locality')) {
                city = component.long_name;
              }
              if (types.includes('administrative_area_level_1')) {
                state = component.short_name;
              }
              if (types.includes('postal_code')) {
                zipCode = component.long_name;
              }
            });

            setFormData(prev => ({
              ...prev,
              address: street || place.formatted_address || '',
              city: city,
              state: state,
              zipCode: zipCode,
            }));

            if (city && state) {
              toast({
                title: 'Address Found',
                description: `${city}, ${state} ${zipCode}`,
              });
            }
          });
        }
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
      }
    };

    initAutocomplete();
  }, [toast]);

  // Phone number formatting for USA
  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    const limitedNumber = phoneNumber.slice(0, 11);
    
    if (limitedNumber.length === 0) return '';
    if (limitedNumber.length <= 1) return `+${limitedNumber}`;
    if (limitedNumber.length <= 4) return `+${limitedNumber.slice(0, 1)} ${limitedNumber.slice(1)}`;
    if (limitedNumber.length <= 7) return `+${limitedNumber.slice(0, 1)} ${limitedNumber.slice(1, 4)}-${limitedNumber.slice(4)}`;
    return `+${limitedNumber.slice(0, 1)} ${limitedNumber.slice(1, 4)}-${limitedNumber.slice(4, 7)}-${limitedNumber.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const isValidPhone = (phone: string) => {
    if (!phone) return true;
    const phoneRegex = /^\+1 \d{3}-\d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
  });

  const getInitials = () => {
    const email = user?.email || '';
    const name = backendUser?.name || (typeof email === 'string' ? email.split('@')[0] : '') || 'U';
    return String(name).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Fetch city and state from ZIP code
  const handleZipCodeChange = async (zipCode: string) => {
    const numericZip = zipCode.replace(/\D/g, '').slice(0, 5);
    setFormData(prev => ({ ...prev, zipCode: numericZip }));

    if (numericZip.length === 5) {
      try {
        const response = await fetch(`https://api.zippopotam.us/us/${numericZip}`);
        if (response.ok) {
          const data = await response.json();
          if (data.places && data.places.length > 0) {
            const place = data.places[0];
            setFormData(prev => ({
              ...prev,
              city: place['place name'] || '',
              state: place['state abbreviation'] || '',
              zipCode: numericZip,
            }));
            toast({
              title: 'Location Found',
              description: `${place['place name']}, ${place['state abbreviation']}`,
            });
          }
        }
      } catch (error) {
        console.log('ZIP code lookup failed:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.phone && !isValidPhone(formData.phone)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid US phone number in format +1 XXX-XXX-XXXX',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);

    try {
      const response = await apiClient.put('/auth/profile', {
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        country: formData.country,
        timezone: formData.timezone,
        language: formData.language,
      });

      if (response.data) {
        authManager.setAuthState(true, {
          ...backendUser,
          ...response.data,
        });
      }
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: 'Update Failed',
        description: error.response?.data?.detail || 'Profile update failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      
      <div className="relative bg-[#161950] overflow-hidden">
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
              <h1 className="text-4xl font-extrabold mb-3 tracking-tight leading-tight !text-white" style={{ color: 'white' }}>
                Edit Profile
              </h1>
              <p className="text-lg font-medium leading-relaxed !text-white" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Manage your account settings and preferences
              </p>
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
                      {String(backendUser?.name || (typeof user?.email === 'string' ? user.email.split('@')[0] : '') || 'User')}
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

                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                        Brief Description
                      </Label>
                      <textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell us a bit about yourself..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#161950] focus:ring-[#161950] focus:ring-2 focus:ring-offset-0"
                      />
                      <p className="text-xs text-gray-500">
                        Brief description about yourself (optional)
                      </p>
                    </div>

                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Phone Number (USA)
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          placeholder="+1 555-555-5555"
                          maxLength={16}
                          className="pl-10 border-gray-200 focus:border-[#161950] focus:ring-[#161950]"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Format: +1 XXX-XXX-XXXX (13 digits)
                      </p>
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
                          value={String(backendUser?.role || 'Member')}
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

              {/* Address Information Card */}
              <Card className="border border-gray-100 shadow-md">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl font-bold flex items-center gap-2 tracking-tight leading-tight">
                    <MapPin className="h-5 w-5 text-[#161950]" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                        Street Address
                      </Label>
                      <Input
                        ref={addressInputRef}
                        id="address"
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Start typing your address..."
                        className="border-gray-200 focus:border-[#161950] focus:ring-[#161950]"
                        autoComplete="off"
                      />
                      <p className="text-xs text-gray-500">
                        Start typing to see address suggestions from Google Maps
                      </p>
                    </div>

                    
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                        City
                      </Label>
                      <Input
                        id="city"
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="New York"
                        className="border-gray-200 focus:border-[#161950] focus:ring-[#161950]"
                      />
                    </div>

                    
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                        State
                      </Label>
                      <Input
                        id="state"
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                        placeholder="NY"
                        maxLength={2}
                        className="border-gray-200 focus:border-[#161950] focus:ring-[#161950] uppercase"
                      />
                      <p className="text-xs text-gray-500">
                        2-letter state code (e.g., NY, CA)
                      </p>
                    </div>

                    
                    <div className="space-y-2">
                      <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">
                        ZIP Code
                      </Label>
                      <Input
                        id="zipCode"
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => handleZipCodeChange(e.target.value)}
                        placeholder="10001"
                        maxLength={5}
                        className="border-gray-200 focus:border-[#161950] focus:ring-[#161950]"
                      />
                      <p className="text-xs text-gray-500">
                        5-digit ZIP code - City and State will auto-fill
                      </p>
                    </div>

                    
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                        Country
                      </Label>
                      <Input
                        id="country"
                        type="text"
                        value={formData.country}
                        disabled
                        className="bg-gray-50 cursor-not-allowed border-gray-200"
                      />
                      <p className="text-xs text-gray-500">
                        Currently only USA is supported
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
                    <ChangePasswordDialog />
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

function ChangePasswordDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both password fields match.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.newPassword.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/auth/change-password', null, {
        params: {
          current_password: formData.currentPassword,
          new_password: formData.newPassword,
        }
      });

      toast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully.',
      });
      
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setOpen(false);
    } catch (error: any) {
      console.error('Password change error:', error);
      toast({
        title: 'Failed to Change Password',
        description: error.response?.data?.detail || 'Please check your current password and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-[#161950] text-[#161950] hover:bg-[#161950] hover:text-white">
          Change
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="Enter current password"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="Enter new password (min 8 characters)"
                required
                minLength={8}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">Must be at least 8 characters long</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#161950] hover:bg-[#161950]/90 text-white"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
