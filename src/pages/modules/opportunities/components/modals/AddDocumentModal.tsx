import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, FileText } from 'lucide-react';
import { useUploadOpportunityDocument } from '@/hooks/useOpportunityDocuments';
import { useToast } from '@/hooks/use-toast';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityId: string;
  onDocumentAdded?: () => void;
}

interface UploadedFile {
  file: File;
  id: string;
  name: string;
  size: number;
  type: string;
}

export default function AddDocumentModal({ 
  isOpen, 
  onClose, 
  opportunityId, 
  onDocumentAdded 
}: AddDocumentModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Documents & Reports');
  const [selectedPurpose, setSelectedPurpose] = useState<string>('Project Reference');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const { toast } = useToast();
  const uploadDocumentMutation = useUploadOpportunityDocument(opportunityId);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, []);

  const handleFileUpload = (files: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    Array.from(files).forEach((file) => {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type. Please upload PDF, DOC, PPT, XLS, or image files.`,
          variant: "destructive",
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB. Please choose a smaller file.`,
          variant: "destructive",
        });
        return;
      }

      const uploadedFile: UploadedFile = {
        file,
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type
      };

      newFiles.push(uploadedFile);
    });

    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast({
        title: "Files added",
        description: `${newFiles.length} file(s) added successfully.`,
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSave = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    try {
      const uploadPromises = uploadedFiles.map(file => 
        uploadDocumentMutation.mutateAsync({
          file: file.file,
          category: selectedCategory,
          purpose: selectedPurpose
        })
      );

      await Promise.all(uploadPromises);

      toast({
        title: "Documents uploaded successfully",
        description: `${uploadedFiles.length} document(s) uploaded and will be available for use in proposal generation.`,
      });

      setUploadedFiles([]);
      setSelectedCategory('Documents & Reports');
      setSelectedPurpose('Project Reference');
      
      onDocumentAdded?.();
      onClose();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload documents. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    if (!uploadDocumentMutation.isPending) {
      setUploadedFiles([]);
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal content - exact Figma design */}
      <div className="relative w-[653px] p-8 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-5 z-10">
        {/* Title */}
        <div className="inline-flex justify-start items-center gap-3">
          <div className="text-gray-900 text-3xl font-semibold font-['Outfit'] leading-[48px]">
            Add Document
          </div>
        </div>
        
        {/* Description */}
        <div className="self-stretch text-gray-600 text-lg font-medium font-['Outfit'] leading-relaxed">
          Upload images, plans, and documents that will be organized and available for use in proposal generation. All uploaded files will be available for selection in the proposal module.
        </div>
        
        {/* Divider line */}
        <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-black/10"></div>

        {/* Form */}
        <div className="self-stretch flex flex-col justify-start items-start gap-5">
          {/* Inputs */}
          <div className="self-stretch flex flex-col justify-start items-start gap-5">
            {/* Document Category and Purpose Row */}
            <div className="self-stretch inline-flex justify-start items-start gap-5">
              {/* Document Category */}
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
                <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                  <div className="inline-flex justify-start items-start gap-3">
                    <div className="text-gray-900 text-sm font-medium font-['Outfit'] leading-tight">
                      Document Category
                    </div>
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="self-stretch h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] outline outline-1 outline-offset-[-1px] outline-gray-300">
                      <SelectValue placeholder="Select document category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Documents & Reports">Documents & Reports</SelectItem>
                      <SelectItem value="Technical Drawings">Technical Drawings</SelectItem>
                      <SelectItem value="Images & Photos">Images & Photos</SelectItem>
                      <SelectItem value="Presentations">Presentations</SelectItem>
                      <SelectItem value="Spreadsheets">Spreadsheets</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Purpose */}
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
                <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                  <div className="inline-flex justify-start items-start gap-3">
                    <div className="text-gray-900 text-sm font-medium font-['Outfit'] leading-tight">
                      Purpose
                    </div>
                  </div>
                  <Select value={selectedPurpose} onValueChange={setSelectedPurpose}>
                    <SelectTrigger className="self-stretch h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] outline outline-1 outline-offset-[-1px] outline-gray-300">
                      <SelectValue placeholder="Select document purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Project Reference">Project Reference</SelectItem>
                      <SelectItem value="Proposal Content">Proposal Content</SelectItem>
                      <SelectItem value="Technical Specification">Technical Specification</SelectItem>
                      <SelectItem value="Client Communication">Client Communication</SelectItem>
                      <SelectItem value="Internal Documentation">Internal Documentation</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div className="self-stretch inline-flex justify-start items-center gap-5">
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
                <div className="inline-flex justify-start items-start gap-3">
                  <div className="text-gray-900 text-sm font-medium font-['Outfit'] leading-tight">
                    Attachments
                  </div>
                </div>
                <div
                  className={`self-stretch px-4 py-6 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] outline outline-1 outline-offset-[-1px] outline-gray-300 flex flex-col justify-center items-center gap-2 overflow-hidden transition-colors cursor-pointer ${
                    isDragActive ? 'outline-blue-500 bg-blue-50' : ''
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  {/* Upload Icon - exact SVG from Figma */}
                  <div className="relative">
                    <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M28.5 18.4998V26.4998C28.5 26.765 28.3946 27.0194 28.2071 27.2069C28.0196 27.3945 27.7652 27.4998 27.5 27.4998H5.5C5.23478 27.4998 4.98043 27.3945 4.79289 27.2069C4.60536 27.0194 4.5 26.765 4.5 26.4998V18.4998C4.5 18.2346 4.60536 17.9802 4.79289 17.7927C4.98043 17.6052 5.23478 17.4998 5.5 17.4998C5.76522 17.4998 6.01957 17.6052 6.20711 17.7927C6.39464 17.9802 6.5 18.2346 6.5 18.4998V25.4998H26.5V18.4998C26.5 18.2346 26.6054 17.9802 26.7929 17.7927C26.9804 17.6052 27.2348 17.4998 27.5 17.4998C27.7652 17.4998 28.0196 17.6052 28.2071 17.7927C28.3946 17.9802 28.5 18.2346 28.5 18.4998ZM12.2075 10.2073L15.5 6.91356V18.4998C15.5 18.765 15.6054 19.0194 15.7929 19.2069C15.9804 19.3945 16.2348 19.4998 16.5 19.4998C16.7652 19.4998 17.0196 19.3945 17.2071 19.2069C17.3946 19.0194 17.5 18.765 17.5 18.4998V6.91356L20.7925 10.2073C20.9801 10.395 21.2346 10.5004 21.5 10.5004C21.7654 10.5004 22.0199 10.395 22.2075 10.2073C22.3951 10.0197 22.5006 9.76517 22.5006 9.49981C22.5006 9.23445 22.3951 8.97995 22.2075 8.79231L17.2075 3.79231C17.1146 3.69933 17.0043 3.62557 16.8829 3.57525C16.7615 3.52493 16.6314 3.49902 16.5 3.49902C16.3686 3.49902 16.2385 3.52493 16.1171 3.57525C15.9957 3.62557 15.8854 3.69933 15.7925 3.79231L10.7925 8.79231C10.6049 8.97995 10.4994 9.23445 10.4994 9.49981C10.4994 9.76517 10.6049 10.0197 10.7925 10.2073C10.9801 10.395 11.2346 10.5004 11.5 10.5004C11.7654 10.5004 12.0199 10.395 12.2075 10.2073Z" fill="black"/>
                    </svg>
                  </div>
                  
                  {/* Upload Text */}
                  <div className="self-stretch text-center text-indigo-950 text-sm font-semibold font-['Outfit'] leading-tight">
                    Upload File
                  </div>
                  
                  {/* Support Text */}
                  <div className="self-stretch text-center text-gray-900 text-sm font-normal font-['Outfit'] leading-tight">
                    PDF, DOC, PPT, XLS, and images support
                  </div>
                  
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
              <div className="text-gray-900 text-sm font-medium font-['Outfit'] leading-tight">
                Selected Files ({uploadedFiles.length})
              </div>
              <div className="self-stretch space-y-2 max-h-40 overflow-y-auto">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Buttons - exact Figma design */}
          <div className="self-stretch inline-flex justify-start items-start gap-5">
            {/* Cancel Button */}
            <div className="flex-1 inline-flex flex-col justify-start items-start gap-5">
              <Button
                type="button"
                onClick={handleClose}
                disabled={uploadDocumentMutation.isPending}
                className="self-stretch px-5 py-3.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] outline outline-1 outline-offset-[-1px] outline-indigo-950 inline-flex justify-center items-center gap-2 overflow-hidden"
              >
                <div className="text-indigo-950 text-sm font-medium font-['Outfit'] leading-tight">
                  Cancel
                </div>
              </Button>
            </div>
            
            {/* Save Button */}
            <div className="flex-1 self-stretch inline-flex flex-col justify-start items-start gap-5">
              <Button
                type="button"
                onClick={handleSave}
                disabled={uploadDocumentMutation.isPending || uploadedFiles.length === 0}
                className="self-stretch flex-1 px-4 py-3 bg-indigo-950 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] outline outline-1 outline-offset-[-1px] outline-indigo-950 inline-flex justify-center items-center gap-2 overflow-hidden"
              >
                <div className="text-white text-sm font-medium font-['Outfit'] leading-tight">
                  {uploadDocumentMutation.isPending ? 'Uploading...' : 'Save Document'}
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}