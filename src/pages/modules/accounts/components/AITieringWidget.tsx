import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, Loader2, RefreshCw, Info } from 'lucide-react';
import { aiApiClient } from '@/services/api/client';
import { useToast } from '@/hooks/use-toast';

interface TierSuggestion {
  account_id: string;
  current_tier: string | null;
  suggested_tier: string;
  confidence_score: number;
  reasoning: string;
  analysis: {
    revenue_potential: number;
    strategic_value: number;
    relationship_strength: number;
    growth_potential: number;
    risk_level: number;
    confidence_score: number;
    factors: Record<string, any>;
  };
  suggested_at: string;
  recommendation: string;
}

interface AITieringWidgetProps {
  accountId: string;
  currentTier?: string;
}

export function AITieringWidget({ accountId, currentTier }: AITieringWidgetProps) {
  const [suggestion, setSuggestion] = useState<TierSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTierSuggestion();
  }, [accountId]);

  const loadTierSuggestion = async () => {
    setIsLoading(true);
    try {
      const response = await aiApiClient.post<TierSuggestion>(`/ai/tier/${accountId}`);
      setSuggestion(response.data);
    } catch (error: any) {
      console.error('Error loading tier suggestion:', error);
      // Don't show error toast on initial load
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await aiApiClient.post<TierSuggestion>(`/ai/tier/${accountId}`);
      setSuggestion(response.data);
      toast({
        title: '✅ Tier Suggestion Updated',
        description: `Suggested tier: ${response.data.suggested_tier.toUpperCase()}`,
      });
    } catch (error: any) {
      toast({
        title: '❌ Failed to Refresh',
        description: error.response?.data?.detail || 'Failed to get tier suggestion',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'tier_1':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-200',
          badge: 'bg-purple-100 text-purple-800',
        };
      case 'tier_2':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          badge: 'bg-blue-100 text-blue-800',
        };
      case 'tier_3':
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
          badge: 'bg-gray-100 text-gray-800',
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
          badge: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const formatTierName = (tier: string | null) => {
    if (!tier) return 'Not Set';
    return tier.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading && !suggestion) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-gray-600">Analyzing account tier...</p>
        </div>
      </div>
    );
  }

  if (!suggestion) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
          <Sparkles className="w-12 h-12 text-gray-400" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">No Tier Suggestion Available</h3>
            <p className="text-gray-600 text-sm mb-4">
              Click refresh to generate an AI-powered tier suggestion.
            </p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              Generate Suggestion
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentTierColor = getTierColor(suggestion.current_tier || '');
  const suggestedTierColor = getTierColor(suggestion.suggested_tier);
  const hasChange = suggestion.current_tier !== suggestion.suggested_tier;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">AI Tier Suggestion</h3>
              <p className="text-gray-600 text-sm">Strategic account classification</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
            title="Refresh suggestion"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Current vs Suggested */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg border-2 ${currentTierColor.border} ${currentTierColor.bg}`}>
            <p className="text-xs font-semibold text-gray-600 mb-2">Current Tier</p>
            <p className={`text-lg font-bold ${currentTierColor.text}`}>
              {formatTierName(suggestion.current_tier)}
            </p>
          </div>
          <div className={`p-4 rounded-lg border-2 ${suggestedTierColor.border} ${suggestedTierColor.bg}`}>
            <p className="text-xs font-semibold text-gray-600 mb-2">Suggested Tier</p>
            <p className={`text-lg font-bold ${suggestedTierColor.text}`}>
              {formatTierName(suggestion.suggested_tier)}
            </p>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Confidence:</span>
            <span className={`text-sm font-bold ${
              suggestion.confidence_score >= 80 ? 'text-emerald-600' :
              suggestion.confidence_score >= 60 ? 'text-amber-600' :
              'text-red-600'
            }`}>
              {Math.round(suggestion.confidence_score)}%
            </span>
          </div>
          {hasChange && (
            <div className="flex items-center gap-1 text-sm text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Change Recommended</span>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Breakdown */}
      <div className="p-6 space-y-4">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Analysis Factors
        </h4>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Revenue Potential', value: suggestion.analysis.revenue_potential, key: 'revenue' },
            { label: 'Strategic Value', value: suggestion.analysis.strategic_value, key: 'strategic' },
            { label: 'Relationship Strength', value: suggestion.analysis.relationship_strength, key: 'relationship' },
            { label: 'Growth Potential', value: suggestion.analysis.growth_potential, key: 'growth' },
          ].map(({ label, value, key }) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className="text-sm font-bold text-gray-900">{Math.round(value)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    value >= 80 ? 'bg-emerald-500' :
                    value >= 60 ? 'bg-amber-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(value, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reasoning */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Info className="w-5 h-5 text-indigo-600" />
          AI Reasoning
        </h4>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {suggestion.reasoning}
        </p>
      </div>

      {/* Recommendation */}
      {suggestion.recommendation && (
        <div className="p-6 bg-indigo-50 border-t border-indigo-100">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Recommendation</h4>
              <p className="text-sm text-gray-700">{suggestion.recommendation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

