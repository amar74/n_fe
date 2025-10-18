import { memo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHeaderProps } from '../types';

const SectionHeader = memo(({ title, buttonText = 'Add New', onButtonClick }: SectionHeaderProps) => {
  return (
    <div className="px-6 py-6 border-b border-gray-100">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {buttonText && (
          <Button 
            className="h-10 px-4 bg-indigo-950 hover:bg-indigo-900 rounded-lg flex items-center gap-2"
            onClick={onButtonClick}
          >
            <Plus className="w-4 h-4 text-white" />
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
});

SectionHeader.displayName = 'SectionHeader';

export default SectionHeader;