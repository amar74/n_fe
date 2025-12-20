import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { FileCheck, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ComplianceCheckResult {
  score: number;
  is_compliant: boolean;
  suggestions: string[];
  issues: string[];
}

interface AIComplianceCardProps {
  compliance: ComplianceCheckResult;
  onApplySuggestion?: (suggestion: string) => void;
}

export function AIComplianceCard({ compliance, onApplySuggestion }: AIComplianceCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      <div className="mb-6">
        <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-[#161950]" />
          AI Compliance Score
        </h3>
      </div>
      <div>
        <div className="space-y-4">
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${
              compliance.score >= 80 ? 'text-green-600' : 
              compliance.score >= 60 ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {compliance.score}%
            </div>
            <Progress value={compliance.score} className="mt-2" />
            <div className="flex items-center justify-center gap-2 mt-2">
              {compliance.is_compliant ? (
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Compliant
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-100 text-red-700">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Needs Attention
                </Badge>
              )}
            </div>
          </div>
          
          {compliance.issues.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-sm text-red-900">Issues Found</span>
              </div>
              <ul className="space-y-1">
                {compliance.issues.map((issue, index) => (
                  <li key={index} className="text-sm text-red-700">• {issue}</li>
                ))}
              </ul>
            </div>
          )}

          {compliance.suggestions.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-sm text-yellow-900">AI Suggestions</span>
              </div>
              <div className="space-y-2">
                {compliance.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <span className="text-sm flex-1">{suggestion}</span>
                    {onApplySuggestion && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onApplySuggestion(suggestion)}
                        className="ml-2"
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

