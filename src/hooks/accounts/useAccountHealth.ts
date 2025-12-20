import { useState } from 'react';
import { aiApiClient } from '@/services/api/client';
import { useToast } from '@/hooks/shared';

export interface HealthScoreComponents {
  data_quality: number;
  communication: number;
  business_value: number;
  completeness: number;
}

export interface HealthScoreResponse {
  health_score: number;
  risk_level: 'low' | 'medium' | 'high';
  health_trend: 'up' | 'down' | 'stable';
  last_analysis: string;
  components: HealthScoreComponents;
}

export interface HealthInsights {
  account_id: string;
  account_name: string;
  health_summary: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  risks: string[];
  action_items: string[];
  priority_score: number;
  next_review_date?: string;
}

export function useAccountHealth() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [isFetchingInsights, setIsFetchingInsights] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const calculateHealthScore = async (
    accountId: string,
    forceRecalculation: boolean = false
  ): Promise<HealthScoreResponse | null> => {
    setIsCalculating(true);
    setError(null);

    try {
      const response = await aiApiClient.post(
        `/ai/health-scoring/calculate/${accountId}`,
        forceRecalculation ? { force_recalculation: true } : {}
      );

      toast({
        title: '✅ Health Score Calculated',
        description: `Health score: ${response.data.health_score}% | Risk: ${response.data.risk_level}`,
      });

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to calculate health score';
      setError(errorMessage);
      toast({
        title: '❌ Health Score Calculation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  const getHealthScore = async (accountId: string): Promise<HealthScoreResponse | null> => {
    setIsCalculating(true);
    setError(null);

    try {
      const response = await aiApiClient.get(`/ai/health-scoring/${accountId}`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch health score';
      setError(errorMessage);
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  const getHealthInsights = async (accountId: string): Promise<HealthInsights | null> => {
    setIsFetchingInsights(true);
    setError(null);

    try {
      const response = await aiApiClient.get(`/ai/health-scoring/${accountId}/insights`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch health insights';
      setError(errorMessage);
      toast({
        title: '❌ Failed to Load Insights',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsFetchingInsights(false);
    }
  };

  const getHealthAnalytics = async (): Promise<any> => {
    try {
      const response = await aiApiClient.get('/ai/health-scoring/analytics/dashboard');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch health analytics';
      setError(errorMessage);
      return null;
    }
  };

  return {
    calculateHealthScore,
    getHealthScore,
    getHealthInsights,
    getHealthAnalytics,
    isCalculating,
    isFetchingInsights,
    error,
  };
}

