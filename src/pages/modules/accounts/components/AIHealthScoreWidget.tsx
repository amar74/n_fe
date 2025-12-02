import { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, Minus, RefreshCw, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAccountHealth, HealthScoreResponse } from '@/hooks/useAccountHealth';

interface AIHealthScoreWidgetProps {
  accountId: string;
  initialScore?: number;
  initialRiskLevel?: string;
}

export function AIHealthScoreWidget({ accountId, initialScore, initialRiskLevel }: AIHealthScoreWidgetProps) {
  const { calculateHealthScore, getHealthScore, isCalculating } = useAccountHealth();
  const [healthData, setHealthData] = useState<HealthScoreResponse | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadHealthScore();
  }, [accountId]);

  const loadHealthScore = async () => {
    try {
      const data = await getHealthScore(accountId);
      if (data) {
        // Backend returns ai_health_score, not health_score
        const healthScoreValue = data.ai_health_score ?? data.health_score;
        const healthScore = typeof healthScoreValue === 'number' && !isNaN(healthScoreValue)
          ? Number(healthScoreValue)
          : (typeof healthScoreValue === 'string' ? parseFloat(healthScoreValue) : 0);
        
        // Backend returns score_breakdown, map to components format
        const scoreBreakdown = data.score_breakdown || {};
        const components = {
          data_quality: Number(data.data_quality_score ?? scoreBreakdown.data_quality ?? 0),
          communication: Number(data.communication_frequency ?? scoreBreakdown.communication ?? 0),
          business_value: Number(data.win_rate ?? scoreBreakdown.business_value ?? scoreBreakdown.win_rate ?? 0),
          completeness: Number(scoreBreakdown.completeness ?? 0),
        };
        
        setHealthData({
          health_score: Math.max(0, Math.min(100, healthScore)),
          risk_level: data.risk_level || (initialRiskLevel as any) || 'medium',
          health_trend: data.health_trend || 'stable',
          last_analysis: data.last_ai_analysis || data.last_analysis || new Date().toISOString(),
          components: components,
        });
      } else if (initialScore !== undefined && !isNaN(initialScore) && initialScore >= 0) {
        // Use initial score as fallback
        setHealthData({
          health_score: initialScore,
          risk_level: (initialRiskLevel as any) || 'medium',
          health_trend: 'stable',
          last_analysis: new Date().toISOString(),
          components: {
            data_quality: 0,
            communication: 0,
            business_value: 0,
            completeness: 0,
          },
        });
      } else {
        // If no data and no initial score, calculate it
        const calculated = await calculateHealthScore(accountId, false);
        if (calculated) {
          const healthScoreValue = calculated.ai_health_score ?? calculated.health_score;
          const healthScore = typeof healthScoreValue === 'number' && !isNaN(healthScoreValue)
            ? Number(healthScoreValue)
            : (typeof healthScoreValue === 'string' ? parseFloat(healthScoreValue) : 0);
          
          const scoreBreakdown = calculated.score_breakdown || {};
          const components = {
            data_quality: Number(calculated.data_quality_score ?? scoreBreakdown.data_quality ?? 0),
            communication: Number(calculated.communication_frequency ?? scoreBreakdown.communication ?? 0),
            business_value: Number(calculated.win_rate ?? scoreBreakdown.business_value ?? scoreBreakdown.win_rate ?? 0),
            completeness: Number(scoreBreakdown.completeness ?? 0),
          };
          
          setHealthData({
            health_score: Math.max(0, Math.min(100, healthScore)),
            risk_level: calculated.risk_level || 'medium',
            health_trend: calculated.health_trend || 'stable',
            last_analysis: calculated.last_ai_analysis || calculated.last_analysis || new Date().toISOString(),
            components: components,
          });
        }
      }
    } catch (error) {
      console.error('Error loading health score:', error);
      // Set default values on error
      if (initialScore !== undefined && !isNaN(initialScore) && initialScore >= 0) {
        setHealthData({
          health_score: initialScore,
          risk_level: (initialRiskLevel as any) || 'medium',
          health_trend: 'stable',
          last_analysis: new Date().toISOString(),
          components: {
            data_quality: 0,
            communication: 0,
            business_value: 0,
            completeness: 0,
          },
        });
      }
    }
  };

  const handleRecalculate = async () => {
    const data = await calculateHealthScore(accountId, true);
    if (data) {
      setHealthData(data);
    }
  };

  const getRiskConfig = (risk: string) => {
    switch (risk) {
      case 'low':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          icon: CheckCircle2,
          label: 'Low Risk',
        };
      case 'high':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          icon: AlertTriangle,
          label: 'High Risk',
        };
      default:
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          icon: AlertCircle,
          label: 'Medium Risk',
        };
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'from-emerald-50 to-emerald-100';
    if (score >= 60) return 'from-amber-50 to-amber-100';
    return 'from-red-50 to-red-100';
  };

  if (!healthData) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#151950]"></div>
        </div>
      </div>
    );
  }

  const riskConfig = getRiskConfig(healthData.risk_level);
  const RiskIcon = riskConfig.icon;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#151950] to-[#1e2570] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">AI Health Score</h3>
              <p className="text-white/70 text-sm">
                Last updated: {new Date(healthData.last_analysis).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={handleRecalculate}
            disabled={isCalculating}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            title="Recalculate Health Score"
          >
            <RefreshCw className={`w-5 h-5 text-white ${isCalculating ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Score Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`text-6xl font-bold text-white`}>
              {typeof healthData.health_score === 'number' && !isNaN(healthData.health_score) 
                ? Math.round(healthData.health_score) 
                : 0}
              <span className="text-2xl text-white/70">%</span>
            </div>
            <div className="flex flex-col gap-1">
              {getTrendIcon(healthData.health_trend)}
              <span className="text-white/70 text-sm capitalize">{healthData.health_trend}</span>
            </div>
          </div>

          {/* Risk Badge */}
          <div className={`${riskConfig.bg} ${riskConfig.border} border-2 rounded-xl px-4 py-3 flex items-center gap-2`}>
            <RiskIcon className={`w-5 h-5 ${riskConfig.text}`} />
            <span className={`${riskConfig.text} font-semibold`}>{riskConfig.label}</span>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="p-6">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between text-left mb-4 hover:bg-gray-50 p-2 rounded-lg transition-colors"
        >
          <span className="font-semibold text-gray-900">Health Components</span>
          <span className="text-sm text-gray-500">{showDetails ? 'Hide' : 'Show'} Details</span>
        </button>

        {showDetails && healthData.components && (
          <div className="space-y-4">
            {Object.entries(healthData.components).map(([key, value]) => {
              const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
              const percentage = Math.round(Math.max(0, Math.min(100, numValue)));
              const color = percentage >= 80 ? 'bg-emerald-500' : percentage >= 60 ? 'bg-amber-500' : 'bg-red-500';

              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className={`text-sm font-semibold ${getScoreColor(percentage)}`}>
                      {percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

