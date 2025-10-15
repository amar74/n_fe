import { useState } from 'react';
import { NoteFormData } from '../../NotesTab.types';

type AddNoteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (note: NoteFormData) => Promise<void>;
  isLoading?: boolean;
  errors?: Record<string, string>;
}

export function AddNoteModal({ isOpen, onClose, onSubmit, isLoading = false, errors = {} }: AddNoteModalProps) {
  const [formData, setFormData] = useState<NoteFormData>({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [category, setCategory] = useState('Transportation');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      setFormData({
        title: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
      });
      setCategory('Transportation');
      onClose();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleChange = (field: keyof NoteFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="w-[650.73px] p-8 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#E5E7EB] inline-flex flex-col justify-start items-start gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="justify-start text-slate-800 text-3xl font-semibold font-['Outfit'] leading-[47.83px]">Add Notes</div>
          <button onClick={onClose} className="relative cursor-pointer">
            <svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.7281 13.6078L17.4457 16.8889L20.7281 20.1699C20.8206 20.2625 20.8941 20.3724 20.9442 20.4934C20.9943 20.6144 21.0201 20.744 21.0201 20.875C21.0201 21.0059 20.9943 21.1356 20.9442 21.2566C20.8941 21.3775 20.8206 21.4874 20.7281 21.58C20.6355 21.6726 20.5256 21.7461 20.4046 21.7962C20.2836 21.8463 20.1539 21.8721 20.023 21.8721C19.8921 21.8721 19.7624 21.8463 19.6414 21.7962C19.5205 21.7461 19.4106 21.6726 19.318 21.58L16.0369 18.2977L12.7558 21.58C12.6632 21.6726 12.5533 21.7461 12.4324 21.7962C12.3114 21.8463 12.1817 21.8721 12.0508 21.8721C11.9198 21.8721 11.7902 21.8463 11.6692 21.7962C11.5482 21.7461 11.4383 21.6726 11.3457 21.58C11.2532 21.4874 11.1797 21.3775 11.1296 21.2566C11.0795 21.1356 11.0537 21.0059 11.0537 20.875C11.0537 20.744 11.0795 20.6144 11.1296 20.4934C11.1797 20.3724 11.2532 20.2625 11.3457 20.1699L14.6281 16.8889L11.3457 13.6078C11.1588 13.4208 11.0537 13.1672 11.0537 12.9028C11.0537 12.6383 11.1588 12.3847 11.3457 12.1977C11.5327 12.0107 11.7863 11.9057 12.0508 11.9057C12.3152 11.9057 12.5688 12.0107 12.7558 12.1977L16.0369 15.48L19.318 12.1977C19.4106 12.1051 19.5205 12.0317 19.6414 11.9816C19.7624 11.9315 19.8921 11.9057 20.023 11.9057C20.1539 11.9057 20.2836 11.9315 20.4046 11.9816C20.5256 12.0317 20.6355 12.1051 20.7281 12.1977C20.8206 12.2903 20.8941 12.4002 20.9442 12.5212C20.9943 12.6422 21.0201 12.7718 21.0201 12.9028C21.0201 13.0337 20.9943 13.1634 20.9442 13.2843C20.8941 13.4053 20.8206 13.5152 20.7281 13.6078ZM28.9918 16.8889C28.9918 19.4511 28.232 21.9558 26.8085 24.0862C25.385 26.2166 23.3617 27.8771 20.9945 28.8576C18.6273 29.8381 16.0225 30.0947 13.5095 29.5948C10.9965 29.0949 8.6882 27.8611 6.87643 26.0493C5.06466 24.2376 3.83083 21.9292 3.33096 19.4162C2.83109 16.9032 3.08764 14.2985 4.06817 11.9313C5.04869 9.56407 6.70915 7.5408 8.83956 6.1173C10.97 4.6938 13.4747 3.93401 16.0369 3.93401C19.4716 3.93764 22.7646 5.30369 25.1934 7.73241C27.6221 10.1611 28.9881 13.4541 28.9918 16.8889ZM26.9987 16.8889C26.9987 14.7208 26.3558 12.6015 25.1513 10.7988C23.9468 8.99616 22.2348 7.59116 20.2318 6.76149C18.2288 5.93181 16.0247 5.71473 13.8984 6.1377C11.772 6.56066 9.81877 7.60467 8.28573 9.13771C6.7527 10.6707 5.70868 12.624 5.28572 14.7503C4.86276 16.8767 5.07984 19.0808 5.90951 21.0838C6.73918 23.0868 8.14419 24.7988 9.94685 26.0033C11.7495 27.2078 13.8689 27.8507 16.0369 27.8507C18.9431 27.8474 21.7294 26.6914 23.7844 24.6364C25.8395 22.5814 26.9954 19.7951 26.9987 16.8889Z" fill="black"/>
            </svg>
          </button>
        </div>

        
        <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-black/10"></div>

        
        <form onSubmit={handleSubmit} className="self-stretch flex flex-col justify-start items-start gap-5">
          
          <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
            <div className="justify-start">
              <span className="text-slate-800 text-sm font-medium font-['Outfit'] leading-tight">Title</span>
              <span className="text-red-500 text-sm font-medium font-['Outfit'] leading-tight">*</span>
            </div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter Note Title"
              required
              className="self-stretch h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_0.9965277314186096px_1.9930554628372192px_0px_rgba(16,24,40,0.05)] outline outline-1 outline-offset-[-1px] outline-gray-300 text-slate-800 text-sm font-normal font-['Outfit'] leading-tight focus:outline-none focus:outline-indigo-500 focus:outline-2"
            />
            {errors?.title && (
              <span className="text-red-500 text-sm font-['Outfit']">{errors.title}</span>
            )}
          </div>

          
          <div className="self-stretch inline-flex justify-start items-start gap-5">
            
            <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
              <div className="justify-start">
                <span className="text-slate-800 text-sm font-medium font-['Outfit'] leading-tight">Date</span>
                <span className="text-red-500 text-sm font-medium font-['Outfit'] leading-tight">*</span>
              </div>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
                className="self-stretch h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_0.9965277314186096px_1.9930554628372192px_0px_rgba(16,24,40,0.05)] outline outline-1 outline-offset-[-1px] outline-gray-300 text-slate-800 text-sm font-normal font-['Outfit'] leading-tight focus:outline-none focus:outline-indigo-500 focus:outline-2"
              />
              {errors?.date && (
                <span className="text-red-500 text-sm font-['Outfit']">{errors.date}</span>
              )}
            </div>

            
            <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
              <div className="justify-start">
                <span className="text-slate-800 text-sm font-medium font-['Outfit'] leading-tight">Category</span>
                <span className="text-red-500 text-sm font-medium font-['Outfit'] leading-tight">*</span>
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="self-stretch h-11 px-4 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_0.9965277314186096px_1.9930554628372192px_0px_rgba(16,24,40,0.05)] outline outline-1 outline-offset-[-1px] outline-[#E5E7EB] text-slate-800 text-sm font-normal font-['Outfit'] leading-tight focus:outline-none focus:outline-indigo-500 focus:outline-2 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='21' height='21' viewBox='0 0 21 21' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4.88086 7.81461L10.0711 13.0049L15.2614 7.81461' stroke='%23667085' stroke-width='1.49479' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '21px 21px',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="Transportation">Transportation</option>
                <option value="Finance">Finance</option>
                <option value="Legal">Legal</option>
                <option value="Technical">Technical</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          
          <div className="self-stretch inline-flex justify-start items-center gap-5">
            <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
              <div className="justify-start text-slate-800 text-sm font-medium font-['Outfit'] leading-tight">Content</div>
              <textarea
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                placeholder="Enter your note content here..."
                required
                rows={6}
                className="self-stretch px-4 py-2.5 bg-white rounded-lg shadow-[0px_0.9965277314186096px_1.9930554628372192px_0px_rgba(16,24,40,0.05)] outline outline-1 outline-offset-[-1px] outline-gray-300 text-slate-800 text-sm font-normal font-['Outfit'] leading-tight resize-none focus:outline-none focus:outline-indigo-500 focus:outline-2"
              />
              {errors?.content && (
                <span className="text-red-500 text-sm font-['Outfit']">{errors.content}</span>
              )}
            </div>
          </div>

          
          <div className="self-stretch inline-flex justify-start items-start gap-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-5 py-3.5 bg-white rounded-lg shadow-[0px_0.9965277314186096px_1.9930554628372192px_0px_rgba(16,24,40,0.05)] outline outline-1 outline-offset-[-1px] outline-indigo-950 inline-flex justify-center items-center gap-2 text-indigo-950 text-sm font-medium font-['Outfit'] leading-tight hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title.trim() || !formData.content.trim()}
              className="flex-1 px-4 py-3 bg-indigo-950 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] outline outline-1 outline-offset-[-1px] outline-indigo-950 inline-flex justify-center items-center gap-2 text-white text-sm font-medium font-['Outfit'] leading-tight hover:bg-indigo-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
