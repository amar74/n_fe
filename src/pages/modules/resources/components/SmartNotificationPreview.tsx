import { Mail, Send, Sparkles, Check, Clock, User } from 'lucide-react';

type SmartNotificationPreviewProps = {
  employeeName: string;
  employeeEmail: string;
  role: string;
  companyName?: string;
};

export function SmartNotificationPreview({
  employeeName,
  employeeEmail,
  role,
  companyName = 'AEC Business Suite'
}: SmartNotificationPreviewProps) {
  const emailTemplate = `
Hi ${employeeName},

Welcome to ${companyName}! 🎉

Your account is ready! You've been assigned the role of ${role}.

Log in to explore your dashboard and upcoming projects.

Here's what you can do next:
• Complete your profile
• Set up your preferences
• Connect with your team
• Review your assigned projects

If you have any questions, feel free to reach out to your team lead or HR.

Best regards,
The ${companyName} Team
  `.trim();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200" style={{ backgroundColor: '#e8f5e9' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Sparkles className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">AI Smart Notification</h3>
              <p className="text-sm text-gray-600 mt-1">Personalized Welcome Email</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-bold shadow-md">
            <Check className="w-4 h-4" />
            Ready to Send
          </div>
        </div>
      </div>

      {/* Email Stats */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Recipient</p>
            <p className="text-sm text-gray-900 font-semibold truncate">{employeeEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#f0f0ff' }}>
            <User className="w-5 h-5" style={{ color: '#161950' }} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Name</p>
            <p className="text-sm text-gray-900 font-semibold">{employeeName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Clock className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Send Time</p>
            <p className="text-sm text-gray-900 font-semibold">Immediately</p>
          </div>
        </div>
      </div>

      {/* Email Preview */}
      <div className="p-6">
        <div className="mb-4">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Email Subject</label>
          <div className="mt-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm font-semibold text-gray-900">
              Welcome to {companyName} 🎉
            </p>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Email Body</label>
          <div className="mt-2 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
              {emailTemplate}
            </div>
          </div>
        </div>
      </div>

      {/* AI Features */}
      <div className="p-6 border-t border-gray-200" style={{ backgroundColor: '#f0f0ff' }}>
        <div className="flex items-start gap-3 mb-4">
          <Sparkles className="w-5 h-5 mt-0.5" style={{ color: '#161950' }} />
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-2">AI Personalization Features</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Auto-generates personalized content based on employee role</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Includes role-specific next steps and resources</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Tracking status: Delivered, Opened, Clicked</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Sent via Notification service with analytics</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-6 bg-white border-t border-gray-200 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-gray-900">Ready to send welcome email?</p>
          <p className="text-xs text-gray-600 mt-1">Email will be sent via notification service with tracking</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg">
          <Send className="w-4 h-4" />
          Send Email
        </button>
      </div>
    </div>
  );
}

