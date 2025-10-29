import { useState } from 'react';
import { X, Upload, FileText, Sparkles, Download, FileSpreadsheet, Loader2, CheckCircle } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';

type AddEmployeeCVModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
};

// Common roles - user can also type custom roles
const COMMON_ROLES = [
  'Contractor',
  'Site Engineer',
  'Project Manager',
  'Site Supervisor',
  'Labour Supervisor',
  'Safety Officer',
  'Quality Inspector',
  'Architect',
  'Civil Engineer',
  'Electrical Engineer',
  'Plumber',
  'Carpenter',
  'Mason',
  'Electrician',
  'Foreman',
  'General Manager',
  'HR Manager',
  'Accountant',
  'Admin',
  'Developer',
  'Designer',
];

const DEPARTMENTS = [
  'Construction',
  'Civil Engineering',
  'Electrical',
  'Plumbing',
  'HVAC',
  'Architecture',
  'Site Management',
  'Quality Control',
  'Safety & Compliance',
  'Procurement',
  'Operations',
  'Human Resources',
  'Finance & Accounts',
  'Sales & Marketing',
  'Legal',
  'Administration',
  'IT & Technology',
];

const LOCATIONS = [
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Houston, TX',
  'Phoenix, AZ',
  'Philadelphia, PA',
  'San Antonio, TX',
  'San Diego, CA',
  'Dallas, TX',
  'San Francisco, CA',
  'Austin, TX',
  'Jacksonville, FL',
  'Miami, FL',
  'Seattle, WA',
  'Boston, MA',
  'Denver, CO',
  'Atlanta, GA',
  'Las Vegas, NV',
  'Portland, OR',
  'Remote (USA)',
];

