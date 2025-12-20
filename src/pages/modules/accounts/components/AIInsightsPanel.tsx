import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Target, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { useAccountHealth, HealthInsights } from '@/hooks/accounts';

interface AIInsightsPanelProps {
  accountId: string;
  accountName: string;
}

export function AIInsightsPanel({ accountId, accountName }: AIInsightsPanelProps) {
  const { getHealthInsights, isFetchingInsights } = useAccountHealth();
  const [insights, setInsights] = useState<HealthInsights | null>(null);

  useEffect(() => {
    loadInsights();
  }, [accountId]);

  const loadInsights = async () => {
    const data = await getHealthInsights(accountId);
    if (data) {
      setInsights(data);
    }
  };

  if (isFetchingInsights) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#151950]" />
          <p className="text-gray-600">Analyzing account with AI...</p>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
          <Sparkles className="w-12 h-12 text-gray-400" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">No AI Insights Available</h3>
            <p className="text-gray-600 text-sm">
              AI insights will appear here once the account health score is calculated.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 7) return 'bg-red-100 text-red-700 border-red-200';
    if (priority >= 4) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI-Powered Insights</h3>
            <p className="text-gray-600 text-sm">{accountName}</p>
          </div>
        </div>

        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${getPriorityColor(insights.priority_score)}`}>
          <span className="font-semibold">Priority Score: {insights.priority_score}/10</span>
        </div>
      </div>

      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Health Summary
        </h4>
        <p className="text-gray-700 leading-relaxed">{insights.health_summary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {insights.strengths.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Strengths
            </h4>
            <ul className="space-y-2">
              {insights.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {insights.weaknesses.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Weaknesses
            </h4>
            <ul className="space-y-2">
              {insights.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        )}

        {insights.opportunities.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Opportunities
            </h4>
            <ul className="space-y-2">
              {insights.opportunities.map((opportunity, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                  {opportunity}
                </li>
              ))}
            </ul>
          </div>
        )}

        {insights.risks.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Risks
            </h4>
            <ul className="space-y-2">
              {insights.risks.map((risk, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {insights.action_items.length > 0 && (
        <div className="p-6 bg-indigo-50 border-t border-indigo-100">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-indigo-600" />
            Recommended Actions
          </h4>
          <div className="space-y-3">
            {insights.action_items.map((action, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-white rounded-lg border border-indigo-200"
              >
                <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700 pt-0.5">{action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {insights.next_review_date && (
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Next Review Recommended:{' '}
            <span className="font-semibold text-gray-900">
              {new Date(insights.next_review_date).toLocaleDateString()}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

