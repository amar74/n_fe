import { X, Edit } from 'lucide-react';
import { AccountNoteResponse } from '@/types/accountNotes';

type ViewNoteModalProps = {
  isOpen: boolean;
  note: AccountNoteResponse | null;
  onClose: () => void;
  onEdit: (note: AccountNoteResponse) => void;
}

export function ViewNoteModal({ isOpen, note, onClose, onEdit }: ViewNoteModalProps) {
  if (!isOpen || !note) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleEdit = () => {
    onEdit(note);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-slate-800 font-['Outfit']">Note Details</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="px-3 py-1.5 text-sm font-medium text-indigo-950 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors font-['Outfit'] inline-flex items-center gap-1.5"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          
          <div className="flex gap-8">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 font-['Outfit']">
                Date
              </label>
              <p className="text-sm text-slate-800 font-['Outfit']">
                {formatDate(note.date)}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 font-['Outfit']">
                Category
              </label>
              <p className="text-sm text-slate-800 font-['Outfit']">
                Transportation
              </p>
            </div>
            {note.created_at && (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 font-['Outfit']">
                  Created
                </label>
                <p className="text-sm text-slate-800 font-['Outfit']">
                  {formatDate(note.created_at)}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 font-['Outfit']">
              Title
            </label>
            <h3 className="text-lg font-semibold text-slate-800 font-['Outfit']">
              {note.title}
            </h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 font-['Outfit']">
              Content
            </label>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-['Outfit']">
                {note.content}
              </p>
            </div>
          </div>

          {note.updated_at && note.updated_at !== note.created_at && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 font-['Outfit']">
                Last updated: {formatDate(note.updated_at)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
