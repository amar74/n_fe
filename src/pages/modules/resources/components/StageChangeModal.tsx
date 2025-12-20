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

  const isReverseMove = () => {
    const stageOrder = ['pending', 'review', 'accepted', 'rejected'];
    const fromIndex = stageOrder.indexOf(currentStage);
    const toIndex = stageOrder.indexOf(targetStage);
    return fromIndex > toIndex && toIndex >= 0;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border-2" style={{ borderColor: '#161950' }}>
        <div className="p-6 border-b border-gray-200" style={{ backgroundColor: '#f0f5ff' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl shadow-sm" style={{ color: '#161950' }}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{config.title}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {isReverseMove() ? '⚠️ Reverse move - moving backwards in process' : config.description}
                </p>
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

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 p-3 bg-gray-100 rounded-lg text-center">
              <p className="text-xs text-gray-600 mb-1">From</p>
              <p className="text-sm font-bold text-gray-900 capitalize">{currentStage}</p>
            </div>
            <div className="text-2xl" style={{ color: '#161950' }}>→</div>
            <div className="flex-1 p-3 rounded-lg text-center text-white" style={{ backgroundColor: '#161950' }}>
              <p className="text-xs mb-1">To</p>
              <p className="text-sm font-bold capitalize">{targetStage}</p>
            </div>
          </div>

          {isReverseMove() && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-xs text-orange-800 font-medium">
                ⚠️ This is a reverse move. The candidate's status will revert to an earlier stage.
              </p>
            </div>
          )}

          {isGenerating && (
            <div className="flex items-center gap-3 p-4 bg-[#161950]/10 border border-[#161950]/20 rounded-xl">
              <Loader2 className="w-5 h-5 text-[#161950] animate-spin" />
              <span className="text-sm font-medium text-[#161950]">AI is generating review notes...</span>
            </div>
          )}

          {!isGenerating && (
            <div className="p-4 bg-[#161950]/10 border border-[#161950]/20 rounded-xl">
              <div className="flex items-start gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#161950] mt-0.5" />
                <p className="text-xs font-semibold text-gray-700">AI-Suggested Review Notes:</p>
              </div>
              <p className="text-xs text-gray-600 italic">Click in the text area below to customize</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Notes {isReverseMove() ? '(Required for reverse move)' : targetStage === 'accepted' ? '(Add interview feedback)' : '(Optional)'}
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

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors border border-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isGenerating || (isReverseMove() && !notes.trim())}
            className="px-6 py-3 rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-white hover:opacity-90"
            style={{ backgroundColor: config.color === 'green' ? '#10b981' : config.color === 'red' ? '#ef4444' : '#161950' }}
          >
            <IconComponent className="w-5 h-5" />
            Confirm & {config.color === 'green' ? 'Accept' : config.color === 'red' ? 'Reject' : 'Move'}
          </button>
        </div>
      </div>
    </div>
  );
}

