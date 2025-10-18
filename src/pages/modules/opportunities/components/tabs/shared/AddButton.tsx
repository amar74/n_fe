import { memo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddButtonProps {
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

const AddButton = memo(({ 
  onClick, 
  className = '', 
  children = 'Add New', 
  disabled = false,
  loading = false 
}: AddButtonProps) => {
  const handleClick = () => {
    if (onClick && !disabled && !loading) {
      onClick();
    }
  };

  return (
    <Button 
      className={`h-10 px-4 bg-indigo-950 hover:bg-indigo-900 rounded-lg flex items-center gap-2 ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      <Plus className="w-4 h-4 text-white" />
      {loading ? 'Adding...' : children}
    </Button>
  );
});

AddButton.displayName = 'AddButton';

export default AddButton;