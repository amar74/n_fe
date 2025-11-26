import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Trash2, 
  Eye, 
  Send, 
  Building2, 
  Users,
  ChevronDown,
  ChevronRight,
  Save,
  ArrowLeft,
  List
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/services/api/client';

interface SurveyQuestion {
  id: string;
  type: 'multiple_choice' | 'rating' | 'text' | 'yes_no' | 'long_text' | 'number' | 'date';
  title: string;
  options?: string[];
  required: boolean;
  order: number;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  title?: string | null;
}

interface AccountWithContacts {
  id: string;
  name: string;
  client_type: string;
  market_sector: string | null;
  contacts: Contact[];
}

interface SurveyFormData {
  title: string;
  description: string;
  questions: SurveyQuestion[];
  targetAccounts: string[];
  targetContacts: string[];
}

const questionTypes = [
  { value: 'multiple_choice', label: 'Multiple Choice', icon: '○' },
  { value: 'rating', label: 'Rating Scale', icon: '⭐' },
  { value: 'text', label: 'Short Text', icon: 'T' },
  { value: 'long_text', label: 'Long Text', icon: '¶' },
  { value: 'yes_no', label: 'Yes/No', icon: '☑' },
  { value: 'number', label: 'Number', icon: '#' },
  { value: 'date', label: 'Date', icon: '📅' }
];

