import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProposalHeaderProps {
  proposalName: string;
  clientName: string;
  stage: string;
  onSave?: () => void;
  onEdit?: () => void;
  onBack?: () => void;
  backPath?: string;
}

export function ProposalHeader({ proposalName, clientName, stage, onSave, onEdit, onBack, backPath = "/proposals" }: ProposalHeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {onBack ? (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            ) : (
              <Link
                to={backPath}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
            )}
            <div>
              <h1 className="text-lg font-semibold font-outfit text-[#1A1A1A]">
                {proposalName}
              </h1>
              <p className="text-sm text-gray-600 font-outfit">
                {clientName || 'Select client'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {onEdit && (
              <Button
                onClick={onEdit}
                className="bg-[#161950] hover:bg-[#0f1440] font-outfit"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {onSave && (
              <Button
                onClick={onSave}
                className="bg-[#161950] hover:bg-[#0f1440] font-outfit"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            )}
            <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200 font-outfit">
              {stage}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}

