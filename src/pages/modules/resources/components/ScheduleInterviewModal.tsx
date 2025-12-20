import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Video, Users, Link as LinkIcon, Mail, Sparkles, Loader2 } from 'lucide-react';

type ScheduleInterviewModalProps = {
  isOpen: boolean;
  employeeName: string;
  employeeEmail?: string;
  onConfirm: (scheduleData: InterviewSchedule) => void;
  onClose: () => void;
};

type InterviewSchedule = {
  interviewDate: string;
  interviewTime: string;
  interviewLink: string;
  platform: 'zoom' | 'google-meet' | 'teams' | 'other';
  interviewerName: string;
  interviewerEmail: string;
  notes: string;
  sendEmail: boolean;
};

export function ScheduleInterviewModal({ isOpen, employeeName, employeeEmail, onConfirm, onClose }: ScheduleInterviewModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [schedule, setSchedule] = useState<InterviewSchedule>({
    interviewDate: '',
    interviewTime: '',
    interviewLink: '',
    platform: 'zoom',
    interviewerName: '',
    interviewerEmail: '',
    notes: '',
    sendEmail: true,
  });

  useEffect(() => {
    if (isOpen) {
      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const defaultDate = tomorrow.toISOString().split('T')[0];
      
      setIsGenerating(true);
      setTimeout(() => {
        setSchedule(prev => ({
          ...prev,
          interviewDate: defaultDate,
          interviewTime: '10:00',
          notes: `Interview scheduled for ${employeeName}. Please review the candidate's profile and prepare technical questions based on their experience and skills.`,
        }));
        setIsGenerating(false);
      }, 500);
    } else {
      // Reset form
      setSchedule({
        interviewDate: '',
        interviewTime: '',
        interviewLink: '',
        platform: 'zoom',
        interviewerName: '',
        interviewerEmail: '',
        notes: '',
        sendEmail: true,
      });
    }
  }, [isOpen, employeeName]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!schedule.interviewDate || !schedule.interviewTime || !schedule.interviewLink || !schedule.interviewerName) {
      alert('Please fill in all required fields: Date, Time, Interview Link, and Interviewer Name');
      return;
    }
    onConfirm(schedule);
    onClose();
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'zoom': return '📹';
      case 'google-meet': return '🎥';
      case 'teams': return '💼';
      default: return '🔗';
    }
  };

  const isFormValid = schedule.interviewDate && schedule.interviewTime && schedule.interviewLink && schedule.interviewerName;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 p-6 border-b border-gray-200 bg-[#161950]/10 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Schedule Interview</h2>
                <p className="text-sm text-gray-600 mt-1">Set up interview for {employeeName}</p>
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

        <div className="p-6 space-y-6">
          {isGenerating && (
            <div className="flex items-center gap-3 p-4 bg-[#161950]/10 border border-[#161950]/20 rounded-xl">
              <Loader2 className="w-5 h-5 text-[#161950] animate-spin" />
              <span className="text-sm font-medium text-[#161950]">AI is preparing interview schedule...</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Interview Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={schedule.interviewDate}
                onChange={(e) => setSchedule(prev => ({ ...prev, interviewDate: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Interview Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={schedule.interviewTime}
                onChange={(e) => setSchedule(prev => ({ ...prev, interviewTime: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <Video className="w-4 h-4 inline mr-1" />
              Meeting Platform
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['zoom', 'google-meet', 'teams', 'other'] as const).map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => setSchedule(prev => ({ ...prev, platform }))}
                  className={`px-4 py-3 rounded-lg border-2 font-semibold text-sm transition-all ${
                    schedule.platform === platform
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                  }`}
                >
                  <span className="text-xl mb-1 block">{getPlatformIcon(platform)}</span>
                  {platform === 'zoom' ? 'Zoom' : platform === 'google-meet' ? 'Google Meet' : platform === 'teams' ? 'MS Teams' : 'Other'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <LinkIcon className="w-4 h-4 inline mr-1" />
              Interview Link (Zoom/Google Meet/Teams) <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={schedule.interviewLink}
              onChange={(e) => setSchedule(prev => ({ ...prev, interviewLink: e.target.value }))}
              placeholder="https://zoom.us/j/123456789 or https://meet.google.com/xxx-yyyy-zzz"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">Paste the meeting link from Zoom, Google Meet, or Teams</p>
          </div>

          <div className="p-6 bg-[#161950]/10 border border-[#161950]/20 rounded-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#161950]" />
              Interviewer Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Interviewer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={schedule.interviewerName}
                  onChange={(e) => setSchedule(prev => ({ ...prev, interviewerName: e.target.value }))}
                  placeholder="John Smith"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#161950] focus:ring-2 focus:ring-[#161950]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Interviewer Email
                </label>
                <input
                  type="email"
                  value={schedule.interviewerEmail}
                  onChange={(e) => setSchedule(prev => ({ ...prev, interviewerEmail: e.target.value }))}
                  placeholder="interviewer@company.com"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#161950] focus:ring-2 focus:ring-[#161950]/20"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Sparkles className="w-4 h-4 inline mr-1" />
              Interview Preparation Notes
            </label>
            <textarea
              value={schedule.notes}
              onChange={(e) => setSchedule(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full h-24 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
              placeholder="Add notes about what to discuss, technical areas to focus on, etc..."
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <input
              type="checkbox"
              id="sendEmail"
              checked={schedule.sendEmail}
              onChange={(e) => setSchedule(prev => ({ ...prev, sendEmail: e.target.checked }))}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-100"
            />
            <label htmlFor="sendEmail" className="text-sm font-medium text-gray-700 cursor-pointer">
              <Mail className="w-4 h-4 inline mr-1 text-green-600" />
              Send interview invitation email to <span className="font-semibold">{employeeEmail || 'candidate'}</span>
            </label>
          </div>
        </div>

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
              className="px-6 py-3 rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 bg-[#161950] hover:bg-[#1E2B5B] text-white"
            >
              <Calendar className="w-5 h-5" />
              Schedule Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

