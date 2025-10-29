import { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Users, CheckCircle, XCircle, ThumbsUp, ThumbsDown, FileText } from 'lucide-react';

type InterviewFeedbackModalProps = {
  isOpen: boolean;
  employeeName: string;
  onConfirm: (feedback: InterviewFeedback) => void;
  onClose: () => void;
};

type InterviewFeedback = {
  interviewDate: string;
  interviewerName: string;
  technicalSkills: number; // 1-5 rating
  communicationSkills: number; // 1-5 rating
  culturalFit: number; // 1-5 rating
  overallRating: number; // 1-5 rating
  strengths: string;
  weaknesses: string;
  recommendation: 'accept' | 'reject' | 'review';
  notes: string;
};

export function InterviewFeedbackModal({ isOpen, employeeName, onConfirm, onClose }: InterviewFeedbackModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback>({
    interviewDate: new Date().toISOString().split('T')[0],
    interviewerName: '',
    technicalSkills: 0,
    communicationSkills: 0,
    culturalFit: 0,
    overallRating: 0,
    strengths: '',
    weaknesses: '',
    recommendation: 'review',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      // Generate AI-suggested feedback structure
      setIsGenerating(true);
      setTimeout(() => {
        setFeedback(prev => ({
          ...prev,
          notes: `Interview conducted for ${employeeName}. Candidate demonstrated relevant skills and experience. Further evaluation recommended.`,
        }));
        setIsGenerating(false);
      }, 500);
    } else {
      // Reset form
      setFeedback({
        interviewDate: new Date().toISOString().split('T')[0],
        interviewerName: '',
        technicalSkills: 0,
        communicationSkills: 0,
        culturalFit: 0,
        overallRating: 0,
        strengths: '',
        weaknesses: '',
        recommendation: 'review',
        notes: '',
      });
    }
  }, [isOpen, employeeName]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!feedback.interviewerName || feedback.overallRating === 0) {
      alert('Please fill in required fields: Interviewer Name and Overall Rating');
      return;
    }
    onConfirm(feedback);
    onClose();
  };

  const updateRating = (field: keyof InterviewFeedback, value: number) => {
    setFeedback(prev => ({ ...prev, [field]: value }));
  };

  const RatingStars = ({ rating, onChange }: { rating: number; onChange: (value: number) => void }) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`w-8 h-8 rounded-lg font-bold transition-all ${
            star <= rating
              ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md'
              : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
          }`}
        >
          {star}
        </button>
      ))}
    </div>
  );

  const isFormValid = feedback.interviewerName && feedback.overallRating > 0;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Interview Feedback</h2>
                <p className="text-sm text-gray-600 mt-1">Record interview results for {employeeName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* AI Suggestion */}
          {isGenerating && (
            <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
              <span className="text-sm font-medium text-purple-900">AI is preparing feedback form...</span>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Interview Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={feedback.interviewDate}
                onChange={(e) => setFeedback(prev => ({ ...prev, interviewDate: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Interviewer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={feedback.interviewerName}
                onChange={(e) => setFeedback(prev => ({ ...prev, interviewerName: e.target.value }))}
                placeholder="Enter interviewer name"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Rating Section */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Candidate Evaluation
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Technical Skills</label>
                <RatingStars rating={feedback.technicalSkills} onChange={(v) => updateRating('technicalSkills', v)} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Communication Skills</label>
                <RatingStars rating={feedback.communicationSkills} onChange={(v) => updateRating('communicationSkills', v)} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cultural Fit</label>
                <RatingStars rating={feedback.culturalFit} onChange={(v) => updateRating('culturalFit', v)} />
              </div>

              <div className="pt-4 border-t border-blue-300">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Overall Rating <span className="text-red-500">*</span>
                </label>
                <RatingStars rating={feedback.overallRating} onChange={(v) => updateRating('overallRating', v)} />
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-green-600" />
                Key Strengths
              </label>
              <textarea
                value={feedback.strengths}
                onChange={(e) => setFeedback(prev => ({ ...prev, strengths: e.target.value }))}
                className="w-full h-24 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 resize-none"
                placeholder="e.g., Strong problem-solving skills, excellent communication..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <ThumbsDown className="w-4 h-4 text-red-600" />
                Areas for Improvement
              </label>
              <textarea
                value={feedback.weaknesses}
                onChange={(e) => setFeedback(prev => ({ ...prev, weaknesses: e.target.value }))}
                className="w-full h-24 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 resize-none"
                placeholder="e.g., Limited experience with specific tools, needs more practice..."
              />
            </div>
          </div>

          {/* Recommendation */}
          <div className="p-6 bg-white border-2 border-gray-200 rounded-xl">
            <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Interview Recommendation <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFeedback(prev => ({ ...prev, recommendation: 'accept' }))}
                className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all border-2 ${
                  feedback.recommendation === 'accept'
                    ? 'bg-green-50 border-green-500 text-green-700 shadow-lg'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-green-300'
                }`}
              >
                <CheckCircle className={`w-5 h-5 mx-auto mb-2 ${feedback.recommendation === 'accept' ? 'text-green-600' : 'text-gray-400'}`} />
                Accept & Move to Contract
              </button>
              <button
                type="button"
                onClick={() => setFeedback(prev => ({ ...prev, recommendation: 'review' }))}
                className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all border-2 ${
                  feedback.recommendation === 'review'
                    ? 'bg-yellow-50 border-yellow-500 text-yellow-700 shadow-lg'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-yellow-300'
                }`}
              >
                <Users className={`w-5 h-5 mx-auto mb-2 ${feedback.recommendation === 'review' ? 'text-yellow-600' : 'text-gray-400'}`} />
                Needs Further Review
              </button>
              <button
                type="button"
                onClick={() => setFeedback(prev => ({ ...prev, recommendation: 'reject' }))}
                className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all border-2 ${
                  feedback.recommendation === 'reject'
                    ? 'bg-red-50 border-red-500 text-red-700 shadow-lg'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-red-300'
                }`}
              >
                <XCircle className={`w-5 h-5 mx-auto mb-2 ${feedback.recommendation === 'reject' ? 'text-red-600' : 'text-gray-400'}`} />
                Reject Application
              </button>
            </div>
          </div>

          {/* Detailed Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Interview Notes
            </label>
            <textarea
              value={feedback.notes}
              onChange={(e) => setFeedback(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full h-32 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
              placeholder="Add any additional observations, technical test results, or context from the interview..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between rounded-b-2xl">
          <p className="text-xs text-gray-500">* Required fields</p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors border border-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isFormValid}
              className="px-6 py-3 rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <CheckCircle className="w-5 h-5" />
              Submit Feedback & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

