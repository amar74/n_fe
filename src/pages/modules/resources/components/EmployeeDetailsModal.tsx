import { X, Mail, Phone, MapPin, Briefcase, DollarSign, Calendar, Award, Sparkles, CheckCircle, XCircle, Edit2, Download, Video, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';
import type { Employee } from './KanbanBoard';
import { StageChangeModal } from './StageChangeModal';
import { InterviewFeedbackModal } from './InterviewFeedbackModal';
import { ScheduleInterviewModal } from './ScheduleInterviewModal';

type EmployeeDetailsModalProps = {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onStageChange: (employeeId: string, newStage: string, notes?: string) => void;
  onDownloadCV: (cvUrl: string, name: string) => void;
};

type AIVerification = {
  field: string;
  current: string;
  suggested: string;
  confidence: number;
};

export function EmployeeDetailsModal({ employee, isOpen, onClose, onStageChange, onDownloadCV }: EmployeeDetailsModalProps) {
  const [reviewNotes, setReviewNotes] = useState('');
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [targetStage, setTargetStage] = useState('');
  const [approvedFields, setApprovedFields] = useState<Set<string>>(new Set());
  const [interviewSchedule, setInterviewSchedule] = useState<any>(null);

  if (!isOpen || !employee) return null;

  // Calculate Selection Score based on AI match percentage (capped at 100)
  const rawScore = employee.rating ? employee.rating * 20 : Math.min((employee.skills?.length || 0) * 12, 100);
  const selectionScore = Math.min(rawScore, 100); // Ensure it never exceeds 100%
  
  // Determine score color and status
  const getScoreStatus = (score: number) => {
    if (score >= 70) return { color: 'green', status: 'Excellent Match', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' };
    if (score >= 35) return { color: 'yellow', status: 'Good Match', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' };
    return { color: 'red', status: 'Low Match', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' };
  };
  
  const scoreStatus = getScoreStatus(selectionScore);

  // Auto-generate AI notes based on LinkedIn/CV data
  const generateAINotes = () => {
    if (employee.reviewNotes) return employee.reviewNotes; // Use existing notes if available
    
    const notes = [];
    notes.push(`✅ Candidate Profile Analysis:`);
    notes.push(`• Position: ${employee.position || 'Not specified'}`);
    notes.push(`• Experience: ${employee.experience || 'Not specified'}`);
    notes.push(`• Location: ${employee.location || 'Not specified'}`);
    
    if (employee.skills && employee.skills.length > 0) {
      notes.push(`\n🎯 Key Skills Identified: ${employee.skills.slice(0, 5).join(', ')}`);
    }
    
    notes.push(`\n📊 Selection Score: ${selectionScore}% - ${scoreStatus.status}`);
    
    if (selectionScore >= 70) {
      notes.push(`\n💚 Recommendation: Strong candidate - Proceed to interview immediately.`);
    } else if (selectionScore >= 35) {
      notes.push(`\n💛 Recommendation: Moderate fit - Review detailed profile and consider for suitable projects.`);
    } else {
      notes.push(`\n❤️ Recommendation: Low match - May require additional screening or training.`);
    }
    
    notes.push(`\nSource: ${employee.cvUrl ? 'CV Upload' : 'Manual Entry'} | Last Updated: ${employee.appliedDate}`);
    
    return notes.join('\n');
  };

  // Simulated AI verification suggestions - only show if resume was parsed
  const aiVerifications: AIVerification[] = employee.skills && employee.skills.length > 0 ? [
    { field: 'Skills', current: 'React, TypeScript', suggested: 'React, TypeScript, Node.js, AWS, Docker', confidence: 95 },
    { field: 'Experience', current: '5 years', suggested: '5+ years in full-stack development', confidence: 92 },
    { field: 'Role', current: 'Developer', suggested: 'Senior Software Engineer', confidence: 88 },
  ] : [];

  const handleApproveVerification = (verification: AIVerification) => {
    // Approve only this specific field
    setApprovedFields(new Set(approvedFields).add(verification.field));
    // In real implementation, would call API to update this field
    console.log(`Approved ${verification.field}: ${verification.suggested}`);
  };

  const handleRejectVerification = (verification: AIVerification) => {
    console.log(`Rejected ${verification.field}`);
  };
  
  const handleStageClick = (stage: string) => {
    setTargetStage(stage);
    
    // Pending → Interview: Schedule interview first
    if (stage === 'review' && employee.stage === 'pending') {
      setIsScheduleModalOpen(true);
    }
    // Interview → Accept/Reject: Record feedback
    else if ((stage === 'accepted' || stage === 'rejected') && employee.stage === 'review') {
      setIsInterviewModalOpen(true);
    }
    // Other stage changes: Use standard modal
    else {
      setIsStageModalOpen(true);
    }
  };
  
  const handleScheduleInterview = async (scheduleData: any) => {
    // Save interview schedule
    setInterviewSchedule(scheduleData);
    setIsScheduleModalOpen(false);
    onClose();
    
    // Format schedule notes
    const scheduleNotes = `
📅 Interview Scheduled
━━━━━━━━━━━━━━━━━━━━━━━━
📆 Date: ${scheduleData.interviewDate}
🕐 Time: ${scheduleData.interviewTime}
${getPlatformIcon(scheduleData.platform)} Platform: ${scheduleData.platform === 'google-meet' ? 'Google Meet' : scheduleData.platform === 'teams' ? 'MS Teams' : scheduleData.platform === 'zoom' ? 'Zoom' : 'Other'}
🔗 Meeting Link: ${scheduleData.interviewLink}

👤 Interviewer: ${scheduleData.interviewerName}
${scheduleData.interviewerEmail ? `📧 Email: ${scheduleData.interviewerEmail}` : ''}

📝 Preparation Notes:
${scheduleData.notes}

${scheduleData.sendEmail ? '✅ Interview invitation email sent to candidate' : ''}
    `.trim();
    
    // Move to review stage with schedule notes
    await onStageChange(employee.id, 'review', scheduleNotes);
    console.log(`Interview scheduled`, scheduleNotes);
  };
  
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'zoom': return '📹';
      case 'google-meet': return '🎥';
      case 'teams': return '💼';
      default: return '🔗';
    }
  };
  
  const handleInterviewFeedback = async (feedback: any) => {
    // Close modals
    setIsInterviewModalOpen(false);
    onClose();
    
    // Determine next stage based on recommendation
    let nextStage = 'review'; // default
    if (feedback.recommendation === 'accept') {
      nextStage = 'accepted'; // Move to contract/accepted
    } else if (feedback.recommendation === 'reject') {
      nextStage = 'rejected';
    }
    
    // Update with feedback notes
    const fullNotes = `
📋 Interview Feedback (${feedback.interviewDate})
Interviewer: ${feedback.interviewerName}

⭐ Ratings:
- Technical Skills: ${feedback.technicalSkills}/5
- Communication: ${feedback.communicationSkills}/5
- Cultural Fit: ${feedback.culturalFit}/5
- Overall: ${feedback.overallRating}/5

💪 Strengths: ${feedback.strengths || 'N/A'}
⚠️ Areas for Improvement: ${feedback.weaknesses || 'N/A'}

✅ Recommendation: ${feedback.recommendation.toUpperCase()}

📝 Additional Notes:
${feedback.notes}
    `.trim();
    
    await onStageChange(employee.id, nextStage, fullNotes);
    console.log(`Interview completed - moving to ${nextStage}`, fullNotes);
  };
  
  const handleStageConfirm = async (notes: string) => {
    // Optimistic update - close immediately
    setIsStageModalOpen(false);
    onClose();
    
    // Update in background with notes
    await onStageChange(employee.id, targetStage, notes);
    console.log(`Stage changed to ${targetStage} with notes:`, notes);
  };

  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#161950]/10 border-b border-gray-200 px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#161950]/10 rounded-2xl flex items-center justify-center shadow-lg border border-[#161950]/20">
                <Award className="w-8 h-8 text-[#161950]" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
                  {scoreStatus.color === 'green' && <CheckCircle className="w-6 h-6 text-green-500" />}
                  {scoreStatus.color === 'yellow' && <CheckCircle className="w-6 h-6 text-yellow-500" />}
                  {scoreStatus.color === 'red' && <XCircle className="w-6 h-6 text-red-500" />}
                </div>
                <p className="text-sm text-gray-600 mt-1">{employee.position || 'Position not specified'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`px-6 py-4 rounded-xl border-2 ${scoreStatus.borderColor} ${scoreStatus.bgColor} shadow-lg`}>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Selection Score</p>
                    <p className={`text-3xl font-bold ${scoreStatus.textColor} mt-1`}>{selectionScore}%</p>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm">
                    {scoreStatus.color === 'green' && <CheckCircle className="w-8 h-8 text-green-500" />}
                    {scoreStatus.color === 'yellow' && <CheckCircle className="w-8 h-8 text-yellow-500" />}
                    {scoreStatus.color === 'red' && <XCircle className="w-8 h-8 text-red-500" />}
                  </div>
                </div>
                <p className={`text-xs font-semibold ${scoreStatus.textColor} mt-2`}>{scoreStatus.status}</p>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {aiVerifications.length > 0 && (
                <div className="p-6 bg-[#161950]/10 border border-[#161950]/20 rounded-xl">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Sparkles className="w-5 h-5 text-[#161950]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">🔍 Resume Parsed for {employee.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">AI has analyzed the resume and suggests the following updates:</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {aiVerifications.map((verification, idx) => {
                      const isApproved = approvedFields.has(verification.field);
                      
                      return (
                        <div key={idx} className={`p-4 rounded-xl border transition-all ${
                          isApproved ? 'bg-green-50 border-green-300' : 'bg-white border-[#161950]/20'
                        }`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-sm font-bold text-gray-900">{verification.field}</p>
                                {isApproved ? (
                                  <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Approved
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                    {verification.confidence}% confident
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Current:</span> {verification.current}
                                </p>
                                <p className="text-sm text-gray-900">
                                  <span className="font-medium text-[#161950]">Suggested:</span> {verification.suggested}
                                </p>
                              </div>
                            </div>
                          </div>
                          {!isApproved && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApproveVerification(verification)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectVerification(verification)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleRejectVerification(verification)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-all"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="p-6 bg-white border border-gray-200 rounded-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Email</p>
                      <p className="text-sm text-gray-900 font-semibold">{employee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Phone</p>
                      <p className="text-sm text-gray-900 font-semibold">{employee.phone}</p>
                    </div>
                  </div>
                  {employee.location && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#161950]/10 rounded-lg border border-[#161950]/20">
                        <MapPin className="w-5 h-5 text-[#161950]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Location</p>
                        <p className="text-sm text-gray-900 font-semibold">{employee.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {employee.skills && employee.skills.length > 0 && (
                <div className="p-6 bg-white border border-gray-200 rounded-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Skills & Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {employee.skills.map((skill, idx) => (
                      <span key={idx} className="px-4 py-2 bg-[#161950]/10 border border-[#161950]/20 text-[#161950] text-sm font-semibold rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                  {employee.experience && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">Experience:</span> {employee.experience}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="p-6 bg-[#161950]/10 border-2 border-[#161950]/20 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#161950]" />
                    <h3 className="text-lg font-bold text-gray-900">AI-Generated Review & Rating</h3>
                  </div>
                  <span className="px-3 py-1 bg-[#161950]/20 text-[#161950] text-xs font-semibold rounded-full">
                    Auto-Generated
                  </span>
                </div>
                <textarea
                  value={reviewNotes || generateAINotes()}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full h-48 px-4 py-3 rounded-xl border border-[#161950]/30 text-gray-900 focus:outline-none focus:border-[#161950] focus:ring-2 focus:ring-[#161950]/20 transition-all resize-none bg-white font-mono text-sm"
                  placeholder="AI-generated notes will appear here..."
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-white border border-gray-200 rounded-xl">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Current Stage</h3>
                <div className={`px-4 py-3 rounded-xl text-center font-bold ${
                  employee.stage === 'pending' ? 'bg-amber-100 text-amber-800' :
                  employee.stage === 'review' ? 'bg-blue-100 text-blue-800' :
                  employee.stage === 'accepted' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {employee.stage.charAt(0).toUpperCase() + employee.stage.slice(1)}
                </div>
              </div>

              <div className="p-6 bg-white border border-gray-200 rounded-xl">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Move to Stage</h3>
                {(employee.stage === 'accepted' || employee.stage === 'rejected') && (
                  <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-600">
                      ℹ️ This application is in final stage. All actions are disabled.
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <button
                    onClick={() => handleStageClick('review')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-semibold hover:bg-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={employee.stage === 'review' || employee.stage === 'accepted' || employee.stage === 'rejected'}
                  >
                    <Briefcase className="w-4 h-4" />
                    Move to Review
                  </button>
                  <button
                    onClick={() => handleStageClick('accepted')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-xl font-semibold hover:bg-green-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={employee.stage === 'accepted' || employee.stage === 'rejected'}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleStageClick('rejected')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-xl font-semibold hover:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={employee.stage === 'accepted' || employee.stage === 'rejected'}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>

              {(employee.stage === 'review' || employee.stage === 'accepted' || employee.stage === 'rejected') && interviewSchedule && (
                <div className="p-6 bg-[#161950]/10 border-2 border-[#161950]/20 rounded-xl">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Video className="w-5 h-5 text-blue-600" />
                    Interview Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">Date & Time</p>
                      <p className="text-sm text-gray-900 font-semibold">
                        {new Date(interviewSchedule.interviewDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })} at {interviewSchedule.interviewTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">Platform</p>
                      <p className="text-sm text-gray-900">{interviewSchedule.platform === 'google-meet' ? 'Google Meet' : interviewSchedule.platform === 'teams' ? 'MS Teams' : interviewSchedule.platform === 'zoom' ? 'Zoom' : 'Other'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">Meeting Link</p>
                      <a 
                        href={interviewSchedule.interviewLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 break-all"
                      >
                        <LinkIcon className="w-3 h-3 flex-shrink-0" />
                        Join Interview
                      </a>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">Interviewer</p>
                      <p className="text-sm text-gray-900">{interviewSchedule.interviewerName}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 bg-white border border-gray-200 rounded-xl">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Application Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Applied On</p>
                      <p className="text-sm text-gray-900 font-semibold">
                        {new Date(employee.appliedDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Employee ID</p>
                      <p className="text-sm text-gray-900 font-semibold">{employee.number}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => onDownloadCV(employee.cvUrl, employee.name)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl font-semibold hover:from-black hover:to-gray-900 transition-all shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    Download CV
                  </button>
                  <button
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    <Mail className="w-4 h-4" />
                    Send Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      <StageChangeModal
        isOpen={isStageModalOpen}
        employeeName={employee?.name || ''}
        currentStage={employee?.stage || ''}
        targetStage={targetStage}
        onConfirm={handleStageConfirm}
        onClose={() => setIsStageModalOpen(false)}
      />
      
      <InterviewFeedbackModal
        isOpen={isInterviewModalOpen}
        employeeName={employee?.name || ''}
        onConfirm={handleInterviewFeedback}
        onClose={() => setIsInterviewModalOpen(false)}
      />
      
      <ScheduleInterviewModal
        isOpen={isScheduleModalOpen}
        employeeName={employee?.name || ''}
        employeeEmail={employee?.email}
        onConfirm={handleScheduleInterview}
        onClose={() => setIsScheduleModalOpen(false)}
      />
    </div>
  );
}
