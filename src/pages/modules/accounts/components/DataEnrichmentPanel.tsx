import { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import { aiApiClient } from '@/services/api/client';
import { useToast } from '@/hooks/shared';

interface EnrichmentUpdate {
  field: string;
  old_value: any;
  new_value: any;
  reason: string;
}

interface EnrichmentResult {
  account_id: string;
  enriched_at: string;
  updates: EnrichmentUpdate[];
  confidence_scores: Record<string, number>;
  sources: string[];
  error?: string;
}

interface DataEnrichmentPanelProps {
  accountId: string;
  accountName: string;
  onEnrichmentComplete?: () => void;
}

export function DataEnrichmentPanel({ accountId, accountName, onEnrichmentComplete }: DataEnrichmentPanelProps) {
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentResult, setEnrichmentResult] = useState<EnrichmentResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const handleEnrich = async () => {
    setIsEnriching(true);
    setEnrichmentResult(null);
    
    try {
      const response = await aiApiClient.post<EnrichmentResult>(`/ai/enrich/${accountId}`);
      const result = response.data;
      
      setEnrichmentResult(result);
      
      if (result.updates.length > 0) {
        toast({
          title: '✅ Data Enrichment Complete',
          description: `Found ${result.updates.length} potential updates for ${accountName}`,
        });
        onEnrichmentComplete?.();
      } else {
        toast({
          title: 'ℹ️ No Updates Found',
          description: 'Account data is already up to date or no new information was found.',
        });
      }
    } catch (error: any) {
      toast({
        title: '❌ Enrichment Failed',
        description: error.response?.data?.detail || 'Failed to enrich account data',
        variant: 'destructive',
      });
    } finally {
      setIsEnriching(false);
    }
  };

  const formatFieldName = (field: string) => {
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (confidence >= 0.7) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">AI Data Enrichment</h3>
              <p className="text-gray-600 text-sm">Automated data updates from multiple sources</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleEnrich}
          disabled={isEnriching}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isEnriching ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Enriching Data...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              <span>Enrich Account Data</span>
            </>
          )}
        </button>
      </div>

      {enrichmentResult && (
        <div className="p-6 space-y-4">
          {enrichmentResult.error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Enrichment Error</span>
              </div>
              <p className="text-sm text-red-700 mt-2">{enrichmentResult.error}</p>
            </div>
          ) : enrichmentResult.updates.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">All Data Up to Date</span>
              </div>
              <p className="text-sm text-emerald-700 mt-2">
                No updates found. Your account data appears to be current.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">
                  Found {enrichmentResult.updates.length} Potential Updates
                </h4>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {showDetails ? 'Hide' : 'Show'} Details
                </button>
              </div>

              {showDetails && (
                <div className="space-y-3">
                  {enrichmentResult.updates.map((update, index) => {
                    const confidence = enrichmentResult.confidence_scores[update.field] || 0;
                    return (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              {formatFieldName(update.field)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(confidence)}`}>
                              {Math.round(confidence * 100)}% confidence
                            </span>
                          </div>
                          {enrichmentResult.sources.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <ExternalLink className="w-3 h-3" />
                              <span>{enrichmentResult.sources[0]}</span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 mb-1">Current Value:</p>
                            <p className="text-gray-900 font-medium">
                              {update.old_value || <span className="text-gray-400 italic">Not set</span>}
                            </p>
                          </div>
                          <div>
                            <p className="text-indigo-600 mb-1">Suggested Value:</p>
                            <p className="text-indigo-900 font-semibold">
                              {update.new_value || <span className="text-gray-400 italic">N/A</span>}
                            </p>
                          </div>
                        </div>

                        {update.reason && (
                          <p className="text-xs text-gray-500 mt-2 italic">
                            {update.reason}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> These are suggested updates. Review each change carefully before applying.
                </p>
              </div>
            </>
          )}

          {enrichmentResult.sources.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2">Data Sources:</p>
              <div className="flex flex-wrap gap-2">
                {enrichmentResult.sources.map((source, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                  >
                    {source.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!enrichmentResult && !isEnriching && (
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            AI Data Enrichment automatically updates account information from websites, 
            public databases, and other sources. Click the button above to start enrichment.
          </p>
        </div>
      )}
    </div>
  );
}

