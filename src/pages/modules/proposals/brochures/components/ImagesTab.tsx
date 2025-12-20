import { useRef, useState } from 'react';
import {
  ArrowRight,
  Image as ImageIcon,
  FileText,
  Upload,
  Save,
  Loader2,
  Edit2,
  Trash2,
  Badge,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/services/api/client';
import { useQueryClient } from '@tanstack/react-query';
import { proposalKeys } from '@/hooks/proposals/useProposals';
import { useToast } from '@/hooks/shared';
import type { UploadedImage } from './types';

interface ImagesTabProps {
  brochureId: string | undefined;
  uploadedImages: UploadedImage[];
  setUploadedImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  pendingFiles: UploadedImage[];
  setPendingFiles: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  isSavingFiles: boolean;
  setIsSavingFiles: (value: boolean) => void;
  isEditMode: boolean;
  onNext: () => void;
}

export function ImagesTab({
  brochureId,
  uploadedImages,
  setUploadedImages,
  pendingFiles,
  setPendingFiles,
  isSavingFiles,
  setIsSavingFiles,
  isEditMode,
  onNext,
}: ImagesTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageFiles(e.dataTransfer.files);
    }
  };

  const handleImageFiles = async (files: FileList) => {
    if (!files || files.length === 0) return;

    const newPendingFiles: UploadedImage[] = [];

    for (const file of Array.from(files)) {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      
      const isImage = file.type.startsWith('image/');
      const isDocument = file.type.includes('pdf') || 
                        file.type.includes('document') || 
                        file.type.includes('text') ||
                        file.type.includes('spreadsheet') ||
                        file.name.endsWith('.pdf') ||
                        file.name.endsWith('.doc') ||
                        file.name.endsWith('.docx') ||
                        file.name.endsWith('.txt') ||
                        file.name.endsWith('.xls') ||
                        file.name.endsWith('.xlsx');
      
      if (!isImage && !isDocument) {
        toast.error(`${file.name} is not a supported file type`);
        continue;
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
        continue;
      }

      let previewUrl = '';
      if (isImage) {
        previewUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve(event.target?.result as string);
          };
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      } else {
        previewUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE0IDJINkMyLjY5IDIgMCAyLjY5IDAgNlYxOEMwIDIwLjMxIDEuNjkgMjIgNCAyMkgyMEMyMS4zMSAyMiAyMiAyMC4zMSAyMiAxOVY4TDE0IDJaIiBzdHJva2U9IiM2NjY2NjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0xNCAyVjhIMjIiIHN0cm9rZT0iIzY2NjY2NiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
      }

      if (previewUrl) {
        newPendingFiles.push({
          id: tempId,
          name: file.name,
          url: previewUrl,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          file: file,
          isSaved: false,
        });
      }
    }

    if (newPendingFiles.length > 0) {
      setPendingFiles(prev => [...prev, ...newPendingFiles]);
      toast.info(`${newPendingFiles.length} file(s) ready to save. Click "Save Files" to upload.`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageFiles(files);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleSaveFiles = async () => {
    if (!brochureId) {
      toast.error('Brochure ID is required');
      return;
    }

    if (pendingFiles.length === 0) {
      toast.info('No files to save');
      return;
    }

    setIsSavingFiles(true);
    toast.info(`Saving ${pendingFiles.length} file(s)...`);

    for (const pendingFile of pendingFiles) {
      if (!pendingFile.file) continue;

      const file = pendingFile.file;
      const isImage = file.type.startsWith('image/');

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', isImage ? 'image' : 'attachment');
        
        const response = await apiClient.post(`/proposals/${brochureId}/documents/upload`, formData);
        
        if (response.data?.documents && Array.isArray(response.data.documents)) {
          const documents = response.data.documents;
          const uploadedDoc = documents[documents.length - 1];
          
          if (uploadedDoc?.id) {
            setPendingFiles(prev => prev.filter(f => f.id !== pendingFile.id));
            setUploadedImages(prev => [...prev, {
              ...pendingFile,
              id: uploadedDoc.id,
              url: uploadedDoc.file_url || uploadedDoc.file_path || uploadedDoc.url || pendingFile.url,
              name: uploadedDoc.file_name || uploadedDoc.name || pendingFile.name,
              isSaved: true,
              file: undefined,
            }]);
          }
        }
        
        queryClient.invalidateQueries({ queryKey: proposalKeys.detail(brochureId) });
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Upload failed';
        toast.error(`Failed to save ${file.name}: ${errorMessage}`);
      }
    }

    setIsSavingFiles(false);
    toast.success(`Successfully saved ${pendingFiles.length} file(s)`);
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!brochureId) {
      toast.error('Brochure ID is required');
      return;
    }
    
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    
    if (!imageId.startsWith('temp-')) {
      try {
        try {
          await apiClient.delete(`/proposals/${brochureId}/documents/${imageId}`);
          queryClient.invalidateQueries({ queryKey: proposalKeys.detail(brochureId) });
          toast.success('Image deleted successfully');
        } catch (deleteError: any) {
          if (deleteError.response?.status === 404) {
            toast.success('Image removed (delete endpoint pending)');
          } else {
            throw deleteError;
          }
        }
      } catch (error: any) {
        console.error('Error deleting image:', error);
        toast.error(error.response?.data?.detail || 'Failed to delete image');
        queryClient.invalidateQueries({ queryKey: proposalKeys.detail(brochureId) });
      }
    } else {
      toast.success('Image removed');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold font-outfit text-[#1A1A1A] mb-2">
            Image Gallery
          </h3>
          <p className="text-sm text-gray-600 font-outfit">
            Upload and manage images and files for your brochure
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        id="image-upload"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.accept = 'image/*';
              fileInputRef.current.click();
            }
          }}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-[#161950] bg-[#161950]/5'
              : 'border-gray-300 hover:border-[#161950]/50 hover:bg-gray-50'
          }`}
        >
          <div className="flex flex-col items-center justify-center">
            <div className={`p-4 rounded-full mb-4 ${
              dragActive ? 'bg-[#161950]/10' : 'bg-blue-50'
            }`}>
              {dragActive ? (
                <Upload className="h-10 w-10 text-[#161950] animate-pulse" />
              ) : (
                <ImageIcon className="h-10 w-10 text-[#161950]" />
              )}
            </div>
            <p className="text-lg font-semibold font-outfit text-[#1A1A1A] mb-2">
              {dragActive ? 'Drop files here' : 'Upload Images'}
            </p>
            <p className="text-sm text-gray-600 font-outfit mb-2">
              Drag & drop or click to browse
            </p>
            <p className="text-xs text-gray-500 font-outfit">
              JPG, PNG, GIF, WebP (Max 10MB)
            </p>
          </div>
        </div>

        <div
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.accept = '.pdf,.doc,.docx,.txt,.xls,.xlsx';
              fileInputRef.current.click();
            }
          }}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer transition-all hover:border-[#161950]/50 hover:bg-gray-50"
        >
          <div className="flex flex-col items-center justify-center">
            <div className="p-4 rounded-full mb-4 bg-purple-50">
              <FileText className="h-10 w-10 text-purple-600" />
            </div>
            <p className="text-lg font-semibold font-outfit text-[#1A1A1A] mb-2">
              Upload Documents
            </p>
            <p className="text-sm text-gray-600 font-outfit mb-2">
              Click to browse files
            </p>
            <p className="text-xs text-gray-500 font-outfit">
              PDF, DOC, DOCX, TXT, XLS, XLSX (Max 10MB)
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mb-6">
        <Button
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.accept = 'image/*';
              fileInputRef.current.click();
            }
          }}
          variant="outline"
          className="font-outfit border-[#161950] text-[#161950] hover:bg-[#161950]/5"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Upload Images Only
        </Button>
        <Button
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.accept = '*/*';
              fileInputRef.current.click();
            }
          }}
          variant="outline"
          className="font-outfit border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Any Files
        </Button>
      </div>

      {pendingFiles.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold font-outfit text-yellow-900 mb-1">
                Files Ready to Save ({pendingFiles.length})
              </h4>
              <p className="text-xs text-yellow-700 font-outfit">
                Review and click "Save Files" to upload to the server
              </p>
            </div>
            <Button
              onClick={handleSaveFiles}
              disabled={isSavingFiles}
              className="font-outfit bg-[#161950] hover:bg-[#0f1440] text-white"
            >
              {isSavingFiles ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Files
                </>
              )}
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {pendingFiles.map((file) => (
              <div
                key={file.id}
                className="relative border-2 border-yellow-300 rounded-lg overflow-hidden bg-white"
              >
                {file.url && file.url.startsWith('data:image') ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="p-2">
                  <p className="text-xs font-medium font-outfit text-[#1A1A1A] truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 font-outfit">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                    Pending
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploadedImages.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold font-outfit text-[#1A1A1A] mb-4">
            Saved Files & Images ({uploadedImages.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image) => (
              <div
                key={image.id}
                className="relative group border-2 border-gray-200 rounded-lg overflow-hidden hover:border-[#161950] transition-all"
              >
                {image.url && image.url.startsWith('data:image') ? (
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <FileText className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                {isEditMode && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="font-outfit"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteImage(image.id)}
                      className="font-outfit"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
                <div className="p-2 bg-white">
                  <p className="text-xs font-medium font-outfit text-[#1A1A1A] truncate">
                    {image.name}
                  </p>
                  <p className="text-xs text-gray-500 font-outfit">
                    {(image.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isEditMode && uploadedImages.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 font-outfit">
            No images available
          </p>
        </div>
      )}

      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
        <Button
          onClick={onNext}
          disabled={pendingFiles.length > 0}
          className="bg-[#161950] hover:bg-[#0f1440] font-outfit disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Preview
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
      {pendingFiles.length > 0 && (
        <p className="text-xs text-yellow-600 text-center mt-2 font-outfit">
          Please save all files before proceeding to the next step
        </p>
      )}
    </div>
  );
}

