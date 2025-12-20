import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Trash2, 
  Eye, 
  Send, 
  Users,
  Save,
  ArrowLeft
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

interface Employee {
  id: string;
  name: string;
  email: string;
  employee_number: string;
  job_title?: string | null;
  department?: string | null;
  role?: string | null;
  status: string;
}

interface SurveyFormData {
  title: string;
  description: string;
  questions: SurveyQuestion[];
  targetEmployees: string[];
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

export default function EmployeeSurveyBuilderPage() {
  const navigate = useNavigate();
  const { surveyId } = useParams<{ surveyId: string }>();
  const [formData, setFormData] = useState<SurveyFormData>({
    title: '',
    description: '',
    questions: [],
    targetEmployees: []
  });
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [currentSurveyId, setCurrentSurveyId] = useState<string | null>(surveyId || null);
  const [isEditMode, setIsEditMode] = useState(!!surveyId);

  useEffect(() => {
    loadEmployees();
    if (surveyId) {
      loadSurveyData(surveyId);
    }
  }, [surveyId]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<Employee[]>('/surveys/employees');
      setEmployees(response.data);
      console.log('Loaded employees:', response.data);
    } catch (error: any) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const loadSurveyData = async (id: string) => {
    try {
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
        targetEmployees: []
      });

      toast.success('Draft survey loaded for editing');
    } catch (error) {
      console.error('Error loading survey:', error);
      toast.error('Failed to load survey');
      navigate('/surveys');
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

  const toggleEmployee = (employeeId: string) => {
    setFormData(prev => ({
      ...prev,
      targetEmployees: prev.targetEmployees.includes(employeeId)
        ? prev.targetEmployees.filter(id => id !== employeeId)
        : [...prev.targetEmployees, employeeId]
    }));
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setFormData(prev => ({ ...prev, targetEmployees: [] }));
      setSelectAll(false);
    } else {
      const allEmployeeIds = employees.map(emp => emp.id);
      setFormData(prev => ({ ...prev, targetEmployees: allEmployeeIds }));
      setSelectAll(true);
    }
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
      setIsSavingDraft(true);
      
      const surveyData = {
        title: formData.title,
        description: formData.description,
        survey_type: 'employee_satisfaction',  // Employee survey type
        questions: formData.questions.map(q => ({
          id: q.id,
          type: q.type,
          headline: q.title,
          required: q.required,
          options: q.options
        }))
      };

      if (currentSurveyId) {
        // Update existing draft
        await apiClient.patch(`/surveys/${currentSurveyId}`, surveyData);
        toast.success('Draft saved successfully!');
      } else {
        // Create new draft
        const response = await apiClient.post('/surveys', surveyData);
        setCurrentSurveyId(response.data.id);
        toast.success('Draft saved successfully!');
      }
    } catch (error: any) {
      console.error('Error saving draft:', error);
      toast.error(error.response?.data?.detail || 'Failed to save draft');
    } finally {
      setIsSavingDraft(false);
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

    if (formData.targetEmployees.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }

    try {
      setIsPublishing(true);
      
      let surveyId = currentSurveyId;
      
      // Step 1: Create or update the survey
      const surveyData = {
        title: formData.title,
        description: formData.description,
        survey_type: 'employee_satisfaction',  // Employee survey type
        questions: formData.questions.map(q => ({
          id: q.id,
          type: q.type,
          headline: q.title,
          required: q.required,
          options: q.options
        }))
      };

      if (currentSurveyId) {
        // Update existing survey
        await apiClient.patch(`/surveys/${currentSurveyId}`, surveyData);
      } else {
        // Create new survey
        const createResponse = await apiClient.post('/surveys', surveyData);
        surveyId = createResponse.data.id;
        setCurrentSurveyId(surveyId);
      }

      // Step 2: Distribute the survey to selected employees
      const distributeData = {
        survey_id: surveyId,
        employee_ids: formData.targetEmployees
      };

      await apiClient.post(`/surveys/${surveyId}/distribute`, distributeData);

      toast.success('Employee survey published successfully!');
      navigate('/surveys');
    } catch (error: any) {
      console.error('Error publishing survey:', error);
      toast.error(error.response?.data?.detail || 'Failed to publish survey');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#F5F3F2] font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm font-normal font-outfit leading-tight">Dashboard</span>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">/</span>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">Employee Survey Builder</span>
            </div>
            <h1 className="text-[#1A1A1A] text-3xl font-semibold font-outfit leading-loose">
              {isEditMode ? 'Edit Employee Survey' : 'Employee Survey Builder'}
            </h1>
            <p className="text-[#667085] text-sm font-normal font-outfit leading-tight">
              {isEditMode ? 'Update your employee survey' : 'Create surveys for your employees to gather feedback and insights'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/surveys')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            View All Surveys
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-white rounded-2xl border border-gray-200 flex flex-col gap-6">
              <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7">Survey Details</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[#344054] text-sm font-medium font-outfit mb-2">Survey Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Employee Satisfaction Survey Q4 2025"
                    className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[#344054] text-sm font-medium font-outfit mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the purpose of this survey"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-gray-200 flex flex-col gap-6">
              <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7">Add Question</h2>
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
                <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7">Questions ({formData.questions.length})</h2>
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
                        className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      
                      {question.type === 'multiple_choice' && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex gap-2">
                              <Input
                                value={option}
                                onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                placeholder={`Option ${optIndex + 1}`}
                                className="flex-1 h-10 px-3 py-2 border border-gray-300 rounded-lg"
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
                  <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7">Select Employees</h2>
                  <p className="text-[#667085] text-sm font-normal font-outfit leading-tight">
                    Choose employees who will receive this survey
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadEmployees}
                  disabled={loading}
                  className="hover:bg-gray-100"
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Checkbox
                    id="select-all"
                    checked={selectAll}
                    onCheckedChange={toggleSelectAll}
                  />
                  <label htmlFor="select-all" className="text-sm font-medium text-gray-900 cursor-pointer">
                    Select All Employees ({employees.length})
                  </label>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading employees...</p>
                  </div>
                ) : employees.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No employees available</p>
                ) : (
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {employees.map(employee => (
                      <div 
                        key={employee.id} 
                        className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors"
                      >
                        <Checkbox
                          id={`emp-${employee.id}`}
                          checked={formData.targetEmployees.includes(employee.id)}
                          onCheckedChange={() => toggleEmployee(employee.id)}
                        />
                        <label htmlFor={`emp-${employee.id}`} className="flex-1 cursor-pointer">
                          <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                          <p className="text-xs text-gray-500">{employee.email}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {employee.employee_number}
                            </Badge>
                            {employee.department && (
                              <Badge variant="secondary" className="text-xs">
                                {employee.department}
                              </Badge>
                            )}
                            {employee.job_title && (
                              <span className="text-xs text-gray-500">{employee.job_title}</span>
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-gray-200 flex flex-col gap-6">
              <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7">Save & Publish</h2>
              <div className="flex flex-col gap-4">
                {formData.targetEmployees.length > 0 && (
                  <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Total recipients: <span className="font-medium text-indigo-600">{formData.targetEmployees.length}</span> employees
                    </p>
                  </div>
                )}
                
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="w-full h-11 border-2 border-gray-300 hover:border-indigo-500 hover:bg-indigo-50"
                    onClick={handleSaveDraft}
                    disabled={isSavingDraft || !formData.title.trim() || formData.questions.length === 0}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSavingDraft ? 'Saving...' : currentSurveyId ? 'Update Draft' : 'Save as Draft'}
                  </Button>
                  
                  <Button
                    className="w-full h-11 bg-indigo-950 hover:bg-indigo-900"
                    onClick={handlePublish}
                    disabled={isPublishing || !formData.title.trim() || formData.questions.length === 0 || formData.targetEmployees.length === 0}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isPublishing ? 'Publishing...' : 'Publish Survey'}
                  </Button>
                </div>
                
                {currentSurveyId && (
                  <p className="text-xs text-gray-500 text-center">
                    Draft ID: {currentSurveyId.slice(0, 8)}...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