export function AddEmployeeCVModal({ isOpen, onClose, onSubmit }: AddEmployeeCVModalProps) {
  const { getRoleSuggestion, bulkImport, uploadResume, isImporting, isCreating } = useEmployees();
  
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    jobTitle: '',
    role: '',
    department: '',
    location: '',
    billRate: '',
    cvFile: null as File | null,
    experience: '',
  });
  
  const [aiSuggestion, setAiSuggestion] = useState<{
    role: string;
    department: string;
    billRate: string;
    skills: string[];
  } | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resumeParsed, setResumeParsed] = useState<{
    skills: string[];
    experience: string;
    certifications: string[];
  } | null>(null);
  
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  if (!isOpen) return null;

  const handleJobTitleChange = async (jobTitle: string) => {
    setFormData({ ...formData, jobTitle });
    
    // Call real Gemini AI API for suggestion
    if (jobTitle.length > 3) {
      setIsAnalyzing(true);
      try {
        const suggestion = await getRoleSuggestion({
          name: formData.name || 'New Employee',
          job_title: jobTitle,
          department: formData.department,
        });
        setAiSuggestion({
          role: suggestion.suggested_role,
          department: suggestion.suggested_department || formData.department,
          billRate: suggestion.bill_rate_suggestion?.toString() || '150',
          skills: suggestion.suggested_skills || [],
        });
      } catch (error) {
        console.error('AI suggestion failed:', error);
        // Fallback to local suggestion
        const fallback = getAISuggestion(jobTitle);
        setAiSuggestion(fallback);
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      setAiSuggestion(null);
    }
  };

  const getAISuggestion = (jobTitle: string): { role: string; department: string; billRate: string; skills: string[] } => {
    const title = jobTitle.toLowerCase();
    
    // Construction & Contractor roles
    if (title.includes('contractor')) {
      return { role: 'Contractor', department: 'Construction', billRate: '180', skills: ['Project Management', 'Cost Estimation', 'Site Supervision', 'Contract Negotiation', 'Quality Control'] };
    } else if (title.includes('site engineer') || title.includes('civil engineer')) {
      return { role: 'Site Engineer', department: 'Civil Engineering', billRate: '150', skills: ['AutoCAD', 'Site Planning', 'Construction Management', 'Quality Assurance', 'Blueprint Reading'] };
    } else if (title.includes('architect')) {
      return { role: 'Architect', department: 'Architecture', billRate: '200', skills: ['AutoCAD', 'Revit', '3D Modeling', 'Building Codes', 'Project Design'] };
    } else if (title.includes('plumber')) {
      return { role: 'Plumber', department: 'Plumbing', billRate: '80', skills: ['Pipe Installation', 'Leak Detection', 'Fixture Installation', 'Drainage Systems', 'Safety Protocols'] };
    } else if (title.includes('electrician')) {
      return { role: 'Electrician', department: 'Electrical', billRate: '85', skills: ['Wiring', 'Circuit Installation', 'Electrical Safety', 'Troubleshooting', 'Code Compliance'] };
    } else if (title.includes('mason') || title.includes('bricklayer')) {
      return { role: 'Mason', department: 'Construction', billRate: '70', skills: ['Bricklaying', 'Concrete Work', 'Plastering', 'Measurements', 'Tool Operation'] };
    } else if (title.includes('carpenter')) {
      return { role: 'Carpenter', department: 'Construction', billRate: '75', skills: ['Woodworking', 'Frame Construction', 'Finish Work', 'Blueprint Reading', 'Tool Operation'] };
    } else if (title.includes('supervisor') || title.includes('foreman')) {
      return { role: 'Site Supervisor', department: 'Site Management', billRate: '120', skills: ['Team Leadership', 'Site Coordination', 'Safety Management', 'Progress Tracking', 'Quality Control'] };
    } else if (title.includes('safety')) {
      return { role: 'Safety Officer', department: 'Safety & Compliance', billRate: '100', skills: ['OSHA Compliance', 'Risk Assessment', 'Safety Training', 'Incident Investigation', 'Safety Protocols'] };
    } else if (title.includes('project manager') || title.includes('manager')) {
      return { role: 'Project Manager', department: 'Site Management', billRate: '250', skills: ['Project Planning', 'Budget Management', 'Team Coordination', 'Stakeholder Communication', 'Risk Management'] };
    } else if (title.includes('labour') || title.includes('labor') || title.includes('worker')) {
      return { role: 'Labour Supervisor', department: 'Construction', billRate: '60', skills: ['Team Management', 'Task Allocation', 'Safety Compliance', 'Progress Monitoring', 'Quality Control'] };
    }
    // Tech roles
    else if (title.includes('frontend') || title.includes('react')) {
      return { role: 'Developer', department: 'IT & Technology', billRate: '200', skills: ['React', 'TypeScript', 'JavaScript'] };
    } else if (title.includes('backend')) {
      return { role: 'Developer', department: 'IT & Technology', billRate: '220', skills: ['Node.js', 'Python', 'SQL'] };
    }
    
    return { role: jobTitle, department: 'Construction', billRate: '100', skills: ['Industry Knowledge', 'Safety Awareness', 'Teamwork', 'Communication'] };
  };

  const handleCVUpload = async (file: File) => {
    setFormData({ ...formData, cvFile: file });
    
    // Note: CV will be uploaded and parsed after employee is created
    // This keeps the initial creation fast
    setResumeParsed(null);
  };

  const handleBulkFileUpload = async (file: File) => {
    setBulkFile(file);
    setUploadProgress(10);
    
    try {
      // Call real bulk import API
      const result = await bulkImport({ file, aiEnrich: true });
      
      setUploadProgress(100);
      setTimeout(() => {
        alert(`Bulk upload successful! ${result.success_count} employees added.`);
        onClose();
      }, 500);
    } catch (error) {
      console.error('Bulk upload failed:', error);
      alert('Bulk upload failed. Please check the file format and try again.');
      setBulkFile(null);
      setUploadProgress(0);
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV template for contractor industry
    const headers = ['Name', 'Email', 'Phone', 'Job Title', 'Role', 'Department', 'Location', 'Bill Rate'];
    const sampleData = [
      ['Rajesh Kumar', 'rajesh.k@company.com', '+919876543210', 'Site Engineer', 'Site Engineer', 'Civil Engineering', 'Mumbai', '150'],
      ['Amit Patel', 'amit.p@company.com', '+919876543211', 'Electrician', 'Electrician', 'Electrical', 'Delhi', '85'],
      ['Suresh Singh', 'suresh.s@company.com', '+919876543212', 'Plumber', 'Plumber', 'Plumbing', 'Bangalore', '80'],
      ['Priya Sharma', 'priya.s@company.com', '+919876543213', 'Safety Officer', 'Safety Officer', 'Safety & Compliance', 'Pune', '100'],
    ];
    
    const csv = [headers, ...sampleData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_template.csv';
    a.click();
  };

  const applySuggestion = () => {
    if (aiSuggestion) {
      // Adjust bill rate based on city cost of living
      let adjustedRate = parseFloat(aiSuggestion.billRate);
      const location = formData.location.toLowerCase();
      
      // High cost cities (20% increase)
      if (location.includes('new york') || location.includes('san francisco') || location.includes('los angeles')) {
        adjustedRate = adjustedRate * 1.2;
      }
      // Medium-high cost (10% increase)
      else if (location.includes('seattle') || location.includes('boston') || location.includes('chicago')) {
        adjustedRate = adjustedRate * 1.1;
      }
      // Lower cost cities (5-10% decrease)
      else if (location.includes('austin') || location.includes('atlanta') || location.includes('phoenix')) {
        adjustedRate = adjustedRate * 0.95;
      }
      
      setFormData({
        ...formData,
        role: aiSuggestion.role,
        department: aiSuggestion.department,
        billRate: Math.round(adjustedRate).toString(),
      });
      
      // Also update resume parsed skills if AI suggestion has them
      if (aiSuggestion.skills && aiSuggestion.skills.length > 0) {
        setResumeParsed({
          skills: aiSuggestion.skills,
          experience: formData.experience || 'As per resume',
          certifications: resumeParsed?.certifications || [],
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      skills: resumeParsed?.skills || aiSuggestion?.skills || [],
      certifications: resumeParsed?.certifications || [],
      use_ai_suggestion: !!aiSuggestion, // Flag to trigger AI enrichment
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add Employee</h2>
              <p className="text-sm text-gray-600 mt-1">Onboard new team members with AI assistance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-8 pt-6">
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('single')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'single'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              Single Employee
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'bulk'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Bulk Upload
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === 'single' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      placeholder="john.doe@company.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      placeholder="+1 234 567 8900"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => handleJobTitleChange(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      placeholder="e.g., Frontend Engineer"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* AI Suggestion Banner */}
              {isAnalyzing && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="text-sm font-medium text-blue-900">AI is analyzing job title...</span>
                </div>
              )}

              {aiSuggestion && !isAnalyzing && (
                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900 mb-2">AI Role & Department Suggestion</h4>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-700">
                            <span className="font-medium">Role:</span> {aiSuggestion.role}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium">Department:</span> {aiSuggestion.department}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium">Suggested Bill Rate:</span> ${aiSuggestion.billRate}/hr
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={applySuggestion}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}

              {/* Role & Department Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Role & Department</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 ml-2">(Type any role or select from suggestions)</span>
                    </label>
                    <input
                      type="text"
                      list="role-suggestions"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      placeholder="e.g., Site Engineer, Contractor, Plumber"
                      required
                    />
                    <datalist id="role-suggestions">
                      {COMMON_ROLES.map((role) => (
                        <option key={role} value={role} />
                      ))}
                    </datalist>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 ml-2">(Type any department)</span>
                    </label>
                    <input
                      type="text"
                      list="department-suggestions"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      placeholder="e.g., Construction, Civil Engineering"
                      required
                    />
                    <datalist id="department-suggestions">
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept} />
                      ))}
                    </datalist>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 ml-2">(Type any USA city)</span>
                    </label>
                    <input
                      type="text"
                      list="location-suggestions"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      placeholder="e.g., New York, NY or Chicago, IL"
                      required
                    />
                    <datalist id="location-suggestions">
                      {LOCATIONS.map((loc) => (
                        <option key={loc} value={loc} />
                      ))}
                    </datalist>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bill Rate
                      <span className="text-xs text-gray-500 ml-2">(AI will suggest based on role)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                      <input
                        type="number"
                        value={formData.billRate}
                        onChange={(e) => setFormData({ ...formData, billRate: e.target.value })}
                        className="w-full h-12 pl-8 pr-16 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="Auto-calculated by AI"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">/ hr</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Leave empty for AI to suggest based on role and experience</p>
                  </div>
                </div>
              </div>

              {/* Resume Upload with AI Parsing */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Resume / CV</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-all bg-gray-50">
                  <input
                    type="file"
                    id="cv-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => e.target.files && handleCVUpload(e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="cv-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-blue-100 rounded-full">
                        <Upload className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-gray-900">
                          Drop resume here or click to upload
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          PDF, DOC, DOCX (Max 5MB) • AI will auto-parse skills & experience
                        </p>
                      </div>
                      {formData.cvFile && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">{formData.cvFile.name}</span>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* CV Upload Info */}
              {formData.cvFile && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 mb-1">CV uploaded: {formData.cvFile.name}</p>
                      <p className="text-xs text-gray-600">
                        Resume will be parsed by AI after employee is created. Skills, experience, and certifications will be automatically extracted.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Add Employee'
                  )}
                </button>
              </div>
            </form>
          ) : (
            // Bulk Upload Tab
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Bulk Upload</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Upload multiple employees at once using CSV or XLSX file format.
                </p>
                
                {/* Download Template */}
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl mb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <FileSpreadsheet className="w-6 h-6 text-blue-600 mt-1" />
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-1">Download Template</h4>
                        <p className="text-sm text-gray-600">
                          Use our template to ensure correct formatting for bulk upload.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDownloadTemplate}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download CSV
                    </button>
                  </div>
                </div>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition-all bg-gray-50">
                  <input
                    type="file"
                    id="bulk-upload"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => e.target.files && handleBulkFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="bulk-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                        <FileSpreadsheet className="w-12 h-12 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-gray-900">
                          Drop your file here or click to browse
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Supports CSV and XLSX files (Max 10MB)
                        </p>
                      </div>
                      {bulkFile && (
                        <div className="w-full max-w-md">
                          <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg mb-3">
                            <FileText className="w-5 h-5 text-gray-600" />
                            <span className="text-sm font-medium text-gray-900 flex-1">{bulkFile.name}</span>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          {uploadProgress > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 font-medium">Uploading...</span>
                                <span className="text-blue-600 font-bold">{uploadProgress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <h4 className="text-sm font-bold text-gray-900 mb-2">📋 Template Format:</h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Name | Email | Phone | Job Title | Role | Department | Location | Bill Rate
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    All employees will be automatically sent welcome emails after successful upload.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
