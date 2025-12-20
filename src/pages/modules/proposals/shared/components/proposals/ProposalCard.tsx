import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Target, Calendar, DollarSign, ArrowRight, AlertTriangle } from 'lucide-react';

interface ProposalCardProps {
  id: string | number;
  name: string;
  client: string;
  value: string;
  dueDate: string;
  stage: string;
  aiWinProbability: number;
  progressPercentage: number;
  riskLevel?: 'low' | 'medium' | 'high';
  behindSchedule?: boolean;
  onClick?: () => void;
}

export function ProposalCard({
  id,
  name,
  client,
  value,
  dueDate,
  stage,
  aiWinProbability,
  progressPercentage,
  riskLevel,
  behindSchedule,
  onClick,
}: ProposalCardProps) {

  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 hover:border-[#161950] transition-colors cursor-pointer shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg font-outfit text-[#1A1A1A]">{name}</h4>
                      {riskLevel && (
                        <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit">
                          {riskLevel}
                        </Badge>
                      )}
                      {behindSchedule && (
                        <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Behind Schedule
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3 font-outfit">{client}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-4 font-outfit">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">{value}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {dueDate}</span>
                      </div>
                      <span>Stage: {stage}</span>
                    </div>

                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600 font-outfit">Progress</span>
                        <span className="text-xs font-medium font-outfit">{progressPercentage}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 ml-6">
                    <Badge variant="outline" className="bg-[#161950]/5 text-[#161950] border-[#161950]/20 font-outfit">
                      <Target className="h-3 w-3 mr-1" />
                      {aiWinProbability}% Win
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
  );
}

