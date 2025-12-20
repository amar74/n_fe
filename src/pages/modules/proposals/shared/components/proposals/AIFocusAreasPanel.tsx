import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Lightbulb, AlertTriangle } from 'lucide-react';

interface FocusArea {
  proposalId: string | number;
  proposalName: string;
  priority: 'critical' | 'high' | 'medium';
  reason: string;
  action: string;
}

interface AIFocusAreasPanelProps {
  focusAreas: FocusArea[];
  onTakeAction?: (proposalId: string | number) => void;
}

export function AIFocusAreasPanel({ focusAreas, onTakeAction }: AIFocusAreasPanelProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (focusAreas.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-orange-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="h-5 w-5 text-orange-600" />
        <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit">AI Focus Areas - Priority Action Required</h3>
        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
          {focusAreas.length} Issues
        </Badge>
      </div>
      <div>
        <div className="space-y-3">
          {focusAreas.map((focus) => (
            <div
              key={focus.proposalId}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold font-outfit text-[#1A1A1A]">{focus.proposalName}</h4>
                  <Badge variant="outline" className={getPriorityColor(focus.priority)}>
                    {focus.priority.charAt(0).toUpperCase() + focus.priority.slice(1)} Priority
                  </Badge>
                  <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                    {focus.reason}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 font-outfit">
                  <Lightbulb className="h-3 w-3 inline mr-1" />
                  AI Recommendation: {focus.action}
                </p>
              </div>
              {onTakeAction && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onTakeAction(focus.proposalId)}
                  className="ml-4 border-gray-300"
                >
                  Take Action
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

