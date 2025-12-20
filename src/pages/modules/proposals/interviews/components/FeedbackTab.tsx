import { MessageSquare, Bot, CheckCircle, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface FeedbackTabProps {
  interviewDate?: string;
  aiSuccessProbability?: number;
}

export default function FeedbackTab({ interviewDate, aiSuccessProbability = 85 }: FeedbackTabProps) {
  const criticalPath = [
    'Complete presentation slides by Dec 16',
    'Review all panel member backgrounds',
    'Finalize Q&A preparation responses',
    'Schedule practice session with team',
  ];

  const suggestedActions = [
    'Focus on technical approach section - this is a key differentiator',
    'Prepare detailed responses for budget and timeline questions',
    'Review similar past projects to strengthen experience examples',
    'Practice presentation timing to ensure it fits within allocated duration',
  ];

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
            <MessageSquare className="h-5 w-5 text-gray-600" />
            Interview Feedback
          </CardTitle>
          <CardDescription className="font-outfit">
            Feedback will be available after the interview presentation is completed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold font-outfit text-[#1A1A1A] mb-2">
              No Feedback Available Yet
            </h3>
            <p className="text-gray-600 font-outfit">
              Panel feedback and performance analysis will be available after the interview is
              conducted on {interviewDate || 'the scheduled date'}.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-[#161950]/20 bg-[#161950]/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
            <Bot className="h-5 w-5 text-[#161950]" />
            AI Preparation Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-white rounded-lg border border-[#161950]/20">
              <h4 className="font-semibold font-outfit text-[#1A1A1A] mb-2">
                Success Probability Analysis
              </h4>
              <p className="text-sm font-outfit text-gray-700">
                Based on current preparation progress and historical data, this interview has a{' '}
                {aiSuccessProbability}% success probability. The prediction confidence is 88%.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-[#161950]/20">
              <h4 className="font-semibold font-outfit text-[#1A1A1A] mb-2">Critical Path Items</h4>
              <ul className="text-sm font-outfit text-gray-700 space-y-1">
                {criticalPath.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-3 bg-white rounded-lg border border-[#161950]/20">
              <h4 className="font-semibold font-outfit text-[#1A1A1A] mb-2">AI Recommendations</h4>
              <ul className="text-sm font-outfit text-gray-700 space-y-1">
                {suggestedActions.map((action, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Lightbulb className="h-3 w-3 text-[#161950]" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

