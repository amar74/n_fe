import React, { useState, useEffect } from 'react';
import { ChevronDown, Calendar, FileText } from 'lucide-react';
import { NoteFormData } from '../../NotesTab.types';
import { DEFAULT_FORM_VALUES } from '../../NotesTab.constants';
import { AccountNoteResponse } from '@/types/accountNotes';

type NotesFormProps = {
  onSubmit: (note: NoteFormData) => Promise<any>;
  isLoading?: boolean;
  initialData?: Partial<AccountNoteResponse>;
  onCancel?: () => void;
  errors?: Record<string, string>;
}

export function NotesForm({ 
  onSubmit, 
  isLoading = false, 
  initialData, 
  onCancel,
  errors = {}
}: NotesFormProps) {
  const [formData, setFormData] = useState<NoteFormData>(() => {
    if (!initialData) {
      return {
        ...DEFAULT_FORM_VALUES,
        date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
      };
    }

    return {
      title: initialData.title || '',
      content: initialData.content || '',
      date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    };
  });

  useEffect(() => {
    if (!initialData) {
      setFormData({
        ...DEFAULT_FORM_VALUES,
        date: new Date().toISOString().split('T')[0],
      });
      return;
    }

    setFormData({
      title: initialData.title || '',
      content: initialData.content || '',
      date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }

    try {
      await onSubmit(formData);
      
      if (!initialData) {
        setFormData({
          ...DEFAULT_FORM_VALUES,
          date: new Date().toISOString().split('T')[0],
        });
      }
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

  const isEditMode = Boolean(initialData);

  return (
    <div className="bg-neutral-50 border border-[#f0f0f0] rounded-[28px] p-6 w-full">
      <div className="flex flex-col gap-6 w-full">
        
        <div className="flex flex-col gap-2">
          <h2 className="font-outfit font-bold text-[#0f0901] text-[24px] leading-normal flex items-center gap-2">
            <FileText className="h-6 w-6" />
            {isEditMode ? 'Edit Note' : 'Add New Note'}
          </h2>
          <p className="font-outfit font-medium text-[#a7a7a7] text-[16px] leading-normal">
            {isEditMode ? 'Update your note details' : 'Create a new note for this account'}
          </p>
        </div>

        
        <div className="h-px w-full bg-[#e6e6e6]" />

        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
          
          <div className="flex gap-4 w-full">
            
            <div className="flex-1 flex flex-col gap-3">
              <label className="font-outfit font-medium text-[#a7a7a7] text-[16px] leading-normal">
                Note Title *
              </label>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter note title"
                  required
                  className={`bg-white border ${errors?.title ? 'border-red-500' : 'border-[#e6e6e6]'} rounded-[14px] h-14 px-6 py-2 font-outfit font-medium text-[#0f0901] text-[16px] focus:border-[#ff7b00] focus:outline-none`}
                />
                {errors?.title && (
                  <span className="text-red-500 text-sm font-outfit">{errors.title}</span>
                )}
              </div>
            </div>

            
            <div className="w-[200px] flex flex-col gap-3">
              <label className="font-outfit font-medium text-[#a7a7a7] text-[16px] leading-normal flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date *
              </label>
              <div className="flex flex-col gap-2">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                  className={`bg-white border ${errors?.date ? 'border-red-500' : 'border-[#e6e6e6]'} rounded-[14px] h-14 px-6 py-2 font-outfit font-medium text-[#0f0901] text-[16px] focus:border-[#ff7b00] focus:outline-none`}
                />
                {errors?.date && (
                  <span className="text-red-500 text-sm font-outfit">{errors.date}</span>
                )}
              </div>
            </div>
          </div>

          
          <div className="flex flex-col gap-3 w-full">
            <label className="font-outfit font-medium text-[#a7a7a7] text-[16px] leading-normal">
              Note Content *
            </label>
            <div className="flex flex-col gap-2">
              <textarea
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                placeholder="Enter your note content here..."
                required
                rows={6}
                className={`bg-white border ${errors?.content ? 'border-red-500' : 'border-[#e6e6e6]'} rounded-[14px] p-6 font-outfit font-medium text-[#0f0901] text-[16px] resize-none focus:border-[#ff7b00] focus:outline-none`}
              />
              {errors?.content && (
                <span className="text-red-500 text-sm font-outfit">{errors.content}</span>
              )}
            </div>
          </div>

          
          <div className="flex items-center justify-end gap-4 pt-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="bg-transparent border border-[#0f0901] rounded-[16px] h-14 flex items-center justify-center px-6 py-2 min-w-[120px]"
              >
                <span className="font-outfit font-medium text-[#0f0901] text-[14px] leading-[24px]">
                  Cancel
                </span>
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || !formData.title.trim() || !formData.content.trim()}
              className="bg-[#0f0901] rounded-[16px] h-14 flex items-center justify-center px-8 py-2 min-w-[160px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-outfit font-medium text-white text-[14px] leading-[24px]">
                {isLoading ? 'Saving...' : isEditMode ? 'Update Note' : 'Save Note'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}