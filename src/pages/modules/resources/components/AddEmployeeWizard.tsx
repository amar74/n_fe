import { useState } from 'react';
import { X, Upload, FileText, Sparkles, Loader2, CheckCircle, Link2, User, ChevronRight, ChevronLeft, Award, Briefcase, Building2, DollarSign } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';

type AddEmployeeWizardProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
};

// Skills, Sectors, Services, Project Types - same as before
const SKILL_SETS = [
  'Project Management', 'Technical Engineering', 'Design & Planning',
  'Environmental Sciences', 'Construction Management', 'Quality Assurance',
  'Financial Analysis', 'Client Relations', 'Risk Management', 'Regulatory Compliance',
];

const SECTORS = [
  'Transportation', 'Infrastructure', 'Environmental', 'Aviation',
  'Education', 'Healthcare', 'Energy', 'Water Resources',
  'Urban Planning', 'Industrial',
];

const SERVICES = [
  'Design Services', 'Consulting', 'Construction Management',
  'Environmental Assessment', 'Project Management', 'Planning Services',
  'Engineering Analysis', 'Inspection Services', 'Feasibility Studies', 'Regulatory Support',
];

const PROJECT_TYPES = [
  'Highway & Roads', 'Bridges & Structures', 'Rail & Transit',
  'Aviation Projects', 'Water Treatment', 'Environmental Remediation',
  'Urban Development', 'Industrial Facilities', 'Educational Facilities', 'Healthcare Facilities',
];

const DOCUMENT_TYPES = [
  { id: 'resume', label: 'Resume (projects, duration, $ value, education, certifications)', icon: FileText },
  { id: 'whitepapers', label: 'White papers published', icon: FileText },
  { id: 'awards', label: 'Awards', icon: Award },
  { id: 'references', label: 'Reference letters/quotes', icon: FileText },
  { id: 'project_links', label: 'Completed project sheets links', icon: Link2 },
  { id: 'education_certs', label: 'Educational certificates', icon: Award },
  { id: 'professional_licenses', label: 'Professional licenses', icon: Briefcase },
  { id: 'training_certs', label: 'Training certifications', icon: Award },
  { id: 'project_photos', label: 'Project photos and documentation', icon: Upload },
];

const DEPARTMENTS = [
  'Construction', 'Civil Engineering', 'Electrical', 'Plumbing', 'HVAC',
  'Architecture', 'Site Management', 'Quality Control', 'Safety & Compliance',
  'Procurement', 'Operations', 'Human Resources', 'Finance & Accounts',
];

