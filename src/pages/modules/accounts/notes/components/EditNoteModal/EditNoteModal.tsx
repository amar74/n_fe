import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NoteFormData } from '../../NotesTab.types';
import { AccountNoteResponse } from '@/types/accountNotes';

type EditNoteModalProps = {
  isOpen: boolean;
  note: AccountNoteResponse | null;
  onClose: () => void;
  onSave: (noteId: string, data: NoteFormData) => Promise<any>;
  isLoading?: boolean;
  errors?: Record<string, string>;
}

export function EditNoteModal({ 
  isOpen, 
  note, 
  onClose, 
  onSave, 
  isLoading = false,
  errors = {}
}: EditNoteModalProps) {
  const [formData, setFormData] = useState<NoteFormData>({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Update form data when note changes
  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        date: new Date(note.date).toISOString().split('T')[0],
      });
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note) return;
    
    try {
      await onSave(note.id, formData);
      onClose();
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const handleChange = (field: keyof NoteFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen || !note) return null;

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
          <h2 className="text-xl font-semibold text-slate-800 font-['Outfit']">Edit Note</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div className="flex gap-5">
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-['Outfit']">
                Note Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter note title"
                required
                className="w-full h-11 px-3.5 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-slate-800 text-sm font-normal font-['Outfit'] leading-tight transition-all duration-200 hover:border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              {errors?.title && (
                <span className="text-red-500 text-sm font-['Outfit'] mt-1">{errors.title}</span>
              )}
            </div>

            
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-['Outfit']">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
                className="w-full h-11 px-3.5 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-slate-800 text-sm font-normal font-['Outfit'] leading-tight transition-all duration-200 hover:border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              {errors?.date && (
                <span className="text-red-500 text-sm font-['Outfit'] mt-1">{errors.date}</span>
              )}
            </div>
          </div>

          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-['Outfit']">
              Note Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Enter your note content here..."
              required
              rows={6}
              className="w-full px-3.5 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#E5E7EB] text-slate-800 text-sm font-normal font-['Outfit'] leading-tight resize-none transition-all duration-200 hover:border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {errors?.content && (
              <span className="text-red-500 text-sm font-['Outfit'] mt-1">{errors.content}</span>
            )}
          </div>

          
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-slate-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-['Outfit']"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title.trim() || !formData.content.trim()}
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-950 rounded-lg hover:bg-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-['Outfit']"
            >
              {isLoading ? 'Updating...' : 'Update Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
