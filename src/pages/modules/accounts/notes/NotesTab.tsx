import { useState } from 'react';
import { Plus } from 'lucide-react';
import { NotesList } from './components/NotesList';
import { AddNoteModal } from './components/AddNoteModal';
import { ViewNoteModal } from './components/ViewNoteModal';
import { EditNoteModal } from './components/EditNoteModal';
import { DocumentsList } from './components/DocumentsList';
import { AddDocumentModal } from './components/AddDocumentModal';
import { ViewDocumentModal } from './components/ViewDocumentModal';
import { useNotesTab } from './useNotesTab';
import { NotesTabProps } from './NotesTab.types';
import { AccountNoteResponse } from '@/types/accountNotes';
import { useAccountDocuments } from '@/hooks/accounts';
import { AccountDocument } from '@/services/api/accountDocumentsApi';

type SubTab = 'notes' | 'documents';

export function NotesTab({ accountId }: NotesTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('notes');
  // temp solution by jhalak32
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingNote, setViewingNote] = useState<AccountNoteResponse | null>(null);

  // Documents state
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [showViewDocumentModal, setShowViewDocumentModal] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<AccountDocument | null>(null);

  const {
    // Data
    notes,
    editingNote,
    showEditModal,
    
    // State
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Error states
    createErrors,
    updateErrors,
    
    // Actions
    createNote,
    startEditNote,
    cancelEdit,
    saveEdit,
    deleteNote,
  } = useNotesTab(accountId);

  const {
    documents,
    isLoading: isLoadingDocuments,
    isCreatingDocument,
    isDeletingDocument,
    createDocument,
    deleteDocument,
  } = useAccountDocuments(accountId, { enabled: activeSubTab === 'documents' });

  const handleViewNote = (note: AccountNoteResponse) => {
    setViewingNote(note);
    setShowViewModal(true);
  };

  const handleEditFromView = (note: AccountNoteResponse) => {
    setShowViewModal(false);
    startEditNote(note);
  };

  const handleViewDocument = (document: AccountDocument) => {
    setViewingDocument(document);
    setShowViewDocumentModal(true);
  };

  const handleAddDocument = async (formData: any) => {
    try {
      const dateStr = formData.date ? `${formData.date}T00:00:00Z` : new Date().toISOString();
      
      await createDocument({
        name: formData.name,
        category: formData.category,
        date: dateStr,
        file_name: formData.file?.name || formData.name,
        file_size: formData.file?.size || null,
        mime_type: formData.file?.type || null,
      });
      setShowAddDocumentModal(false);
    } catch (e) {
      // Error handled by API
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await deleteDocument(documentId);
    } catch (error) {
      // Error handled by API
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      
      <div className="w-full h-11 p-0.5 bg-[#FAFAF8] rounded-lg outline outline-1 outline-[#E5E7EB] inline-flex justify-start items-center">
        <button
          onClick={() => setActiveSubTab('notes')}
          className={`flex-1 h-10 px-4 rounded-md flex justify-center items-center transition-all ${
            activeSubTab === 'notes'
              ? 'bg-indigo-950 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] text-white'
              : 'text-[#667085] hover:text-slate-800'
          }`}
        >
          <span className="text-sm font-medium font-['Outfit'] leading-tight">Notes</span>
        </button>
        <button
          onClick={() => setActiveSubTab('documents')}
          className={`flex-1 h-10 px-4 rounded-md flex justify-center items-center transition-all ${
            activeSubTab === 'documents'
              ? 'bg-indigo-950 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] text-white'
              : 'text-[#667085] hover:text-slate-800'
          }`}
        >
          <span className="text-sm font-medium font-['Outfit'] leading-tight">Documents</span>
        </button>
      </div>

      {activeSubTab === 'notes' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800 font-['Outfit']">Client Notes</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-950 text-white rounded-lg hover:bg-indigo-900 transition-colors font-['Outfit'] text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Notes
            </button>
          </div>

          <NotesList
            notes={notes}
            onView={handleViewNote}
            onEdit={startEditNote}
            onDelete={deleteNote}
            isLoading={isLoading}
          />
        </div>
      )}

      {activeSubTab === 'documents' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800 font-['Outfit']">Client Document</h2>
            <button
              onClick={() => setShowAddDocumentModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-950 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-indigo-950 text-white text-sm font-medium font-['Outfit'] leading-tight hover:bg-indigo-800 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.0312 9C16.0312 9.22378 15.9424 9.43839 15.7841 9.59662C15.6259 9.75485 15.4113 9.84375 15.1875 9.84375H9.84375V15.1875C9.84375 15.4113 9.75485 15.6259 9.59662 15.7841C9.43839 15.9424 9.22378 16.0312 9 16.0312C8.77622 16.0312 8.56161 15.9424 8.40338 15.7841C8.24514 15.6259 8.15625 15.4113 8.15625 15.1875V9.84375H2.8125C2.58872 9.84375 2.37411 9.75485 2.21588 9.59662C2.05764 9.43839 1.96875 9.22378 1.96875 9C1.96875 8.77622 2.05764 8.56161 2.21588 8.40338C2.37411 8.24514 2.58872 8.15625 2.8125 8.15625H8.15625V2.8125C8.15625 2.58872 8.24514 2.37411 8.40338 2.21588C8.56161 2.05764 8.77622 1.96875 9 1.96875C9.22378 1.96875 9.43839 2.05764 9.59662 2.21588C9.75485 2.37411 9.84375 2.58872 9.84375 2.8125V8.15625H15.1875C15.4113 8.15625 15.6259 8.24514 15.7841 8.40338C15.9424 8.56161 16.0312 8.77622 16.0312 9Z" fill="white"/>
              </svg>
              Add Documents
            </button>
          </div>

          <DocumentsList
            documents={documents}
            onView={handleViewDocument}
            onDelete={handleDeleteDocument}
            isLoading={isLoadingDocuments}
          />
        </div>
      )}

      <AddNoteModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={createNote}
        isLoading={isCreating}
        errors={createErrors}
      />

      <ViewNoteModal
        isOpen={showViewModal}
        note={viewingNote}
        onClose={() => {
          setShowViewModal(false);
          setViewingNote(null);
        }}
        onEdit={handleEditFromView}
      />

      <EditNoteModal
        isOpen={showEditModal}
        note={editingNote}
        onClose={cancelEdit}
        onSave={saveEdit}
        isLoading={isUpdating}
        errors={updateErrors}
      />

      <AddDocumentModal
        isOpen={showAddDocumentModal}
        onClose={() => setShowAddDocumentModal(false)}
        onSubmit={handleAddDocument}
        isLoading={isCreatingDocument}
      />

      <ViewDocumentModal
        isOpen={showViewDocumentModal}
        document={viewingDocument}
        onClose={() => {
          setShowViewDocumentModal(false);
          setViewingDocument(null);
        }}
      />
    </div>
  );
}
