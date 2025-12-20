import { useState, useRef } from 'react';

interface DocumentFormData {
  name: string;
  category: string;
  date: string;
  file: File | null;
}

type AddDocumentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (document: DocumentFormData) => Promise<void>;
  isLoading?: boolean;
}

export function AddDocumentModal({ isOpen, onClose, onSubmit, isLoading = false }: AddDocumentModalProps) {
  const [formData, setFormData] = useState<DocumentFormData>({
    name: '',
    category: 'Transportation',
    date: new Date().toISOString().split('T')[0],
    file: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      setFormData({
        name: '',
        category: 'Transportation',
        date: new Date().toISOString().split('T')[0],
        file: null,
      });
      onClose();
    } catch (error) {
      // Error handling
    }
  };

  const handleChange = (field: keyof Omit<DocumentFormData, 'file'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      file,
      name: file ? file.name : prev.name,
    }));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="w-[653px] p-8 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#E5E7EB] inline-flex flex-col justify-start items-start gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="justify-start text-slate-800 text-3xl font-semibold font-['Outfit'] leading-[48px]">Add Document</div>
          <button onClick={onClose} className="relative cursor-pointer">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.7075 12.7075L17.4138 16L20.7075 19.2925C20.8004 19.3854 20.8741 19.4957 20.9244 19.6171C20.9747 19.7385 21.0006 19.8686 21.0006 20C21.0006 20.1314 20.9747 20.2615 20.9244 20.3829C20.8741 20.5043 20.8004 20.6146 20.7075 20.7075C20.6146 20.8004 20.5043 20.8741 20.3829 20.9244C20.2615 20.9747 20.1314 21.0006 20 21.0006C19.8686 21.0006 19.7385 20.9747 19.6171 20.9244C19.4957 20.8741 19.3854 20.8004 19.2925 20.7075L16 17.4137L12.7075 20.7075C12.6146 20.8004 12.5043 20.8741 12.3829 20.9244C12.2615 20.9747 12.1314 21.0006 12 21.0006C11.8686 21.0006 11.7385 20.9747 11.6171 20.9244C11.4957 20.8741 11.3854 20.8004 11.2925 20.7075C11.1996 20.6146 11.1259 20.5043 11.0756 20.3829C11.0253 20.2615 10.9994 20.1314 10.9994 20C10.9994 19.8686 11.0253 19.7385 11.0756 19.6171C11.1259 19.4957 11.1996 19.3854 11.2925 19.2925L14.5863 16L11.2925 12.7075C11.1049 12.5199 10.9994 12.2654 10.9994 12C10.9994 11.7346 11.1049 11.4801 11.2925 11.2925C11.4801 11.1049 11.7346 10.9994 12 10.9994C12.2654 10.9994 12.5199 11.1049 12.7075 11.2925L16 14.5863L19.2925 11.2925C19.3854 11.1996 19.4957 11.1259 19.6171 11.0756C19.7385 11.0253 19.8686 10.9994 20 10.9994C20.1314 10.9994 20.2615 11.0253 20.3829 11.0756C20.5043 11.1259 20.6146 11.1996 20.7075 11.2925C20.8004 11.3854 20.8741 11.4957 20.9244 11.6171C20.9747 11.7385 21.0006 11.8686 21.0006 12C21.0006 12.1314 20.9747 12.2615 20.9244 12.3829C20.8741 12.5043 20.8004 12.6146 20.7075 12.7075ZM29 16C29 18.5712 28.2376 21.0846 26.8091 23.2224C25.3807 25.3603 23.3503 27.0265 20.9749 28.0104C18.5995 28.9944 15.9856 29.2518 13.4638 28.7502C10.9421 28.2486 8.6257 27.0105 6.80762 25.1924C4.98953 23.3743 3.75141 21.0579 3.2498 18.5362C2.74819 16.0144 3.00563 13.4006 3.98957 11.0251C4.97351 8.64968 6.63975 6.61935 8.77759 5.1909C10.9154 3.76244 13.4288 3 16 3C19.4467 3.00364 22.7512 4.37445 25.1884 6.81163C27.6256 9.24882 28.9964 12.5533 29 16ZM27 16C27 13.8244 26.3549 11.6977 25.1462 9.88873C23.9375 8.07979 22.2195 6.66989 20.2095 5.83733C18.1995 5.00476 15.9878 4.78692 13.854 5.21136C11.7202 5.6358 9.76021 6.68345 8.22183 8.22183C6.68345 9.7602 5.63581 11.7202 5.21137 13.854C4.78693 15.9878 5.00477 18.1995 5.83733 20.2095C6.66989 22.2195 8.07979 23.9375 9.88873 25.1462C11.6977 26.3549 13.8244 27 16 27C18.9164 26.9967 21.7123 25.8367 23.7745 23.7745C25.8367 21.7123 26.9967 18.9164 27 16Z" fill="black"/>
            </svg>
          </button>
        </div>

        <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-black/10"></div>

        <form onSubmit={handleSubmit} className="self-stretch flex flex-col justify-start items-start gap-5">
          
          <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
            <div className="justify-start">
              <span className="text-slate-800 text-sm font-medium font-['Outfit'] leading-tight">Name</span>
              <span className="text-red-500 text-sm font-medium font-['Outfit'] leading-tight">*</span>
            </div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter Document Name"
              required
              className="self-stretch h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] outline outline-1 outline-offset-[-1px] outline-gray-300 text-slate-800 text-sm font-normal font-['Outfit'] leading-tight focus:outline-none focus:outline-indigo-500 focus:outline-2"
            />
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
                className="self-stretch h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] outline outline-1 outline-offset-[-1px] outline-gray-300 text-slate-800 text-sm font-normal font-['Outfit'] leading-tight focus:outline-none focus:outline-indigo-500 focus:outline-2"
              />
            </div>

            <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
              <div className="justify-start">
                <span className="text-slate-800 text-sm font-medium font-['Outfit'] leading-tight">Category</span>
                <span className="text-red-500 text-sm font-medium font-['Outfit'] leading-tight">*</span>
              </div>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                required
                className="self-stretch h-11 px-4 py-2.5 bg-[#FAFAF8] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] outline outline-1 outline-offset-[-1px] outline-[#E5E7EB] text-slate-800 text-sm font-normal font-['Outfit'] leading-tight focus:outline-none focus:outline-indigo-500 focus:outline-2 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4.79102 7.39584L9.99935 12.6042L15.2077 7.39584' stroke='%23667085' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '20px 20px',
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
              <div className="justify-start text-slate-800 text-sm font-medium font-['Outfit'] leading-tight">Attachments</div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                required
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
              />
              <div
                onClick={handleUploadClick}
                className="self-stretch px-4 py-6 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] outline outline-1 outline-offset-[-1px] outline-gray-300 inline-flex flex-col justify-center items-center gap-2 overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <svg width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M28.5 18V26C28.5 26.2652 28.3946 26.5196 28.2071 26.7071C28.0196 26.8946 27.7652 27 27.5 27H5.5C5.23478 27 4.98043 26.8946 4.79289 26.7071C4.60536 26.5196 4.5 26.2652 4.5 26V18C4.5 17.7348 4.60536 17.4804 4.79289 17.2929C4.98043 17.1053 5.23478 17 5.5 17C5.76522 17 6.01957 17.1053 6.20711 17.2929C6.39464 17.4804 6.5 17.7348 6.5 18V25H26.5V18C26.5 17.7348 26.6054 17.4804 26.7929 17.2929C26.9804 17.1053 27.2348 17 27.5 17C27.7652 17 28.0196 17.1053 28.2071 17.2929C28.3946 17.4804 28.5 17.7348 28.5 18ZM12.2075 9.70749L15.5 6.41374V18C15.5 18.2652 15.6054 18.5196 15.7929 18.7071C15.9804 18.8946 16.2348 19 16.5 19C16.7652 19 17.0196 18.8946 17.2071 18.7071C17.3946 18.5196 17.5 18.2652 17.5 18V6.41374L20.7925 9.70749C20.9801 9.89513 21.2346 10.0005 21.5 10.0005C21.7654 10.0005 22.0199 9.89513 22.2075 9.70749C22.3951 9.51985 22.5006 9.26536 22.5006 8.99999C22.5006 8.73463 22.3951 8.48013 22.2075 8.29249L17.2075 3.29249C17.1146 3.19952 17.0043 3.12576 16.8829 3.07543C16.7615 3.02511 16.6314 2.99921 16.5 2.99921C16.3686 2.99921 16.2385 3.02511 16.1171 3.07543C15.9957 3.12576 15.8854 3.19952 15.7925 3.29249L10.7925 8.29249C10.6049 8.48013 10.4994 8.73463 10.4994 8.99999C10.4994 9.26536 10.6049 9.51985 10.7925 9.70749C10.9801 9.89513 11.2346 10.0005 11.5 10.0005C11.7654 10.0005 12.0199 9.89513 12.2075 9.70749Z" fill="black"/>
                </svg>
                <div className="self-stretch text-center justify-start text-indigo-950 text-sm font-semibold font-['Outfit'] leading-tight">
                  {formData.file ? formData.file.name : 'Upload File'}
                </div>
                <div className="self-stretch text-center justify-start text-slate-800 text-sm font-normal font-['Outfit'] leading-tight">
                  PDF, DOC, PPT, XLS, and images support
                </div>
              </div>
            </div>
          </div>

          <div className="self-stretch inline-flex justify-start items-start gap-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-5 py-3.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] outline outline-1 outline-offset-[-1px] outline-indigo-950 inline-flex justify-center items-center gap-2 text-indigo-950 text-sm font-medium font-['Outfit'] leading-tight hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim() || !formData.file}
              className="flex-1 px-4 py-3 bg-indigo-950 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] outline outline-1 outline-offset-[-1px] outline-indigo-950 inline-flex justify-center items-center gap-2 text-white text-sm font-medium font-['Outfit'] leading-tight hover:bg-indigo-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
