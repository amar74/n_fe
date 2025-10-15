import { Eye, Trash2, MoreVertical } from 'lucide-react';
import { AccountNoteResponse } from '@/types/accountNotes';

type NotesListProps = {
  notes: AccountNoteResponse[];
  onView: (note: AccountNoteResponse) => void;
  onEdit: (note: AccountNoteResponse) => void;
  onDelete: (noteId: string) => void;
  isLoading?: boolean;
}

export function NotesList({ notes, onView, onEdit, onDelete, isLoading = false }: NotesListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleDelete = (noteId: string, noteTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${noteTitle}"? This action cannot be undone.`)) {
      onDelete(noteId);
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

  if (notes.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Eye className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2 font-['Outfit']">No Notes Yet</h3>
          <p className="text-sm text-gray-500 font-['Outfit']">
            Click "Add Notes" to create your first note for this account.
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
              Title
            </th>
            <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Outfit']">
              Content
            </th>
            <th className="px-6 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-['Outfit']">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {notes.map((note) => (
            <tr key={note.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-['Outfit']">
                {formatDate(note.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-['Outfit']">
                Transportation
              </td>
              <td className="px-6 py-4 text-sm text-slate-800 font-['Outfit']">
                {note.title}
              </td>
              <td className="px-6 py-4 text-sm text-slate-800 font-['Outfit']">
                {truncateText(note.content, 80)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onView(note)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-800 hover:text-indigo-950 transition-colors font-['Outfit']"
                  >
                    <Eye className="w-4 h-4" />
                    View Notes
                  </button>
                  <button
                    onClick={() => handleDelete(note.id, note.title)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 text-gray-400 hover:text-slate-800 transition-colors"
                    title="More options"
                  >
                    <MoreVertical className="w-4 h-4" />
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
