import { Progress } from '@/components/ui/progress';

interface ProposalProgressCardProps {
  progress: number;
}

export function ProposalProgressCard({ progress }: ProposalProgressCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-[#1A1A1A] text-xl font-semibold font-outfit mb-1">
            Proposal Progress
          </h3>
          <p className="text-gray-600 text-sm font-outfit">
            Track your progress through the proposal creation process
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold font-outfit text-[#161950]">
            {progress}%
          </div>
          <div className="text-sm text-gray-600 font-outfit">Complete</div>
        </div>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}

