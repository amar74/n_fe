import { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Clock, Users, CheckCircle, XCircle } from 'lucide-react';

type StageChangeModalProps = {
  isOpen: boolean;
  employeeName: string;
  currentStage: string;
  targetStage: string;
  onConfirm: (notes: string) => void;
  onClose: () => void;
};

const getAISuggestedNotes = (targetStage: string, employeeName: string): string => {
  switch (targetStage) {
    case 'review':
      return `${employeeName} has passed initial screening. Resume shows relevant experience and skills. Recommended for technical interview to assess practical knowledge and cultural fit.`;
    
    case 'accepted':
      return `${employeeName} successfully completed all interview rounds. Strong technical skills, good communication, and aligns well with company culture. Recommended for onboarding. Pending admin approval and interview feedback.`;
    
    case 'rejected':
      return `After careful review, ${employeeName}'s profile does not align with current requirements. Insufficient experience in key areas. Recommend to keep in talent pool for future opportunities.`;
    
    default:
      return `Stage changed to ${targetStage} for ${employeeName}.`;
  }
};

const getStageConfig = (stage: string) => {
  switch (stage) {
    case 'review':
      return {
        icon: Users,
        color: 'blue',
        title: 'Move to Interview',
        description: 'Schedule candidate for technical interview',
      };
    case 'accepted':
      return {
        icon: CheckCircle,
        color: 'green',
        title: 'Accept Candidate',
        description: 'Approve candidate for onboarding',
      };
    case 'rejected':
      return {
        icon: XCircle,
        color: 'red',
        title: 'Reject Application',
        description: 'Decline candidate application',
      };
    default:
      return {
        icon: Clock,
        color: 'gray',
        title: 'Change Stage',
        description: 'Update candidate status',
      };
  }
};

export function StageChangeModal({ isOpen, employeeName, currentStage, targetStage, onConfirm, onClose }: StageChangeModalProps) {
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const config = getStageConfig(targetStage);
  const IconComponent = config.icon;

  useEffect(() => {
    if (isOpen) {
      // Generate AI suggestion immediately
      setIsGenerating(true);
      setTimeout(() => {
        const aiNotes = getAISuggestedNotes(targetStage, employeeName);
        setNotes(aiNotes);
        setIsGenerating(false);
      }, 500);
    } else {
      setNotes('');
    }
  }, [isOpen, targetStage, employeeName]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
        {/* Header */}
        <div className={`p-6 border-b border-gray-200 bg-gradient-to-r ${
          config.color === 'green' ? 'from-green-50 to-emerald-50' :
          config.color === 'red' ? 'from-red-50 to-pink-50' :
          config.color === 'blue' ? 'from-blue-50 to-indigo-50' :
          'from-gray-50 to-slate-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 bg-white rounded-xl shadow-sm ${
                config.color === 'green' ? 'text-green-600' :
                config.color === 'red' ? 'text-red-600' :
                config.color === 'blue' ? 'text-blue-600' :
                'text-gray-600'
              }`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{config.title}</h2>
                <p className="text-sm text-gray-600 mt-1">{config.description}</p>
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
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-700 mb-4">
              You are moving <span className="font-semibold">{employeeName}</span> from{' '}
              <span className="font-semibold capitalize">{currentStage}</span> to{' '}
              <span className="font-semibold capitalize">{targetStage}</span>.
            </p>
          </div>

          {/* AI Suggestion */}
          {isGenerating && (
            <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
              <span className="text-sm font-medium text-purple-900">AI is generating review notes...</span>
            </div>
          )}

          {!isGenerating && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
              <div className="flex items-start gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600 mt-0.5" />
                <p className="text-xs font-semibold text-gray-700">AI-Suggested Review Notes:</p>
              </div>
              <p className="text-xs text-gray-600 italic">Click in the text area below to customize</p>
            </div>
          )}

          {/* Review Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Notes {targetStage === 'accepted' ? '(Add interview feedback)' : ''}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-32 px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              placeholder="Add your review notes here..."
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-500 mt-2">
              {targetStage === 'accepted' && 'Include interview feedback and reason for acceptance'}
              {targetStage === 'rejected' && 'Explain reason for rejection'}
              {targetStage === 'review' && 'Add initial screening notes'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors border border-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isGenerating || !notes.trim()}
            className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
              config.color === 'green' ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white' :
              config.color === 'red' ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white' :
              'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
            }`}
          >
            <IconComponent className="w-5 h-5" />
            Confirm & {config.color === 'green' ? 'Accept' : config.color === 'red' ? 'Reject' : 'Move'}
          </button>
        </div>
      </div>
    </div>
  );
}

