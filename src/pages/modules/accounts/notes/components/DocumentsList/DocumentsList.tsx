import { Eye, Trash2 } from 'lucide-react';
import { AccountDocument } from '@/services/api/accountDocumentsApi';

interface DocumentsListProps {
  documents: AccountDocument[];
  onView: (document: AccountDocument) => void;
  onDelete: (documentId: string) => void;
  isLoading?: boolean;
}

export function DocumentsList({ documents, onView, onDelete, isLoading = false }: DocumentsListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDelete = (documentId: string, documentName: string) => {
    if (window.confirm(`Are you sure you want to delete "${documentName}"? This action cannot be undone.`)) {
      onDelete(documentId);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-950"></div>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Eye className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2 font-['Outfit']">No Documents Yet</h3>
          <p className="text-sm text-gray-500 font-['Outfit']">
            Click "Add Documents" to upload your first document for this account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Outfit']">
              Date
            </th>
            <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Outfit']">
              Category
            </th>
            <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Outfit']">
              Name
            </th>
            <th className="px-6 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-['Outfit']">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((document) => (
            <tr key={document.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-['Outfit']">
                {formatDate(document.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-['Outfit']">
                {document.category}
              </td>
              <td className="px-6 py-4 text-sm text-slate-800 font-['Outfit']">
                {document.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onView(document)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-950 hover:text-indigo-900 transition-colors font-['Outfit']"
                  >
                    <Eye className="w-4 h-4" />
                    View Document
                  </button>
                  <button
                    onClick={() => handleDelete(document.id, document.name)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors font-['Outfit']"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
