import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/services/api/client';

interface Survey {
  id: string;
  survey_code: string;
  title: string;
  description: string;
  questions: any[];
  status: string;
}

interface Question {
  id: string;
  type: string;
  headline: string;
  required: boolean;
  options?: string[];
  range?: number;
}

export default function PublicSurveyPage() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState<Record<string, any>>({});
  
  // Contact information
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  useEffect(() => {
    if (surveyId) {
      loadSurvey();
    }
  }, [surveyId]);

  const loadSurvey = async () => {
    try {
      setLoading(true);
      // Public endpoint - no auth required
      const response = await apiClient.get(`/public/surveys/${surveyId}`);
      setSurvey(response.data);
    } catch (error: any) {
      console.error('Error loading survey:', error);
      toast.error('Failed to load survey');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!survey) return;

    // Validate contact information
    if (!contactName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!contactEmail.trim()) {
      toast.error('Please enter your email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate required questions
    const requiredQuestions = survey.questions.filter((q: Question) => q.required);
    const missingResponses = requiredQuestions.filter(
      (q: Question) => !responses[q.id] || responses[q.id] === ''
    );

    if (missingResponses.length > 0) {
      toast.error('Please answer all required questions');
      return;
    }

    try {
      setSubmitting(true);
      
      await apiClient.post(`/public/surveys/${surveyId}/submit`, {
        response_data: responses,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone || null
      });

      setSubmitted(true);
      toast.success('Thank you! Your response has been submitted.');
    } catch (error: any) {
      console.error('Error submitting survey:', error);
      toast.error('Failed to submit survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: Question, index: number) => {
    const { id, type, headline, required, options, range } = question;

    return (
      <div key={id} className="space-y-3">
        <label className="block">
          <span className="text-[#1A1A1A] font-medium">
            {index + 1}. {headline}
            {required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </label>

        {type === 'text' && (
          <Input
            value={responses[id] || ''}
            onChange={(e) => handleResponseChange(id, e.target.value)}
            placeholder="Your answer..."
            className="w-full"
            required={required}
          />
        )}

        {type === 'long_text' && (
          <Textarea
            value={responses[id] || ''}
            onChange={(e) => handleResponseChange(id, e.target.value)}
            placeholder="Your detailed answer..."
            rows={4}
            className="w-full"
            required={required}
          />
        )}

        {type === 'multiple_choice' && options && (
          <div className="space-y-2">
            {options.map((option: string, idx: number) => (
              <label key={idx} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="radio"
                  name={id}
                  value={option}
                  checked={responses[id] === option}
                  onChange={(e) => handleResponseChange(id, e.target.value)}
                  className="w-4 h-4 text-indigo-600"
                  required={required}
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}

        {type === 'yes_no' && (
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-3 rounded-lg border border-gray-200">
              <input
                type="radio"
                name={id}
                value="yes"
                checked={responses[id] === 'yes'}
                onChange={(e) => handleResponseChange(id, e.target.value)}
                className="w-4 h-4 text-indigo-600"
                required={required}
              />
              <span className="text-gray-700 font-medium">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-3 rounded-lg border border-gray-200">
              <input
                type="radio"
                name={id}
                value="no"
                checked={responses[id] === 'no'}
                onChange={(e) => handleResponseChange(id, e.target.value)}
                className="w-4 h-4 text-indigo-600"
                required={required}
              />
              <span className="text-gray-700 font-medium">No</span>
            </label>
          </div>
        )}

        {type === 'rating' && (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleResponseChange(id, rating)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  responses[id] === rating
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <Star
                  className={`h-6 w-6 ${
                    responses[id] >= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        {type === 'number' && (
          <Input
            type="number"
            value={responses[id] || ''}
            onChange={(e) => handleResponseChange(id, e.target.value)}
            placeholder="Enter a number..."
            className="w-full"
            required={required}
          />
        )}

        {type === 'date' && (
          <Input
            type="date"
            value={responses[id] || ''}
            onChange={(e) => handleResponseChange(id, e.target.value)}
            className="w-full"
            required={required}
          />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F3F2] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-[#F5F3F2] flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-2">Survey Not Found</h2>
            <p className="text-gray-600">
              The survey you're looking for doesn't exist or is no longer available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (survey.status !== 'active') {
    return (
      <div className="min-h-screen bg-[#F5F3F2] flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-2">Survey Not Active</h2>
            <p className="text-gray-600">
              This survey is currently {survey.status}. Please contact the survey administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F3F2] flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-2">Thank You, {contactName}!</h2>
            <p className="text-gray-600 mb-6">
              Your response has been submitted successfully. We appreciate your feedback!
            </p>
            <div className="space-y-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
              <p><span className="font-medium">Email:</span> {contactEmail}</p>
              {contactPhone && <p><span className="font-medium">Phone:</span> {contactPhone}</p>}
              <p><span className="font-medium">Survey Code:</span> <span className="font-mono">{survey.survey_code}</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3F2] py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-3">{survey.title}</h1>
          {survey.description && (
            <p className="text-lg text-gray-600">{survey.description}</p>
          )}
          <div className="mt-4 inline-block px-4 py-2 bg-indigo-50 rounded-full">
            <span className="text-sm text-indigo-700 font-medium">
              {survey.questions?.length || 0} Questions
            </span>
          </div>
        </div>

        {/* Contact Information */}
        <Card className="border border-gray-200 bg-white shadow-sm mb-6">
          <CardContent className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">Your Information</h2>
              <p className="text-sm text-gray-600">Please provide your contact details before starting the survey</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2">
                  <span className="text-[#1A1A1A] font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </span>
                </label>
                <Input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block mb-2">
                  <span className="text-[#1A1A1A] font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </span>
                </label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block mb-2">
                  <span className="text-[#1A1A1A] font-medium">
                    Phone Number <span className="text-gray-400 text-sm">(Optional)</span>
                  </span>
                </label>
                <Input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Survey Form */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">Survey Questions</h2>
                <p className="text-sm text-gray-600">Please answer all required questions marked with <span className="text-red-500">*</span></p>
              </div>
              
              {survey.questions && survey.questions.map((question: Question, index: number) => (
                renderQuestion(question, index)
              ))}

              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    <span className="text-red-500">*</span> Required fields
                  </p>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-11 px-8 bg-indigo-950 hover:bg-indigo-900"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Response'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Powered by Megapolis Advisory</p>
        </div>
      </div>
    </div>
  );
}
