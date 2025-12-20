import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

type ApprovalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (notes: string) => void;
  accountName: string;
  isLoading?: boolean;
}

export function ApprovalModal({ isOpen, onClose, onApprove, accountName, isLoading = false }: ApprovalModalProps) {
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApprove(notes);
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998] backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="w-full max-w-[550px] p-8 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col gap-6 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-slate-800 text-2xl font-semibold font-['Outfit'] leading-tight">
                  Approve Account
                </h2>
                <p className="text-gray-500 text-sm font-normal font-['Outfit'] mt-1">
                  {accountName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="size-9 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="size-5 text-gray-500" />
            </button>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-[#344054] text-sm font-medium font-['Outfit'] leading-tight">
                Approval Notes <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Add any notes or comments about this approval..."
                className="px-4 py-3 bg-white rounded-lg border border-gray-300 text-black text-sm font-normal font-['Outfit'] leading-tight focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all resize-none"
              />
            </div>

            <div className="flex justify-end items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-3 bg-white rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold font-['Outfit'] leading-tight hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg text-white text-sm font-semibold font-['Outfit'] leading-tight hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Approve Account
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
