import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { lookupByZipCode, getCitiesByState } from '@/utils/addressUtils';
import { US_STATES } from './accounts/components/CreateAccountModal/CreateAccountModal.constants';
import { getClientTypeColor, getClientTypeLabel } from '@/utils/accountUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAccountContacts, useAccountDetail, useAccounts } from '@/hooks/useAccounts';
import {  AccountUpdate, ContactFormData } from '@/types/accounts';
import { ArrowLeft, Building2, Save, X, Award, Edit, Users, Mail, Phone, Plus } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

const AccountEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    updateAccount,
    addContact,
    updateContact,
    deleteContact,
    promoteContactToPrimary,
    isUpdating,
    isAddingContact,
    isUpdatingContact,
    isDeletingContact,
    isPromotingContact,
  } = useAccounts();

  const { accountDetail: account, isAccountDetailLoading: isLoading, accountDetailError: error } = useAccountDetail(id || '');
  const { accountContacts: contactsResponse } = useAccountContacts(id || '');
  const [editForm, setEditForm] = useState<AccountUpdate>({});
  
  const [isZipLoading, setIsZipLoading] = useState(false);
  const [zipAutoFilled, setZipAutoFilled] = useState(false);
  const [zipError, setZipError] = useState<string>('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [showDeleteContactDialog, setShowDeleteContactDialog] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    title: '',
  });

  useEffect(() => {
    if (account && account.client_name) {
      setEditForm({
        client_name: account.client_name,
        company_website: account.company_website || '',
        client_address:
          account.client_address && typeof account.client_address === 'object'
            ? {
                line1: account.client_address.line1 || '',
                line2: account.client_address.line2 || '',
                pincode: account.client_address.pincode || undefined,
              }
            : {
                line1: '',
                line2: '',
                pincode: undefined,
              },
        client_type: account.client_type,
        market_sector: account.market_sector || '',
        notes: account.notes || '',
      });
    }
  }, [account]);

  const handleUpdateAccount = async () => {
    if (!account?.account_id) return;

    try {
      await updateAccount({ accountId: account.account_id, data: editForm });

      toast({
        title: '✅ Account Updated',
        description: 'Account information has been updated sucessfully.',
      });

        const urlId = account?.custom_id || account.account_id;
        navigate(`/module/accounts/${urlId}`);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'update failed. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
        navigate(`/module/accounts/${id}`);
  };

  const handleAddContact = () => {
    setContactForm({ name: '', email: '', phone: '', title: '' });
    setSelectedContactId(null);
    setShowAddContactModal(true);
  };

  const handleEditContact = (contact: any) => {
    setContactForm({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      title: contact.title || '',
    });
    setSelectedContactId(contact.contact_id);
    setShowEditContactModal(true);
  };

  const handleDeleteContact = (contactId: string) => {
    setSelectedContactId(contactId);
    setShowDeleteContactDialog(true);
  };

  const handlePromoteContactToPrimary = async (contactId: string, contactName: string) => {
    if (!account?.account_id) {
      toast({
        title: 'Error',
        description: 'Account not found.',
        variant: 'destructive',
      });
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to promote "${contactName}" to primary contact?\n\n` +
        `This will:\n` +
        `• Make "${contactName}" the primary contact\n` +
        `• Move the current primary contact to secondary contacts\n\n` +
        `This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await promoteContactToPrimary({
        accountId: account.account_id,
        contactId: contactId,
      });
    } catch (error: any) {
    }
  };

  const handleZipCodeChange = async (zipCode: string) => {
    setEditForm(prev => ({
      ...prev,
      client_address: {
        ...prev.client_address,
        line1: prev.client_address?.line1 || '',
        pincode: zipCode ? parseInt(zipCode) : undefined,
      },
    }));

    setZipError('');
    setZipAutoFilled(false);

    if (zipCode.length !== 5 || !/^\d{5}$/.test(zipCode)) {
      return;
    }

    setIsZipLoading(true);

    try {
      const result = lookupByZipCode(zipCode);

      if (result) {
        const cities = getCitiesByState(result.stateCode);
        setAvailableCities(cities);

        setEditForm(prev => ({
          ...prev,
          client_address: {
            ...prev.client_address,
            line1: prev.client_address?.line1 || '',
            city: result.city,
            state: result.state,
            pincode: parseInt(zipCode),
          },
        }));

        setZipAutoFilled(true);
        toast({
          title: '✓ Location Found',
          description: `City and State updated for ${zipCode}`,
        });
      } else {
        setZipError('ZIP code not found');
        setAvailableCities([]);
      }
    } catch (err) {
      setZipError('Error looking up ZIP code');
      setAvailableCities([]);
    } finally {
      setIsZipLoading(false);
    }
  };

  const handleStateChange = (state: string) => {
    const stateCode = Object.keys({
      Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
      Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', Florida: 'FL', Georgia: 'GA',
      Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA',
      Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD',
      Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO',
      Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
      'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH',
      Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
      'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT',
      Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY'
    }).find(key => key === state);

    if (stateCode) {
      const cities = getCitiesByState(stateCode);
      setAvailableCities(cities);
    }

    setEditForm(prev => ({
      ...prev,
      client_address: {
        ...prev.client_address,
        line1: prev.client_address?.line1 || '',
        state,
        city: '', // Reset city when state changes
      },
    }));
  };

  const submitAddContact = async () => {
    if (!account?.account_id) {
      toast({
        title: 'Error',
        description: 'Account not found.',
        variant: 'destructive',
      });
      return;
    }

    if (!contactForm.name?.trim() || !contactForm.email?.trim() || !contactForm.phone?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (Name, Email, Phone).',
        variant: 'destructive',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email.trim())) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    // USA phone number validation
    const usaPhoneRegex = /^(\+1\s?)?(\([0-9]{3}\)|[0-9]{3})[\s\-]?[0-9]{3}[\s\-]?[0-9]{4}$/;
    if (!usaPhoneRegex.test(contactForm.phone.trim())) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid USA phone number (e.g., (123) 456-7890, 123-456-7890, or 1234567890).',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addContact({
        accountId: account.account_id,
        contact: {
          contact:{
          name: contactForm.name.trim(),
          email: contactForm.email.trim(),
          phone: contactForm.phone.trim(),
          title: contactForm.title?.trim() || undefined,
        }},
      });

      toast({
        title: '✅ Contact Added',
        description: 'Contact has been added sucessfully.',
      });

      setShowAddContactModal(false);
      setContactForm({ name: '', email: '', phone: '', title: '' });
    } catch (e: any) {
      toast({
        title: 'Error',
        description:
          error.response?.data?.detail?.message || 'add failed. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const submitEditContact = async () => {
    if (!account?.account_id || !selectedContactId) {
      toast({
        title: 'Error',
        description: 'Account or contact not found.',
        variant: 'destructive',
      });
      return;
    }

    if (!contactForm.name?.trim() || !contactForm.email?.trim() || !contactForm.phone?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (Name, Email, Phone).',
        variant: 'destructive',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email.trim())) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    // USA phone number validation
    const usaPhoneRegex = /^(\+1\s?)?(\([0-9]{3}\)|[0-9]{3})[\s\-]?[0-9]{3}[\s\-]?[0-9]{4}$/;
    if (!usaPhoneRegex.test(contactForm.phone.trim())) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid USA phone number (e.g., (123) 456-7890, 123-456-7890, or 1234567890).',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateContact({
        accountId: account.account_id,
        contactId: selectedContactId,
        contact: {
          name: contactForm.name.trim(),
          email: contactForm.email.trim(),
          phone: contactForm.phone.trim(),
          title: contactForm.title?.trim() || undefined,
        },
      });

      toast({
        title: '✅ Contact Updated',
        description: 'Contact has been updated sucessfully.',
      });

      setShowEditContactModal(false);
      setContactForm({ name: '', email: '', phone: '', title: '' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error.response?.data?.detail?.message || 'update failed. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const confirmDeleteContact = async () => {
    if (!account?.account_id || !selectedContactId) {
      toast({
        title: 'Error',
        description: 'Account or contact not found.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await deleteContact({
        accountId: account.account_id,
        contactId: selectedContactId,
      });

      toast({
        title: '✅ Contact Deleted',
        description: 'Contact has been deleted successfully.',
      });

      setShowDeleteContactDialog(false);
    } catch (e: any) {
      toast({
        title: 'Error',
        description:
          error.response?.data?.detail?.message || 'delete failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSelectedContactId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/module/accounts">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Accounts
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <Logo className="h-8 w-auto" />
            </div>
          </div>
        </div>

        
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading account details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !account || !account.client_name) {
    return (
      <div className="min-h-screen">
        
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/module/accounts">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Accounts
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <Logo className="h-8 w-auto" />
            </div>
          </div>
        </div>

        
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-red-500 mb-4">
              <Building2 className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Account Not Found</h3>
            <p className="text-gray-600 mb-4">
              The account you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate('/module/accounts')}>Return to Accounts</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to={`/module/accounts/${id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Account
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <Logo className="h-8 w-auto" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                <Edit className="h-5 w-5 mr-2" />
                Edit Account - {account?.client_name || 'Loading...'}
              </h1>
              <p className="text-sm text-gray-500">Update account information</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleCancel} disabled={isUpdating}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleUpdateAccount} disabled={isUpdating || !editForm.client_name}>
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Avatar className="h-12 w-12 mr-4">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                  {editForm.client_name?.charAt(0) || account?.client_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl">
                  {editForm.client_name || account?.client_name || 'Loading...'}
                </h2>
                <div className="flex items-center mt-1">
                  <Badge
                    className={`mr-2 ${getClientTypeColor(editForm.client_type || account.client_type)}`}
                  >
                    <Award className="h-3 w-3 mr-1" />
                    {getClientTypeLabel(editForm.client_type || account.client_type)}
                  </Badge>
                  {(editForm.market_sector || account.market_sector) && (
                    <span className="text-sm text-gray-600">
                      {editForm.market_sector || account.market_sector}
                    </span>
                  )}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        
        <div className="space-y-8">
          
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update the primary account information and classification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="client-name">Client Name *</Label>
                  <Input
                    id="client-name"
                    value={editForm.client_name || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, client_name: e.target.value }))}
                    placeholder="Enter client name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Company Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={editForm.company_website || ''}
                    onChange={e =>
                      setEditForm(prev => ({ ...prev, company_website: e.target.value }))
                    }
                    placeholder="https://example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="client-type">Client Type *</Label>
                  <Select
                    value={editForm.client_type || ''}
                    onValueChange={value =>
                      setEditForm(prev => ({ ...prev, client_type: value as any }))
                    }
                  >
                    <SelectTrigger id="client-type" className="mt-1">
                      <SelectValue placeholder="Select client type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tier_1">Tier 1 - Premium</SelectItem>
                      <SelectItem value="tier_2">Tier 2 - Standard</SelectItem>
                      <SelectItem value="tier_3">Tier 3 - Basic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="market-sector">Market Sector</Label>
                  <Select
                    value={editForm.market_sector || 'none'}
                    onValueChange={value =>
                      setEditForm(prev => ({
                        ...prev,
                        market_sector: value === 'none' ? '' : value,
                      }))
                    }
                  >
                    <SelectTrigger id="market-sector" className="mt-1">
                      <SelectValue placeholder="Select market sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No sector selected</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Transportation">Transportation</SelectItem>
                      <SelectItem value="Energy">Energy</SelectItem>
                      <SelectItem value="Real Estate">Real Estate</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
              <CardDescription>Manage address information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address-line1">Address Line 1*</Label>
                    <Input
                      id="address-line1"
                      value={editForm.client_address?.line1 || ''}
                      onChange={e =>
                        setEditForm(prev => ({
                          ...prev,
                          client_address: {
                            ...prev.client_address,
                            line1: e.target.value,
                          },
                        }))
                      }
                      placeholder="Enter street address"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address-line2">Address Line 2</Label>
                    <Input
                      id="address-line2"
                      value={editForm.client_address?.line2 || ''}
                      onChange={e =>
                        setEditForm(prev => ({
                          ...prev,
                          client_address: {
                            ...prev.client_address,
                            line1: prev.client_address?.line1 || '',
                            line2: e.target.value,
                          },
                        }))
                      }
                      placeholder="Apartment, suite, etc. (optional)"
                      className="mt-1"
                    />
                  </div>

                  
                  <div>
                    <Label htmlFor="pincode">
                      ZIP Code* {isZipLoading && <span className="text-xs text-blue-600 ml-2">🔍 Looking up...</span>}
                    </Label>
                    <Input
                      id="pincode"
                      type="text"
                      maxLength={5}
                      value={editForm.client_address?.pincode || ''}
                      onChange={e => handleZipCodeChange(e.target.value)}
                      placeholder="Enter 5-digit ZIP code"
                      className={`mt-1 ${zipAutoFilled ? 'border-green-500 bg-green-50' : ''} ${zipError ? 'border-red-500' : ''}`}
                    />
                    {zipError && <p className="text-xs text-red-600 mt-1">{zipError}</p>}
                    {zipAutoFilled && (
                      <p className="text-xs text-green-600 mt-1">✓ City and State auto-filled</p>
                    )}
                  </div>

                  
                  <div>
                    <Label htmlFor="state">State*</Label>
                    <Select
                      value={editForm.client_address?.state || ''}
                      onValueChange={handleStateChange}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] overflow-y-auto">
                        {US_STATES.map(state => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  
                  <div>
                    <Label htmlFor="city">City*</Label>
                    {availableCities.length > 0 ? (
                      <Select
                        value={editForm.client_address?.city || ''}
                        onValueChange={value =>
                          setEditForm(prev => ({
                            ...prev,
                            client_address: {
                              ...prev.client_address,
                              line1: prev.client_address?.line1 || '',
                              city: value,
                            },
                          }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                          {availableCities.map(city => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="city"
                        value={editForm.client_address?.city || ''}
                        onChange={e =>
                          setEditForm(prev => ({
                            ...prev,
                            client_address: {
                              ...prev.client_address,
                              line1: prev.client_address?.line1 || '',
                              city: e.target.value,
                            },
                          }))
                        }
                        placeholder="Enter city name"
                        className="mt-1"
                      />
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {availableCities.length > 0
                        ? 'Select from available cities in this state'
                        : 'Enter ZIP code or select state to see city options'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          
          {account &&
            (account.primary_contact ||
              (account.secondary_contacts && account.secondary_contacts.length > 0)) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Contacts (
                      {(account.primary_contact ? 1 : 0) +
                        (account.secondary_contacts?.length || 0)}
                      )
                    </div>
                    <Button variant="outline" size="sm" onClick={handleAddContact}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Contact
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    View and manage all contacts associated with this account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    
                    {account.primary_contact && (
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                              {account.primary_contact.name
                                ?.split(' ')
                                ?.map((n: string) => n[0])
                                ?.join('')
                                ?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">
                                {account.primary_contact.name}
                              </h4>
                              <Badge variant="default" className="text-xs bg-blue-600">
                                PRIMARY
                              </Badge>
                              {account.primary_contact.title && (
                                <Badge variant="secondary" className="text-xs">
                                  {account.primary_contact.title}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{account.primary_contact.email}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{account.primary_contact.phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditContact(account.primary_contact)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    
                    {account.secondary_contacts?.map((contact, index) => (
                      <div
                        key={contact.contact_id || index}
                        className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-medium">
                              {contact.name
                                ?.split(' ')
                                ?.map((n: string) => n[0])
                                ?.join('')
                                ?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">{contact.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                SECONDARY
                              </Badge>
                              {contact.title && (
                                <Badge variant="secondary" className="text-xs">
                                  {contact.title}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{contact.email}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{contact.phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditContact(contact)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handlePromoteContactToPrimary(contact.contact_id, contact.name);
                            }}
                            disabled={isPromotingContact}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Promote to Primary Contact"
                          >
                            {isPromotingContact ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            ) : (
                              <Award className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteContact(contact.contact_id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          
          <Card>
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
              <CardDescription>
                Add any internal notes or observations about this account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={editForm.notes || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any internal notes about this account..."
                  rows={5}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <Button variant="outline" onClick={handleCancel} disabled={isUpdating}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleUpdateAccount} disabled={isUpdating || !editForm.client_name}>
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      
      <Dialog open={showAddContactModal} onOpenChange={setShowAddContactModal}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Add a new contact to this account. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="contact-name">Name *</Label>
              <Input
                id="contact-name"
                value={contactForm.name}
                onChange={e => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Contact full name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="contact-email">Email *</Label>
              <Input
                id="contact-email"
                type="email"
                value={contactForm.email}
                onChange={e => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contact@company.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="contact-phone">Phone *</Label>
              <Input
                id="contact-phone"
                value={contactForm.phone}
                onChange={e => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(123) 456-7890"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="contact-title">Job Title</Label>
              <Input
                id="contact-title"
                value={contactForm.title}
                onChange={e => setContactForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Manager, Director, etc."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddContactModal(false)}
              disabled={isAddingContact}
            >
              Cancel
            </Button>
            <Button
              onClick={submitAddContact}
              disabled={
                isAddingContact ||
                !contactForm.name?.trim() ||
                !contactForm.email?.trim() ||
                !contactForm.phone?.trim()
              }
            >
              {isAddingContact ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                'Add Contact'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
      <Dialog open={showEditContactModal} onOpenChange={setShowEditContactModal}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update contact information. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="edit-contact-name">Name *</Label>
              <Input
                id="edit-contact-name"
                value={contactForm.name}
                onChange={e => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Contact full name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-contact-email">Email *</Label>
              <Input
                id="edit-contact-email"
                type="email"
                value={contactForm.email}
                onChange={e => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contact@company.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-contact-phone">Phone *</Label>
              <Input
                id="edit-contact-phone"
                value={contactForm.phone}
                onChange={e => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(123) 456-7890"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-contact-title">Job Title</Label>
              <Input
                id="edit-contact-title"
                value={contactForm.title}
                onChange={e => setContactForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Manager, Director, etc."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditContactModal(false)}
              disabled={isUpdatingContact}
            >
              Cancel
            </Button>
            <Button
              onClick={submitEditContact}
              disabled={
                isUpdatingContact ||
                !contactForm.name?.trim() ||
                !contactForm.email?.trim() ||
                !contactForm.phone?.trim()
              }
            >
              {isUpdatingContact ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Contact'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
      <AlertDialog open={showDeleteContactDialog} onOpenChange={setShowDeleteContactDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this contact?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contact and remove all
              associated information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingContact}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteContact}
              disabled={isDeletingContact}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingContact ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                'Delete Contact'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AccountEdit;