export default function SurveyBuilderPage() {
  const navigate = useNavigate();
  const { surveyId } = useParams<{ surveyId: string }>();
  const [formData, setFormData] = useState<SurveyFormData>({
    title: '',
    description: '',
    questions: [],
    targetAccounts: [],
    targetContacts: []
  });
  
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [accounts, setAccounts] = useState<AccountWithContacts[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    loadAccountsWithContacts();
    if (surveyId) {
      setIsEditMode(true);
      loadSurveyData(surveyId);
    }
  }, [surveyId]);

  // Load accounts with their contacts from the survey-specific endpoint
  const loadAccountsWithContacts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<AccountWithContacts[]>('/surveys/accounts');
      setAccounts(response.data);
      console.log('Loaded accounts with contacts:', response.data);
    } catch (error: any) {
      console.error('Error loading accounts:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      
      // Log full validation error details
      if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
        console.error('Validation errors:', JSON.stringify(error.response.data.detail, null, 2));
      }
      
      toast.error(`Failed to load accounts: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load existing survey data for editing
  const loadSurveyData = async (id: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/surveys/${id}`);
      const survey = response.data;
      
      // Map backend questions to frontend format
      const questions = (survey.questions || []).map((q: any, index: number) => ({
        id: q.id || Date.now().toString() + index,
        type: q.type,
        title: q.headline || q.title || '',
        options: q.options || undefined,
        required: q.required || false,
        order: index + 1
      }));

      setFormData({
        title: survey.title || '',
        description: survey.description || '',
        questions: questions,
        targetAccounts: [],
        targetContacts: []
      });

      toast.success('Survey loaded for editing');
    } catch (error: any) {
      console.error('Error loading survey:', error);
      toast.error('Failed to load survey');
      navigate('/surveys');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = (type: string) => {
    const newQuestion: SurveyQuestion = {
      id: Date.now().toString(),
      type: type as any,
      title: '',
      options: type === 'multiple_choice' ? ['', ''] : undefined,
      required: false,
      order: formData.questions.length + 1
    };
    
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (id: string, updates: Partial<SurveyQuestion>) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === id ? { ...q, ...updates } : q
      )
    }));
  };

  const removeQuestion = (id: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  const addOption = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { ...q, options: [...(q.options || []), ''] }
          : q
      )
    }));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              options: q.options?.map((opt, idx) => 
                idx === optionIndex ? value : opt
              )
            }
          : q
      )
    }));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              options: q.options?.filter((_, idx) => idx !== optionIndex)
            }
          : q
      )
    }));
  };

  const toggleAccount = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    const isCurrentlySelected = formData.targetAccounts.includes(accountId);
    
    setFormData(prev => {
      if (isCurrentlySelected) {
        // Deselecting account - remove account and all its contacts
        const contactIdsToRemove = account?.contacts.map(c => c.id) || [];
        return {
          ...prev,
          targetAccounts: prev.targetAccounts.filter(id => id !== accountId),
          targetContacts: prev.targetContacts.filter(id => !contactIdsToRemove.includes(id))
        };
      } else {
        // Selecting account - add account and all its contacts
        const contactIdsToAdd = account?.contacts.map(c => c.id) || [];
        return {
          ...prev,
          targetAccounts: [...prev.targetAccounts, accountId],
          targetContacts: [...new Set([...prev.targetContacts, ...contactIdsToAdd])]
        };
      }
    });
  };

  const toggleContact = (contactId: string) => {
    setFormData(prev => ({
      ...prev,
      targetContacts: prev.targetContacts.includes(contactId)
        ? prev.targetContacts.filter(id => id !== contactId)
        : [...prev.targetContacts, contactId]
    }));
  };

  const toggleAccountExpansion = (accountId: string) => {
    setExpandedAccounts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  const selectAllContacts = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account || account.contacts.length === 0) return;

    const allContactIds = account.contacts.map(c => c.id);
    const isAllSelected = allContactIds.every(id => formData.targetContacts.includes(id));

    if (isAllSelected) {
      // Deselect all contacts from this account
      setFormData(prev => ({
        ...prev,
        targetContacts: prev.targetContacts.filter(id => !allContactIds.includes(id))
      }));
    } else {
      // Select all contacts from this account
      setFormData(prev => ({
        ...prev,
        targetContacts: [...new Set([...prev.targetContacts, ...allContactIds])]
      }));
    }
  };

  const handlePreview = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a survey title');
      return;
    }
    
    if (formData.questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    // Navigate to preview page with form data
    navigate('/surveys/preview', { state: formData });
  };

  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a survey title');
      return;
    }
    
    if (formData.questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    try {
      setIsSaving(true);
      
      const surveyData = {
        title: formData.title,
        description: formData.description,
        survey_type: 'customer_satisfaction',
        questions: formData.questions.map(q => ({
          id: q.id,
          type: q.type,
          headline: q.title,
          required: q.required,
          options: q.options
        }))
      };

      if (isEditMode && surveyId) {
        // Update existing survey
        const response = await apiClient.patch(`/surveys/${surveyId}`, surveyData);
        if (response.status === 200 || response.status === 201) {
          toast.success('Survey updated successfully!');
        }
      } else {
        // Create new survey
        const response = await apiClient.post('/surveys', surveyData);
        if (response.status === 200 || response.status === 201) {
          toast.success('Survey saved as draft successfully!');
        }
      }
    } catch (error: any) {
      console.error('Error saving survey:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.detail || 'Failed to save survey');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a survey title');
      return;
    }
    
    if (formData.questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    if (formData.targetAccounts.length === 0 && formData.targetContacts.length === 0) {
      toast.error('Please select at least one target account or contact');
      return;
    }

    try {
      setIsPublishing(true);
      
      // Step 1: Create the survey
      const surveyData = {
        title: formData.title,
        description: formData.description,
        survey_type: 'customer_satisfaction',
        questions: formData.questions.map(q => ({
          id: q.id,
          type: q.type,
          headline: q.title,
          required: q.required,
          options: q.options
        }))
      };

      const createResponse = await apiClient.post('/surveys', surveyData);

      if (createResponse.status !== 200 && createResponse.status !== 201) {
        toast.error(createResponse.data?.detail || 'Failed to create survey');
        return;
      }

      const surveyId = createResponse.data.id;
      
      // Step 2: Distribute the survey to selected accounts/contacts
      const distributionData = {
        survey_id: surveyId,
        account_ids: formData.targetAccounts,
        contact_ids: formData.targetContacts
      };

      const distributeResponse = await apiClient.post(
        `/surveys/${surveyId}/distribute`,
        distributionData
      );

      if (distributeResponse.status === 200 || distributeResponse.status === 201) {
        toast.success('Survey created and distributed successfully!');
        navigate('/surveys');
      } else {
        toast.error(distributeResponse.data?.detail || 'Failed to distribute survey');
      }
    } catch (error: any) {
      console.error('Error creating/distributing survey:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.detail || 'Failed to create or distribute survey');
    } finally {
      setIsPublishing(false);
    }
  };

  const getTotalRecipients = () => {
    let total = 0;
    const contactsFromSelectedAccounts = new Set<string>();
    
    // Count contacts from selected accounts
    formData.targetAccounts.forEach(accountId => {
      const account = accounts.find(acc => acc.id === accountId);
      if (account) {
        account.contacts.forEach(contact => {
          contactsFromSelectedAccounts.add(contact.id);
        });
      }
    });
    
    // Count all unique contacts (avoid double counting)
    const uniqueContacts = new Set([
      ...contactsFromSelectedAccounts,
      ...formData.targetContacts
    ]);
    
    return uniqueContacts.size;
  };

  const getSelectedAccountsCount = () => {
    return formData.targetAccounts.length;
  };

  return (
    <div className="w-full h-full bg-[#F5F3F2] font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm font-normal font-outfit leading-tight">Dashboard</span>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">/</span>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">Survey Builder</span>
            </div>
            <h1 className="text-[#1A1A1A] text-3xl font-semibold font-outfit leading-loose">
              {isEditMode ? 'Edit Survey' : 'Survey Builder'}
            </h1>
            <p className="text-[#667085] text-sm font-normal font-outfit leading-tight">Create engaging surveys to gather valuable client feedback</p>
          </div>
          
          <Button
            variant="outline"
            className="h-11 border border-gray-300 hover:border-indigo-500 hover:bg-indigo-50"
            onClick={() => navigate('/surveys')}
          >
            <List className="h-4 w-4 mr-2" />
            View All Surveys
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-white rounded-2xl border border-gray-200 flex flex-col gap-6">
              <div className="flex justify-start items-start gap-6">
                <div className="flex-1 flex flex-col gap-1">
                  <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7">Survey Details</h2>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[#344054] text-sm font-medium font-outfit mb-2">Survey Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter survey title"
                    className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[#344054] text-sm font-medium font-outfit mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter survey description"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-gray-200 flex flex-col gap-6">
              <div className="flex justify-start items-start gap-6">
                <div className="flex-1 flex flex-col gap-1">
                  <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7">Add Question</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {questionTypes.map(type => (
                  <Button
                    key={type.value}
                    variant="outline"
                    className="h-16 flex flex-col items-center gap-2 border border-gray-300 hover:border-indigo-500 hover:bg-indigo-50"
                    onClick={() => addQuestion(type.value)}
                  >
                    <span className="text-xl">{type.icon}</span>
                    <span className="text-xs font-medium">{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {formData.questions.length > 0 && (
              <div className="p-6 bg-white rounded-2xl border border-gray-200 flex flex-col gap-6">
                <div className="flex justify-start items-start gap-6">
                  <div className="flex-1 flex flex-col gap-1">
                    <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7">Questions ({formData.questions.length})</h2>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  {formData.questions.map((question, index) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">{index + 1}</Badge>
                          <span className="text-sm font-medium text-gray-700">
                            {questionTypes.find(t => t.value === question.type)?.label}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Input
                        value={question.title}
                        onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
                        placeholder="Enter question text"
                        className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      
                      {question.type === 'multiple_choice' && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex gap-2">
                              <Input
                                value={option}
                                onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                placeholder={`Option ${optIndex + 1}`}
                                className="flex-1 h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(question.id, optIndex)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(question.id)}
                            className="border border-gray-300 hover:border-indigo-500 hover:bg-indigo-50"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`required-${question.id}`}
                          checked={question.required}
                          onCheckedChange={(checked) => 
                            updateQuestion(question.id, { required: !!checked })
                          }
                        />
                        <label htmlFor={`required-${question.id}`} className="text-sm text-gray-700">
                          Required question
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-white rounded-2xl border border-gray-200 flex flex-col gap-6">
              <div className="flex justify-between items-start gap-6">
                <div className="flex-1 flex flex-col gap-1">
                  <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7">Survey Distribution Setup</h2>
                  <p className="text-[#667085] text-sm font-normal font-outfit leading-tight">
                    Select specific contacts from your target accounts who will receive this survey
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadAccountsWithContacts}
                  disabled={loading}
                  className="hover:bg-gray-100"
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
              <div className="flex flex-col gap-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading accounts...</p>
                  </div>
                ) : accounts.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No accounts available</p>
                ) : (
                  accounts.map(account => {
                    const accountId = account.id;
                    const contacts = account.contacts || [];
                    
                    return (
                      <div key={accountId} className="border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <Building2 className="h-5 w-5 text-gray-400" />
                            <div>
                              <h3 className="font-medium text-gray-900">{account.name}</h3>
                              <p className="text-sm text-gray-500">
                                {account.market_sector || 'N/A'} • {account.client_type}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={formData.targetAccounts.includes(accountId)}
                              onCheckedChange={() => toggleAccount(accountId)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleAccountExpansion(accountId)}
                              className="hover:bg-gray-100"
                              disabled={contacts.length === 0}
                            >
                              {expandedAccounts.has(accountId) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        {expandedAccounts.has(accountId) && (
                          <div className="border-t border-gray-200 p-4 bg-white">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-gray-900">Select Recipients</h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => selectAllContacts(accountId)}
                                className="border border-gray-300 hover:border-indigo-500 hover:bg-indigo-50"
                                disabled={contacts.length === 0}
                              >
                                Select All
                              </Button>
                            </div>
                            
                            {contacts.length === 0 ? (
                              <p className="text-sm text-gray-500 text-center py-4">No contacts available</p>
                            ) : (
                              <div className="space-y-2">
                                {contacts.map(contact => (
                                  <div key={contact.id} className="flex items-center gap-3">
                                    <Checkbox
                                      checked={formData.targetContacts.includes(contact.id)}
                                      onCheckedChange={() => toggleContact(contact.id)}
                                    />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                                      <p className="text-xs text-gray-500">{contact.email}</p>
                                      {contact.title && (
                                        <p className="text-xs text-gray-400">{contact.title}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-gray-200 flex flex-col gap-6">
              <div className="flex justify-start items-start gap-6">
                <div className="flex-1 flex flex-col gap-1">
                  <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7">Ready to Publish</h2>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Total recipients: <span className="font-medium text-indigo-600">{getTotalRecipients()}</span> contacts from{' '}
                    <span className="font-medium text-indigo-600">{getSelectedAccountsCount()}</span> accounts
                  </p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button
                    variant="outline"
                    className="w-full h-11 border border-gray-300 hover:border-green-500 hover:bg-green-50"
                    onClick={handleSaveDraft}
                    disabled={isSaving || !formData.title.trim() || formData.questions.length === 0}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save as Draft'}
                  </Button>
                  
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-11 border border-gray-300 hover:border-indigo-500 hover:bg-indigo-50"
                      onClick={handlePreview}
                      disabled={!formData.title.trim() || formData.questions.length === 0}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      className="flex-1 h-11 bg-indigo-950 hover:bg-indigo-900"
                      onClick={handlePublish}
                      disabled={isPublishing || !formData.title.trim() || formData.questions.length === 0}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isPublishing ? 'Publishing...' : 'Publish Survey'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}