export function AddEmployeeWizard({ isOpen, onClose, onSubmit }: AddEmployeeWizardProps) {
  const { isCreating } = useEmployees();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    jobTitle: '', department: '', location: '', hourlyRate: '', experience: '',
    linkedinUrl: '', profileUrl: '', cvFile: null as File | null,
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedProjectTypes, setSelectedProjectTypes] = useState<string[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File }>({});
  
  const [isExtractingFromProfile, setIsExtractingFromProfile] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);

  if (!isOpen) return null;

  const toggleSelection = (item: string, list: string[], setter: (val: string[]) => void) => {
    setter(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const calculateHourlyRate = (role: string, location: string, years: number): string => {
    const baseHourlyRates: { [key: string]: number } = {
      'civil engineer': 65, 'site engineer': 55, 'project manager': 85,
      'architect': 75, 'construction manager': 80, 'safety officer': 50,
      'plumber': 45, 'electrician': 50, 'carpenter': 42, 'contractor': 70,
      'software engineer': 90, 'engineer': 65,
    };

    const roleLower = role.toLowerCase();
    let baseRate = 60; // default
    for (const [key, value] of Object.entries(baseHourlyRates)) {
      if (roleLower.includes(key)) { baseRate = value; break; }
    }

    // Experience boost (3% per year, max 30%)
    const expMult = 1 + Math.min(years * 0.03, 0.3);
    
    // Location adjustment
    const locLower = location.toLowerCase();
    let locMult = 1.0;
    if (locLower.includes('new york') || locLower.includes('san francisco')) locMult = 1.25;
    else if (locLower.includes('los angeles') || locLower.includes('seattle')) locMult = 1.15;
    else if (locLower.includes('chicago') || locLower.includes('boston')) locMult = 1.10;

    return Math.round(baseRate * expMult * locMult).toString();
  };

  const handleProfileExtract = async () => {
    if (!formData.linkedinUrl && !formData.profileUrl) {
      alert('Please enter a profile URL first');
      return;
    }

    setIsExtractingFromProfile(true);
    setAiProcessing(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/onboarding/profile-extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
        body: JSON.stringify({ linkedin_url: formData.linkedinUrl, portfolio_url: formData.profileUrl }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const extracted = await response.json();
      
      console.log('='.repeat(60));
      console.log('✅ PROFILE EXTRACTION RESPONSE:');
      console.log('='.repeat(60));
      console.log('Name:', extracted.name);
      console.log('Title:', extracted.title);
      console.log('Experience:', extracted.total_experience_years, 'years');
      console.log('Top Skills:', extracted.top_skills);
      console.log('Sectors:', extracted.sectors);
      console.log('Services:', extracted.services);
      console.log('Match:', extracted.match_percentage + '%');
      console.log('Full Response:', extracted);
      
      const yearsExp = extracted.total_experience_years || 5;
      const suggestedRate = calculateHourlyRate(extracted.title || 'Engineer', 'New York', yearsExp);

      setFormData(prev => ({
        ...prev,
        name: extracted.name || prev.name,
        email: extracted.email || prev.email || '',
        phone: extracted.phone || prev.phone || '',
        jobTitle: extracted.title || prev.jobTitle,
        department: extracted.sectors?.[0] || prev.department,
        location: prev.location || 'New York, NY',
        experience: yearsExp ? `${yearsExp} years` : prev.experience,
        hourlyRate: suggestedRate || prev.hourlyRate,
      }));

      // Auto-populate matrices
      if (extracted.top_skills?.length > 0) setSelectedSkills(extracted.top_skills);
      if (extracted.sectors?.length > 0) setSelectedSectors(extracted.sectors);
      if (extracted.services?.length > 0) setSelectedServices(extracted.services);
      if (extracted.project_types?.length > 0) setSelectedProjectTypes(extracted.project_types);
      
      console.log(`✅ Auto-filled: ${extracted.top_skills?.length || 0} skills, ${extracted.sectors?.length || 0} sectors, ${extracted.services?.length || 0} services`);
      
      // Show success notification
      if (extracted.name || extracted.title || extracted.top_skills?.length > 0) {
        alert(`✅ Profile Extracted!\n\nName: ${extracted.name}\nTitle: ${extracted.title}\nExperience: ${extracted.total_experience_years} years\nSkills: ${extracted.top_skills?.length || 0}\nSectors: ${extracted.sectors?.length || 0}\n\nClick Next to review all extracted data!`);
        
        // Auto-advance to Step 2 after extraction
        setTimeout(() => setCurrentStep(2), 1000);
      }
      
    } catch (error) {
      console.error('Profile extraction error:', error);
      alert('Profile extraction failed. Please fill in details manually.');
    } finally {
      setIsExtractingFromProfile(false);
      setAiProcessing(false);
    }
  };

  const handleCVUpload = async (file: File) => {
    setFormData({ ...formData, cvFile: file });
    setAiProcessing(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('file', file);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/onboarding/upload-cv`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
        body: formDataObj,
      });

      const parsed = await response.json();
      
      console.log('✅ CV parsed by AI:', parsed);
      
      // Auto-populate all fields from CV
      setFormData(prev => ({
        ...prev,
        name: parsed.name || prev.name,
        email: parsed.email || prev.email,
        phone: parsed.phone || prev.phone,
        jobTitle: parsed.title || prev.jobTitle,
        department: parsed.sectors?.[0] || prev.department,
        experience: parsed.total_experience_years ? `${parsed.total_experience_years} years` : prev.experience,
      }));
      
      // Auto-populate matrices
      if (parsed.top_skills?.length > 0) setSelectedSkills(parsed.top_skills);
      if (parsed.sectors?.length > 0) setSelectedSectors(parsed.sectors);
      if (parsed.services?.length > 0) setSelectedServices(parsed.services);
      if (parsed.project_types?.length > 0) setSelectedProjectTypes(parsed.project_types);
      
      // Calculate hourly rate
      if (parsed.title || formData.jobTitle) {
        const yearsExp = parsed.total_experience_years || 5;
        const location = formData.location || 'New York, NY';
        const rate = calculateHourlyRate(parsed.title || formData.jobTitle, location, yearsExp);
        setFormData(prev => ({ ...prev, hourlyRate: rate, location }));
      }
      
      console.log(`✅ Auto-populated: ${parsed.top_skills?.length || 0} skills, ${parsed.sectors?.length || 0} sectors`);
      
      // Show success notification
      if (parsed.name || parsed.title || parsed.top_skills?.length > 0) {
        alert(`✅ CV Extracted!\n\nName: ${parsed.name}\nTitle: ${parsed.title}\nExperience: ${parsed.total_experience_years} years\nSkills: ${parsed.top_skills?.length || 0}\nSectors: ${parsed.sectors?.length || 0}\n\nClick Next to review all extracted data!`);
        
        // Auto-advance to Step 2 after extraction
        setTimeout(() => setCurrentStep(2), 1000);
      }
      
    } catch (error) {
      console.error('CV parsing error:', error);
      alert('CV uploaded but parsing failed. Please fill in details manually.');
    } finally {
      setAiProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Don't auto-advance or submit - only explicit button clicks should navigate
    console.log('Form submitted at step:', currentStep);
    
    // Only submit if we're on the final step AND user explicitly clicked submit
    if (currentStep === totalSteps) {
      console.log('Final step - submitting employee data');
      console.log('Creating employee:', formData.name);
      
      // Send only essential data for fast employee creation
      const employeeData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        jobTitle: formData.jobTitle,
        department: formData.department,
        location: formData.location,
        billRate: formData.hourlyRate,
        experience: formData.experience,
        skills: selectedSkills,
        sectors: selectedSectors,
        services: selectedServices,
        projectTypes: selectedProjectTypes,
        cvFile: uploadedFiles.resume?.[0],
      };
      
      console.log('Submitting data:', employeeData);
      onSubmit(employeeData);
    } else {
      // Prevent auto-advance on Enter key - user must click "Next Step"
      console.log('Intermediate step - preventing auto-submit');
    }
  };

  const steps = [
    { number: 1, title: 'Extract & Upload', icon: Upload },
    { number: 2, title: 'Basic Info', icon: User },
    { number: 3, title: 'Skills & Matrices', icon: Award },
    { number: 4, title: 'Documents', icon: FileText },
  ];

  const CurrentStepIcon = steps[currentStep - 1]?.icon || Upload;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[92vh] overflow-hidden shadow-xl border border-gray-200">
        
        {/* Header - Clean & Classic */}
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add New Employee</h2>
              <p className="text-sm text-gray-600 mt-1">Step {currentStep} of {totalSteps}: {steps[currentStep - 1]?.title}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Simple Progress Steps */}
          <div className="flex items-center gap-2">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = step.number === currentStep;
              const isCompleted = step.number < currentStep;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      isActive ? 'bg-black text-white' :
                      isCompleted ? 'bg-gray-800 text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`h-px flex-1 mx-2 ${
                      step.number < currentStep ? 'bg-gray-800' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Processing Banner - Classic */}
        {aiProcessing && (
          <div className="mx-8 mt-4 p-4 bg-gray-100 border border-gray-300 rounded-lg">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-gray-900 animate-spin" />
              <div>
                <p className="text-sm font-bold text-gray-900">AI Processing</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Analyzing profile data and auto-populating fields...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <form onSubmit={handleSubmit}>
          <div className="overflow-y-auto p-8" style={{ maxHeight: 'calc(92vh - 250px)' }}>
            
            {/* STEP 1: Extract & Upload */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {/* LinkedIn/Profile Extract */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-gray-900" />
                    Extract from LinkedIn or Portfolio
                  </h3>
                  <p className="text-sm text-gray-600">Paste URL and let AI extract information automatically</p>
                </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile URL</label>
                        <input
                          type="url"
                          value={formData.linkedinUrl}
                          onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                          className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio or Company Website</label>
                        <input
                          type="url"
                          value={formData.profileUrl}
                          onChange={(e) => setFormData({ ...formData, profileUrl: e.target.value })}
                          className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                          placeholder="https://portfolio-site.com"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleProfileExtract}
                        disabled={isExtractingFromProfile}
                        className="w-full h-11 px-6 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isExtractingFromProfile ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Extracting...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            Extract with AI
                          </>
                        )}
                      </button>
                    </div>
              </div>

              {/* OR Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 font-medium rounded text-xs">OR</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              {/* CV/Resume Upload */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-gray-900" />
                    Upload Resume / CV
                  </h3>
                  <p className="text-sm text-gray-600">Upload CV for comprehensive AI analysis</p>
                </div>
                    
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        onChange={(e) => e.target.files && handleCVUpload(e.target.files[0])}
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                      />
                      <div className={`flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-lg transition-all ${
                        formData.cvFile 
                          ? 'border-gray-900 bg-gray-50' 
                          : 'border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400'
                      }`}>
                        {formData.cvFile ? (
                          <div className="flex flex-col items-center gap-2">
                            <CheckCircle className="w-12 h-12 text-gray-900" />
                            <div className="text-center">
                              <p className="text-sm font-bold text-gray-900">{formData.cvFile.name}</p>
                              <p className="text-xs text-gray-600 mt-1">Click to change file</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <FileText className="w-12 h-12 text-gray-400 mb-3" />
                            <p className="text-sm font-semibold text-gray-900 mb-1">Drop CV here or click to browse</p>
                            <p className="text-xs text-gray-600">PDF, DOC, DOCX (Max 5MB)</p>
                          </>
                        )}
                      </div>
                    </label>
              </div>
            </div>
          )}

          {/* STEP 2: Basic Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Personal Info Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-900" />
                    Personal Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                        placeholder="john.doe@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>
                </div>

                {/* Job Details Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-gray-900" />
                    Job Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                      <input
                        type="text"
                        value={formData.jobTitle}
                        onChange={(e) => {
                          setFormData({ ...formData, jobTitle: e.target.value });
                          if (e.target.value && formData.location) {
                            const yearsExp = formData.experience ? parseInt(formData.experience.match(/\d+/)?.[0] || '5') : 5;
                            const rate = calculateHourlyRate(e.target.value, formData.location, yearsExp);
                            setFormData(prev => ({ ...prev, hourlyRate: rate }));
                          }
                        }}
                        className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                        placeholder="e.g., Civil Engineer, Project Manager"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
                      <input
                        type="text"
                        list="dept-suggestions"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full h-12 px-4 rounded-xl border-2 border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                        placeholder="e.g., Civil Engineering"
                        required
                      />
                      <datalist id="dept-suggestions">
                        {DEPARTMENTS.map((dept) => <option key={dept} value={dept} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => {
                          setFormData({ ...formData, location: e.target.value });
                          if (e.target.value && formData.jobTitle) {
                            const yearsExp = formData.experience ? parseInt(formData.experience.match(/\d+/)?.[0] || '5') : 5;
                            const rate = calculateHourlyRate(formData.jobTitle, e.target.value, yearsExp);
                            setFormData(prev => ({ ...prev, hourlyRate: rate }));
                          }
                        }}
                        className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                        placeholder="New York, NY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Experience</label>
                      <input
                        type="text"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className="w-full h-12 px-4 rounded-xl border-2 border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                        placeholder="e.g., 5 years, 10+ years"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hourly Rate Auto-Suggestion */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-900" />
                  Hourly Rate (AI Auto-Calculated)
                </h3>
                <p className="text-sm text-gray-600 mb-4">Based on: Role + Location + Experience</p>
                    
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">$</span>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    className="w-full h-11 pl-8 pr-16 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all text-lg font-semibold text-gray-900"
                    placeholder="75"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">/hr</span>
                </div>
                
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">Low Range</p>
                    <p className="text-sm font-bold text-gray-900">${Math.round(parseInt(formData.hourlyRate || '60') * 0.9)}/hr</p>
                  </div>
                  <div className="p-3 bg-gray-900 text-white rounded-lg text-center">
                    <p className="text-xs mb-1">Suggested</p>
                    <p className="text-sm font-bold">${parseInt(formData.hourlyRate || '60')}/hr</p>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">High Range</p>
                    <p className="text-sm font-bold text-gray-900">${Math.round(parseInt(formData.hourlyRate || '60') * 1.1)}/hr</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Skills & Expertise Matrices */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Skills Matrix */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-gray-900" />
                    Skill Set Matrix
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {SKILL_SETS.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSelection(skill, selectedSkills, setSelectedSkills)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          selectedSkills.includes(skill)
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
                    Selected: <span className="font-bold text-gray-900">{selectedSkills.length}</span> skills
                  </div>
                </div>

                {/* Sectors Matrix */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-gray-900" />
                    Sectors Matrix
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {SECTORS.map((sector) => (
                      <button
                        key={sector}
                        type="button"
                        onClick={() => toggleSelection(sector, selectedSectors, setSelectedSectors)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          selectedSectors.includes(sector)
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        {sector}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
                    Selected: <span className="font-bold text-gray-900">{selectedSectors.length}</span> sectors
                  </div>
                </div>

                {/* Services Matrix */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-gray-900" />
                    Services Matrix
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {SERVICES.map((service) => (
                      <button
                        key={service}
                        type="button"
                        onClick={() => toggleSelection(service, selectedServices, setSelectedServices)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          selectedServices.includes(service)
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
                    Selected: <span className="font-bold text-gray-900">{selectedServices.length}</span> services
                  </div>
                </div>

                {/* Project Types Matrix */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-gray-900" />
                    Project Types
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {PROJECT_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleSelection(type, selectedProjectTypes, setSelectedProjectTypes)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          selectedProjectTypes.includes(type)
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
                    Selected: <span className="font-bold text-gray-900">{selectedProjectTypes.length}</span> project types
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Document Checklist */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-900" />
                  Document Upload Checklist
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DOCUMENT_TYPES.map((docType) => {
                    const DocIcon = docType.icon;
                    const isSelected = selectedDocuments.includes(docType.id);
                    const isUploaded = uploadedFiles[docType.id];

                    return (
                      <div
                        key={docType.id}
                        className={`p-4 rounded-lg border transition-all ${
                          isUploaded
                            ? 'bg-gray-50 border-gray-900'
                            : isSelected
                            ? 'bg-white border-gray-400'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id={docType.id}
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDocuments([...selectedDocuments, docType.id]);
                              } else {
                                setSelectedDocuments(selectedDocuments.filter(d => d !== docType.id));
                                const { [docType.id]: removed, ...rest } = uploadedFiles;
                                setUploadedFiles(rest);
                              }
                            }}
                            className="w-6 h-6 text-indigo-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mt-1"
                          />
                          <div className="flex-1">
                            <label htmlFor={docType.id} className="cursor-pointer">
                              <div className="flex items-center gap-2 mb-2">
                                <DocIcon className="w-5 h-5 text-indigo-600" />
                                <p className="text-sm font-semibold text-gray-900">{docType.label}</p>
                              </div>
                            </label>
                            {isSelected && (
                              <div className="mt-3">
                                <input
                                  type="file"
                                  id={`file-${docType.id}`}
                                  onChange={(e) => e.target.files && (setUploadedFiles(prev => ({ ...prev, [docType.id]: e.target.files![0] })))}
                                  className="hidden"
                                  accept=".pdf,.doc,.docx,.jpg,.png"
                                />
                                <label
                                  htmlFor={`file-${docType.id}`}
                                  className={`block text-center px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                    isUploaded
                                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                                      : 'bg-black text-white hover:bg-gray-800'
                                  }`}
                                >
                                  {isUploaded ? (
                                    <span className="flex items-center justify-center gap-2">
                                      <CheckCircle className="w-4 h-4" />
                                      {uploadedFiles[docType.id].name.slice(0, 15)}...
                                    </span>
                                  ) : (
                                    <span className="flex items-center justify-center gap-2">
                                      <Upload className="w-4 h-4" />
                                      Upload File
                                    </span>
                                  )}
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="mt-6 p-5 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm font-bold text-gray-900 mb-3">Onboarding Summary</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-white border border-gray-300 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-900">{selectedSkills.length}</p>
                      <p className="text-xs text-gray-600">Skills</p>
                    </div>
                    <div className="p-3 bg-white border border-gray-300 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-900">{selectedSectors.length}</p>
                      <p className="text-xs text-gray-600">Sectors</p>
                    </div>
                    <div className="p-3 bg-white border border-gray-300 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-900">{selectedServices.length}</p>
                      <p className="text-xs text-gray-600">Services</p>
                    </div>
                    <div className="p-3 bg-white border border-gray-300 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-900">{selectedDocuments.length}</p>
                      <p className="text-xs text-gray-600">Documents</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          </div>

          {/* Footer Navigation */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={isCreating}
                  className="px-5 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-all border border-gray-300 flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
              )}
            </div>

            <div className="flex-1 text-center">
              <div className="w-48 mx-auto bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-gray-900 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Step {currentStep} of {totalSteps}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isCreating}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all flex items-center gap-2"
                >
                  Next Step
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Add Employee
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}

