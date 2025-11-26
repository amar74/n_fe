import { useState, useCallback } from 'react';
import { X, Upload, FileText, Download, AlertCircle, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { apiClient } from '@/services/api/client';
import { toast } from 'sonner';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface UploadResult {
  success_count: number;
  failed_count: number;
  errors: string[];
  employees: any[];
  ai_analysis_queued?: number;
}

export function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [aiEnrich, setAiEnrich] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

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
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        toast.error('Please upload a CSV file');
      }
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        toast.error('Please upload a CSV file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a CSV file first');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      console.log('📤 Uploading CSV file:', file.name);
      console.log('📊 AI Enrichment:', aiEnrich ? 'Enabled' : 'Disabled');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('ai_enrich', aiEnrich.toString());

      console.log('🚀 Sending request to: /resources/employees/import');

      const response = await apiClient.post('/resources/employees/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes for bulk operations (AI enrichment can take time)
      });

      console.log('✅ Upload response:', response.data);
      setUploadResult(response.data);
      
      if (response.data.success_count > 0) {
        toast.success(`Successfully imported ${response.data.success_count} employee(s)`, {
          duration: 5000,
        });
        
        // Only refresh if all succeeded
        if (response.data.failed_count === 0) {
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }
      }
      
      if (response.data.failed_count > 0) {
        toast.error(`Failed to import ${response.data.failed_count} employee(s). Check details below.`, {
          duration: 7000,
        });
      }

      if (aiEnrich && response.data.ai_analysis_queued > 0) {
        toast.success(`🤖 AI analysis queued for ${response.data.ai_analysis_queued} employees`, {
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('❌ Error uploading file:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to upload CSV file';
      toast.error(`Upload failed: ${errorMessage}`, {
        duration: 7000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = (templateType: 'basic' | 'construction' | 'minimal') => {
    let filename = '';
    let url = '';

    switch (templateType) {
      case 'basic':
        filename = 'employee_import_basic.csv';
        url = '/samples/employee_import_basic.csv';
        break;
      case 'construction':
        filename = 'employee_import_construction.csv';
        url = '/samples/employee_import_construction.csv';
        break;
      case 'minimal':
        filename = 'employee_import_minimal.csv';
        url = '/samples/employee_import_minimal.csv';
        break;
    }

    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast.success(`${filename} downloaded successfully`);
  };

  const handleClose = () => {
    setFile(null);
    setUploadResult(null);
    setAiEnrich(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#151950] to-[#1e2570] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Upload className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white font-outfit">Bulk Upload Employees</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-blue-900">
                <p className="font-semibold">CSV Format Required:</p>
                <p>Your CSV file must include these columns: <code className="bg-blue-100 px-2 py-0.5 rounded">name, email, phone, job_title, role, department, location, bill_rate</code></p>
                <p className="text-xs text-blue-700">Example: John Doe, john@example.com, 555-1234, Senior Developer, employee, IT, New York, 150</p>
              </div>
            </div>
          </div>

          {/* Download Template Buttons */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Sample CSV Templates:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => handleDownloadTemplate('minimal')}
                className="flex flex-col items-center gap-2 px-4 py-3 bg-blue-50 border-2 border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <div className="text-center">
                  <p className="text-xs font-bold">Minimal (2 employees)</p>
                  <p className="text-[10px] text-blue-600">Quick test template</p>
                </div>
              </button>
              
              <button
                onClick={() => handleDownloadTemplate('basic')}
                className="flex flex-col items-center gap-2 px-4 py-3 bg-green-50 border-2 border-green-300 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <div className="text-center">
                  <p className="text-xs font-bold">Basic (5 employees)</p>
                  <p className="text-[10px] text-green-600">IT & Office roles</p>
                </div>
              </button>
              
              <button
                onClick={() => handleDownloadTemplate('construction')}
                className="flex flex-col items-center gap-2 px-4 py-3 bg-purple-50 border-2 border-purple-300 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <div className="text-center">
                  <p className="text-xs font-bold">Construction (10 employees)</p>
                  <p className="text-[10px] text-purple-600">Engineering & Construction</p>
                </div>
              </button>
            </div>
          </div>

          {/* Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : file
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <div className="text-center space-y-4">
              {file ? (
                <>
                  <FileText className="w-16 h-16 text-green-600 mx-auto" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove file
                  </button>
                </>
              ) : (
                <>
                  <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-semibold text-gray-700">
                      Drag and drop your CSV file here
                    </p>
                    <p className="text-sm text-gray-500">or</p>
                  </div>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    <span className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block font-medium">
                      Browse Files
                    </span>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* AI Enrichment Option */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={aiEnrich}
                onChange={(e) => setAiEnrich(e.target.checked)}
                className="w-5 h-5 rounded border-purple-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-purple-900">Enable AI Enrichment</span>
                  <span className="text-xs px-2 py-0.5 bg-purple-200 text-purple-800 rounded-full">Powered by Gemini AI</span>
                </div>
                <p className="text-sm text-purple-700 mt-1">
                  AI will automatically suggest roles, skills, departments, and bill rates based on job titles and experience
                </p>
                {aiEnrich && (
                  <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Processing may take 1-2 minutes depending on file size
                  </p>
                )}
              </div>
            </label>
          </div>

          {/* Processing Indicator */}
          {isUploading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <div className="flex-1">
                  <p className="text-blue-900 font-medium">
                    {aiEnrich ? '🤖 Processing with AI enrichment...' : '📤 Uploading employees...'}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    {aiEnrich 
                      ? 'AI is analyzing job titles, suggesting roles, extracting skills, and calculating bill rates. This may take 1-2 minutes.'
                      : 'Please wait while we process your CSV file...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div className="space-y-3">
              {uploadResult.success_count > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-green-900 font-medium">
                        Successfully imported {uploadResult.success_count} employee(s)
                      </p>
                      {uploadResult.ai_analysis_queued && uploadResult.ai_analysis_queued > 0 && (
                        <p className="text-sm text-green-700 mt-1">
                          🤖 AI analysis queued for {uploadResult.ai_analysis_queued} employee(s) - profiles will be enriched in background
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {uploadResult.failed_count > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-red-900 font-medium mb-2">
                        Failed to import {uploadResult.failed_count} employee(s)
                      </p>
                      <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                        {uploadResult.errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              {uploadResult ? 'Close' : 'Cancel'}
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#151950] to-[#1e2570] text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>
                    {aiEnrich ? 'Processing with AI... (may take 1-2 min)' : 'Uploading...'}
                  </span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload & Import
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

