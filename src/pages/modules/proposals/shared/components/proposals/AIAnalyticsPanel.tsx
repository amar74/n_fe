import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Target, AlertTriangle, Activity, TrendingUp } from 'lucide-react';

interface AIAnalytics {
  win_probability: number;
  completion_confidence: number;
  resource_bottlenecks: string[];
  risk_level: 'low' | 'medium' | 'high';
  suggested_actions: string[];
}

interface AIAnalyticsPanelProps {
  analytics: AIAnalytics;
}

export function AIAnalyticsPanel({ analytics }: AIAnalyticsPanelProps) {

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      <div className="mb-6">
        <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#161950]" />
          AI Predictive Analytics
        </h3>
      </div>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Win Probability */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-[#161950]" />
                  <span className="text-sm font-medium font-outfit text-gray-700">Win Probability</span>
                </div>
                <div className="text-3xl font-bold font-outfit text-[#161950]">
                  {analytics.win_probability}%
                </div>
              </div>

              {/* Completion Confidence */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-[#161950]" />
                  <span className="text-sm font-medium font-outfit text-gray-700">Completion Confidence</span>
                </div>
                <div className="text-3xl font-bold font-outfit text-[#161950]">
                  {analytics.completion_confidence}%
                </div>
              </div>

              {/* Risk Level */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-[#161950]" />
                  <span className="text-sm font-medium font-outfit text-gray-700">Risk Level</span>
                </div>
                <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit">
                  {analytics.risk_level.charAt(0).toUpperCase() + analytics.risk_level.slice(1)}
                </Badge>
              </div>

              {/* Resource Bottlenecks */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-[#161950]" />
                  <span className="text-sm font-medium font-outfit text-gray-700">Resource Bottlenecks</span>
                </div>
                {analytics.resource_bottlenecks.length > 0 ? (
                  <div className="space-y-1">
                    {analytics.resource_bottlenecks.map((bottleneck, index) => (
                      <Badge key={index} variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 mr-1 font-outfit">
                        {bottleneck}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 font-outfit">None identified</p>
                )}
              </div>
            </div>

            {/* Suggested Actions */}
            {analytics.suggested_actions.length > 0 && (
              <div className="mt-6 p-4 bg-[#161950]/5 border border-[#161950]/20 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-[#161950]" />
                  <span className="font-medium text-sm font-outfit text-[#1A1A1A]">AI Suggested Actions</span>
                </div>
                <ul className="space-y-2">
                  {analytics.suggested_actions.map((action, index) => (
                    <li key={index} className="text-sm text-gray-600 font-outfit flex items-start gap-2">
                      <span className="text-[#161950] mt-0.5">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
      </div>
    </div>
  );
}

