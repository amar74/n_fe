import { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Upload, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { apiClient } from '@/services/api/client';
import { useQueryClient } from '@tanstack/react-query';
import { extractErrorMessage } from '@/utils/errorUtils';

interface ChangeProfilePictureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPictureUrl?: string | null;
  userName: string;
}

export function ChangeProfilePictureDialog({
  open,
  onOpenChange,
  currentPictureUrl,
  userName,
}: ChangeProfilePictureDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPictureUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const validateAndSetFile = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid File Type', {
        description: 'Please select a JPEG, PNG, or WebP image file.',
      });
      return false;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File Too Large', {
        description: 'Please select an image smaller than 5MB.',
      });
      return false;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    validateAndSetFile(file);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  }, []);

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(currentPictureUrl || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('No File Selected', {
        description: 'Please select an image file to upload.',
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Don't set Content-Type header - let Axios set it automatically for FormData
      const response = await apiClient.post('/auth/profile/picture', formData);
      
      // Invalidate user queries to refetch with new picture
      await queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      await queryClient.invalidateQueries({ queryKey: ['profileStats'] });
      
      toast.success('Profile Picture Updated', {
        description: 'Your profile picture has been updated successfully.',
      });
      
      onOpenChange(false);
      setSelectedFile(null);
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      toast.error('Upload Failed', {
        description: errorMessage || 'Failed to upload profile picture. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Change Profile Picture
          </DialogTitle>
          <DialogDescription className="text-base" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Upload a new profile picture. Supported formats: JPEG, PNG, WebP (max 5MB)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preview Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {previewUrl ? (
                <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-2xl ring-4 ring-gray-100">
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                  {selectedFile && (
                    <button
                      onClick={handleRemove}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#161950] via-blue-700 to-purple-700 flex items-center justify-center text-white font-bold text-4xl shadow-2xl ring-4 ring-gray-100">
                  {getInitials(userName)}
                </div>
              )}
            </div>

            {/* File Input with Drag and Drop */}
            <div className="w-full">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                id="profile-picture-upload"
              />
              
              {/* Drag and Drop Area */}
              <div
                className={`w-full border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                  dragActive
                    ? 'border-[#161950] bg-[#161950]/10 scale-[1.02]'
                    : 'border-gray-300 hover:border-[#161950] hover:bg-[#161950]/5'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-[#161950]" />
                    <p className="text-sm text-gray-600">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      dragActive ? 'bg-[#161950]' : 'bg-gray-100'
                    }`}>
                      {dragActive ? (
                        <Upload className="h-6 w-6 text-white" />
                      ) : (
                        <Camera className={`h-6 w-6 ${dragActive ? 'text-white' : 'text-gray-600'}`} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {dragActive ? 'Drop image here' : 'Drag and drop an image here'}
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        or click to browse files
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-[#161950] text-[#161950] hover:bg-[#161950] hover:text-white"
                        disabled={isUploading}
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        {selectedFile ? (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Change File
                          </>
                        ) : (
                          <>
                            <Camera className="h-4 w-4 mr-2" />
                            Choose Image
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400">
                      Supported: JPEG, PNG, WebP (max 5MB)
                    </p>
                  </div>
                )}
              </div>
              
              {selectedFile && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#161950] rounded flex items-center justify-center">
                        <Camera className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove();
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              handleRemove();
            }}
            disabled={isUploading}
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="bg-[#161950] hover:bg-[#161950]/90 text-white"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Picture
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

