import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Eye,
  Send,
  Star,
  Calendar,
  Hash,
  Type,
  AlignLeft,
  CheckSquare
} from 'lucide-react';
import { toast } from 'sonner';

interface SurveyQuestion {
  id: string;
  type: 'multiple_choice' | 'rating' | 'text' | 'yes_no' | 'long_text' | 'number' | 'date';
  title: string;
  options?: string[];
  required: boolean;
  order: number;
}

interface SurveyFormData {
  title: string;
  description: string;
  questions: SurveyQuestion[];
  targetAccounts: string[];
  targetContacts: string[];
}

const questionTypeIcons = {
  multiple_choice: CheckSquare,
  rating: Star,
  text: Type,
  long_text: AlignLeft,
  yes_no: CheckSquare,
  number: Hash,
  date: Calendar
};

const questionTypeLabels = {
  multiple_choice: 'Multiple Choice',
  rating: 'Rating Scale',
  text: 'Short Text',
  long_text: 'Long Text',
  yes_no: 'Yes/No',
  number: 'Number',
  date: 'Date'
};

export default function SurveyPreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SurveyFormData | null>(null);
  const [previewResponses, setPreviewResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.formData) {
      setFormData(location.state.formData);
    } else {
      navigate('/surveys/builder');
    }
  }, [location.state, navigate]);

  const handleResponseChange = (questionId: string, value: any) => {
    setPreviewResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmitPreview = () => {
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast.success('Survey preview submitted successfully!');
      setIsSubmitting(false);
      navigate('/surveys');
    }, 2000);
  };

  const handleGoBack = () => {
    navigate('/surveys/builder', { state: formData });
  };

  const handlePublish = () => {
    if (!formData) return;
    
    // Navigate back to builder with form data for publishing
    navigate('/surveys/builder', { 
      state: { ...formData, shouldPublish: true } 
    });
  };

  const renderQuestion = (question: SurveyQuestion) => {
    const QuestionIcon = questionTypeIcons[question.type];

    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${question.id}-${index}`}
                  name={question.id}
                  value={option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor={`${question.id}-${index}`} className="text-sm text-gray-700">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      case 'rating':
        return (
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleResponseChange(question.id, rating)}
                className={`p-2 rounded-lg border-2 transition-colors ${
                  previewResponses[question.id] === rating
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Star className={`h-6 w-6 ${
                  previewResponses[question.id] >= rating ? 'fill-current' : ''
                }`} />
              </button>
            ))}
          </div>
        );

      case 'text':
        return (
          <Input
            placeholder="Enter your answer..."
            value={previewResponses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full"
          />
        );

      case 'long_text':
        return (
          <Textarea
            placeholder="Enter your detailed answer..."
            value={previewResponses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            rows={4}
            className="w-full"
          />
        );

      case 'yes_no':
        return (
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name={question.id}
                value="yes"
                checked={previewResponses[question.id] === 'yes'}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-sm text-gray-700">Yes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name={question.id}
                value="no"
                checked={previewResponses[question.id] === 'no'}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-sm text-gray-700">No</span>
            </label>
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder="Enter a number..."
            value={previewResponses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full"
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={previewResponses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full"
          />
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading preview...</h2>
          <p className="text-gray-600">Please wait while we prepare your survey preview.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Builder
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Survey Preview</h1>
              <p className="text-gray-600">Preview how your survey will look to recipients</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleGoBack} variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Edit Survey
            </Button>
            <Button onClick={handlePublish}>
              <Send className="h-4 w-4 mr-2" />
              Publish Survey
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {formData.title}
              </h2>
              {formData.description && (
                <p className="text-gray-600">{formData.description}</p>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {formData.questions.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {index + 1}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <QuestionIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {questionTypeLabels[question.type]}
                    </span>
                  </div>
                  {question.required && (
                    <Badge variant="destructive" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {question.title}
                </h3>
                
                {renderQuestion(question)}
              </div>
            ))}

            <div className="text-center pt-6 border-t">
              <Button
                onClick={handleSubmitPreview}
                disabled={isSubmitting}
                className="px-8 py-3 text-lg"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Survey'}
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                This is a preview. Actual submissions will be recorded when published.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Survey Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Questions</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {formData.questions.length}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Target Accounts</h4>
                <p className="text-2xl font-bold text-green-600">
                  {formData.targetAccounts.length}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Target Contacts</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {formData.targetContacts.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}