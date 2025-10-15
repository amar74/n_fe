import { X, Download } from 'lucide-react';
import { AccountDocument } from '@/services/api/accountDocumentsApi';

type ViewDocumentModalProps = {
  isOpen: boolean;
  document: AccountDocument | null;
  onClose: () => void;
}

export function ViewDocumentModal({ isOpen, document, onClose }: ViewDocumentModalProps) {
  if (!isOpen || !document) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDownload = () => {
    // TODO: Implement document download when backend is ready
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
          <h2 className="text-xl font-semibold text-slate-800 font-['Outfit']">Document Details</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 text-sm font-medium text-indigo-950 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors font-['Outfit'] inline-flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Download
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
                {formatDate(document.date)}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 font-['Outfit']">
                Category
              </label>
              <p className="text-sm text-slate-800 font-['Outfit']">
                {document.category}
              </p>
            </div>
          </div>

          
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 font-['Outfit']">
              Document Name
            </label>
            <h3 className="text-lg font-semibold text-slate-800 font-['Outfit']">
              {document.name}
            </h3>
          </div>

          
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 font-['Outfit']">
              Preview
            </label>
            <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-indigo-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 font-['Outfit']">
                Document preview will be available once the backend API is implemented.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
