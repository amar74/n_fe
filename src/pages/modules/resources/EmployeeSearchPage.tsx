import { useState, useEffect } from 'react';
import { Search, Users, Target, Award, Briefcase, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Sparkles, Filter, List, UserCheck, Calendar, Eye, Loader2 } from 'lucide-react';
import { useEmployees } from '@/hooks/resources';
import { apiClient } from '@/services/api/client';
import { toast } from 'sonner';
import { EmployeeDetailsModal } from './components/EmployeeDetailsModal';
import { ScheduleInterviewModal } from './components/ScheduleInterviewModal';

type SearchCriteria = {
  position: string;
  skills: string[];
  sectors: string[];
  services: string[];
  projectTypes: string[];
  experience: string;
  location: string;
};

type SearchResult = {
  id: string;
  name: string;
  role: string;
  location: string;
  experience: string;
  matchPercentage: number;
  availability: 'available' | 'limited' | 'unavailable';
  source: 'internal' | 'external';
  skills: string[];
  email: string;
  phone?: string;
  currentStage?: string; // pending or review
};

// Contractor-specific skills for builders, interior designers, and material suppliers
const SKILLS_OPTIONS = [
  // Construction & Building Skills
  'General Construction', 'Residential Construction', 'Commercial Construction', 'Industrial Construction',
  'Framing & Carpentry', 'Concrete Work', 'Masonry & Stonework', 'Roofing & Waterproofing',
  'Electrical Installation', 'Plumbing Installation', 'HVAC Installation', 'Drywall & Plastering',
  'Flooring Installation', 'Painting & Finishing', 'Tile & Stone Installation', 'Insulation & Weatherproofing',
  
  // Interior Design Skills
  'Interior Design', 'Space Planning', 'Color Consultation', 'Furniture Selection',
  'Kitchen Design', 'Bathroom Design', 'Lighting Design', 'Material Selection',
  '3D Rendering & Visualization', 'CAD Design', 'Design Consultation', 'Styling & Staging',
  
  // Material Supply & Logistics
  'Material Procurement', 'Supply Chain Management', 'Inventory Management', 'Vendor Relations',
  'Quality Control & Inspection', 'Material Sourcing', 'Logistics Coordination', 'Cost Estimation',
  'Material Specifications', 'Delivery Management', 'Supplier Negotiation', 'Material Testing',
  
  // Project Management & Business
  'Project Management', 'Site Supervision', 'Quality Assurance', 'Safety Management',
  'Budget Planning', 'Cost Control', 'Contract Management', 'Client Relations',
  'Team Leadership', 'Subcontractor Management', 'Permit & Code Compliance', 'Risk Management',
];

const SECTORS_OPTIONS = [
  'Transportation',
  'Infrastructure',
  'Environmental',
  'Aviation',
  'Education',
  'Healthcare',
  'Energy',
  'Water Resources',
  'Urban Planning',
  'Industrial',
  'Commercial',
  'Residential',
  'Government',
  'Non-Profit',
  'Technology'
];

const SERVICES_OPTIONS = [
  'Design Services',
  'Consulting',
  'Construction Management',
  'Environmental Assessment',
  'Project Management',
  'Planning Services',
  'Engineering Analysis',
  'Inspection Services',
  'Feasibility Studies',
  'Regulatory Support',
  'Quality Control',
  'Safety Management',
  'Cost Estimation',
  'Risk Assessment',
  'Training Services'
];

const PROJECT_TYPES_OPTIONS = [
  'Highway & Roads',
  'Bridges & Structures',
  'Rail & Transit',
  'Aviation Projects',
  'Water Treatment',
  'Environmental Remediation',
  'Urban Development',
  'Industrial Facilities',
  'Educational Facilities',
  'Healthcare Facilities',
  'Commercial Buildings',
  'Residential Complexes',
  'Government Buildings',
  'Renewable Energy',
  'Telecommunications'
];

export default function EmployeeSearchPage() {
  const { employees, changeStage } = useEmployees(); // Get all employees from database
  const [searchMode, setSearchMode] = useState<'filters' | 'ai'>('filters');
  const [aiQuery, setAiQuery] = useState('');
  
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    position: '',
    skills: [],
    sectors: [],
    services: [],
    projectTypes: [],
    experience: '',
    location: '',
  });

  const [allCandidates, setAllCandidates] = useState<SearchResult[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<SearchResult[]>([]);
  const [isAISearching, setIsAISearching] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<SearchResult[]>([]);
  const [aiFilters, setAiFilters] = useState<any>(null);
  
  // Modals
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Load all candidates on mount
  useEffect(() => {
    const candidates = employees
      .filter(emp => emp.status === 'pending' || emp.status === 'review')
      .map(emp => ({
        id: emp.id,
        name: emp.name,
        role: emp.job_title || emp.role || 'Not specified',
        location: emp.location || 'Not specified',
        experience: emp.experience || 'Not specified',
        matchPercentage: emp.ai_match_percentage || 70,
        availability: emp.status === 'review' ? 'limited' as const : 'available' as const,
        source: 'internal' as const,
        skills: emp.skills || [],
        email: emp.email,
        phone: emp.phone,
        currentStage: emp.status, // pending or review
      }));
    
    setAllCandidates(candidates);
    setFilteredCandidates(candidates); // Show all by default
  }, [employees]);

  // Reset AI search results when switching modes
  useEffect(() => {
    if (searchMode === 'filters') {
      setAiSearchResults([]);
      setAiFilters(null);
      // Reset to all candidates
      setFilteredCandidates(allCandidates);
    }
  }, [searchMode, allCandidates]);

  // Auto-filter when search criteria changes
  useEffect(() => {
    if (searchMode === 'filters') {
      const filtered = allCandidates.filter(candidate => {
        // Position filter
        if (searchCriteria.position && !candidate.role.toLowerCase().includes(searchCriteria.position.toLowerCase())) {
          return false;
        }
        
        // Experience filter
        if (searchCriteria.experience) {
          const candidateExp = parseInt(candidate.experience.split(' ')[0]) || 0;
          switch (searchCriteria.experience) {
            case '0-2':
              if (candidateExp > 2) return false;
              break;
            case '3-5':
              if (candidateExp < 3 || candidateExp > 5) return false;
              break;
            case '6-10':
              if (candidateExp < 6 || candidateExp > 10) return false;
              break;
            case '10+':
              if (candidateExp < 10) return false;
              break;
          }
        }
        
        // Location filter
        if (searchCriteria.location && !candidate.location.toLowerCase().includes(searchCriteria.location.toLowerCase())) {
          return false;
        }
        
        // Skills filter
        if (searchCriteria.skills.length > 0) {
          const hasSkill = searchCriteria.skills.some(skill => 
            candidate.skills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
          );
          if (!hasSkill) return false;
        }
        
        return true;
      });
      
      setFilteredCandidates(filtered);
    }
  }, [searchCriteria, allCandidates, searchMode]);

  const handleViewDetails = (candidate: SearchResult) => {
    setSelectedCandidate({
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      position: candidate.role,
      location: candidate.location,
      experience: candidate.experience,
      skills: candidate.skills,
      status: candidate.currentStage,
      stage: candidate.currentStage,
      appliedDate: new Date().toISOString(),
      cvUrl: '', // Will be populated from backend
      rating: candidate.matchPercentage / 100,
      reviewNotes: '',
    });
    setIsDetailsModalOpen(true);
  };

  const handleScheduleInterview = (candidate: SearchResult) => {
    setSelectedCandidate({
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
    });
    setIsScheduleModalOpen(true);
  };

  const handleInterviewScheduled = (scheduleData: any) => {
    console.log('Interview scheduled:', scheduleData);
    setIsScheduleModalOpen(false);
    // Update candidate stage to 'review' via API
    changeStage({ id: selectedCandidate.id, stage: 'review' });
  };

  const handleStageChange = (employeeId: string, newStage: string) => {
    console.log('Stage changed:', { id: employeeId, stage: newStage });
    changeStage({ id: employeeId, stage: newStage });
    setIsDetailsModalOpen(false);
  };

  const handleDownloadCV = (cvUrl: string, name: string) => {
    const link = document.createElement('a');
    link.href = cvUrl;
    link.download = `CV-${name.replace(/\s+/g, '-')}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAISearch = async () => {
    if (!aiQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }
    
    setIsAISearching(true);
    try {
      console.log('🤖 AI Search query:', aiQuery);
      
      // Call AI search API endpoint
      const response = await apiClient.post('/resources/employees/ai-search', {
        query: aiQuery
      });
      
      const data = response.data;
      console.log('✅ AI Search results:', data);
      
      if (data.results && data.results.length > 0) {
        // Convert backend results to SearchResult format
        const results: SearchResult[] = data.results.map((r: any) => ({
          id: r.id,
          name: r.name,
          role: r.role || 'Not specified',
          location: r.location || 'Not specified',
          experience: r.experience || 'Not specified',
          matchPercentage: r.matchPercentage || 0,
          availability: r.availability || 'available',
          source: r.source || 'internal',
          skills: r.skills || [],
          email: r.email || '',
          phone: r.phone,
          currentStage: r.currentStage || 'pending',
        }));
        
        setAiSearchResults(results);
        setFilteredCandidates(results);
        setAiFilters(data.ai_filters || null);
        
        toast.success(`Found ${data.count} matching candidates (${data.match_range} match)`);
      } else {
        setAiSearchResults([]);
        setFilteredCandidates([]);
        toast.info('No candidates found matching your search');
      }
    } catch (error: any) {
      console.error('❌ AI search failed:', error);
      toast.error(error.response?.data?.detail || 'AI search failed. Please try again.');
      setAiSearchResults([]);
      setFilteredCandidates([]);
    } finally {
      setIsAISearching(false);
    }
  };

  const getAvailabilityConfig = (availability: string) => {
    switch (availability) {
      case 'available':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Available' };
      case 'limited':
        return { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Limited' };
      case 'unavailable':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Unavailable' };
      default:
        return { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Unknown' };
    }
  };

  const displayResults = filteredCandidates;

  return (
    <div className="w-full min-h-screen bg-[#F5F3F2] font-outfit">
      <div className="flex flex-col w-full p-6 gap-6">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm font-normal font-outfit leading-tight">Dashboard</span>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">/</span>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">Resources</span>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">/</span>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">Search</span>
            </div>
            
            <div>
              <h1 className="text-[#1A1A1A] text-3xl font-bold font-outfit leading-loose">
                Candidate Search & Hiring
              </h1>
              <p className="text-gray-600 text-sm font-medium mt-1">
                Search and filter candidates • AI-powered matching • Schedule interviews
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-16 px-6 bg-white rounded-lg border border-gray-300 flex flex-col justify-center">
              <p className="text-gray-500 text-xs font-medium">Total Candidates</p>
              <p className="text-[#1A1A1A] text-2xl font-bold">{allCandidates.length}</p>
            </div>
            <div className="h-16 px-6 bg-white rounded-lg border border-gray-300 flex flex-col justify-center">
              <p className="text-gray-500 text-xs font-medium">Filtered Results</p>
              <p className="text-[#1A1A1A] text-2xl font-bold">{displayResults.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-300">
              <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[#1A1A1A] text-lg font-bold font-outfit">Search & Filter</h2>
                    <p className="text-gray-600 text-xs font-medium mt-1">Refine candidate list</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#161950]/10 rounded-full border border-[#161950]/20">
                    <div className="w-2 h-2 bg-[#161950] rounded-full animate-pulse"></div>
                    <span className="text-xs text-[#161950] font-semibold">Live</span>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-6 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSearchMode('filters')}
                    className={`px-3 py-2.5 rounded-lg border font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      searchMode === 'filters'
                        ? 'text-white border-[#161950]'
                        : 'bg-white text-gray-700 border-gray-300 hover:text-[#161950]'
                    }`}
                    style={searchMode === 'filters' ? { backgroundColor: '#161950' } : {}}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    Filters
                  </button>
                  <button
                    onClick={() => setSearchMode('ai')}
                    className={`px-3 py-2.5 rounded-lg border font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      searchMode === 'ai'
                        ? 'text-white border-[#161950]'
                        : 'bg-white text-gray-700 border-gray-300 hover:text-[#161950]'
                    }`}
                    style={searchMode === 'ai' ? { backgroundColor: '#161950' } : {}}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Search
                  </button>
                </div>

                <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">Active Filters:</span>
                    <span className="text-[#1A1A1A] font-bold">
                      {(searchCriteria.position ? 1 : 0) + 
                       searchCriteria.skills.length + 
                       searchCriteria.sectors.length + 
                       searchCriteria.services.length + 
                       searchCriteria.projectTypes.length +
                       (searchCriteria.experience ? 1 : 0) +
                       (searchCriteria.location ? 1 : 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-gray-600 font-medium">Results:</span>
                    <span className="text-[#1A1A1A] font-bold">{displayResults.length}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {searchMode === 'ai' ? (
                    /* Enhanced AI Search */
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[#344054] text-xs font-semibold font-outfit mb-2">
                          AI-Powered Search
                        </label>
                        <textarea
                          value={aiQuery}
                          onChange={(e) => setAiQuery(e.target.value)}
                          placeholder="Describe what you're looking for..."
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 text-sm h-24 resize-none"
                        />
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                          <span>{aiQuery.length}/200 characters</span>
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            AI Powered
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2">Quick Suggestions:</p>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            "Find civil engineers with 5+ years",
                            "Show Project Managers in NYC",
                            "Electrical contractors available",
                            "Environmental specialists"
                          ].map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => setAiQuery(suggestion)}
                              className="text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-xs text-gray-700 transition-all"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={handleAISearch}
                        disabled={!aiQuery.trim() || isAISearching}
                        className="w-full h-11 px-5 py-2 rounded-lg text-white text-sm font-semibold font-outfit hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#161950' }}
                      >
                        {isAISearching ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            AI Search
                          </>
                        )}
                      </button>
                      
                      {aiFilters && Object.keys(aiFilters).length > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs font-semibold text-blue-900 mb-2">AI Extracted Filters:</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(aiFilters).map(([key, value]: [string, any]) => {
                              if (!value || (Array.isArray(value) && value.length === 0)) return null;
                              return (
                                <span key={key} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                  {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Enhanced Filter-Based Search */
                    <div className="space-y-5">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[#344054] text-xs font-semibold font-outfit">
                            Position / Role
                          </label>
                          {searchCriteria.position && (
                            <button
                              onClick={() => setSearchCriteria(prev => ({ ...prev, position: '' }))}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={searchCriteria.position}
                          onChange={(e) => setSearchCriteria(prev => ({ ...prev, position: e.target.value }))}
                          placeholder="e.g., Project Manager, Civil Engineer"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-[#344054] text-xs font-semibold font-outfit mb-2">
                          Experience Level
                        </label>
                        <select
                          value={searchCriteria.experience || ''}
                          onChange={(e) => setSearchCriteria(prev => ({ ...prev, experience: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 text-sm"
                        >
                          <option value="">Any Experience</option>
                          <option value="0-2">0-2 years (Entry Level)</option>
                          <option value="3-5">3-5 years (Mid Level)</option>
                          <option value="6-10">6-10 years (Senior Level)</option>
                          <option value="10+">10+ years (Expert Level)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[#344054] text-xs font-semibold font-outfit mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={searchCriteria.location || ''}
                          onChange={(e) => setSearchCriteria(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="e.g., New York, California"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 text-sm"
                        />
                      </div>

                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <div className="flex items-center justify-between mb-4 p-3 bg-[#161950]/10 rounded-lg border border-[#161950]/20">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#161950' }}>
                              <Filter className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h3 className="text-[#1A1A1A] text-sm font-bold font-outfit">Advanced Filters</h3>
                              <p className="text-xs text-gray-600">Narrow down by skills & sectors</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-2.5 py-1 bg-white rounded-full">
                            <span className="text-xs font-semibold" style={{ color: '#161950' }}>
                              {searchCriteria.skills.length + searchCriteria.sectors.length + 
                               searchCriteria.services.length + searchCriteria.projectTypes.length}
                            </span>
                            <span className="text-xs text-gray-500">active</span>
                          </div>
                        </div>

                        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#161950]/30 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4" style={{ color: '#161950' }} />
                              <label className="text-[#344054] text-xs font-semibold font-outfit">
                                Skills Matrix
                              </label>
                              {searchCriteria.skills.length > 0 && (
                                <span className="px-2 py-0.5 text-white rounded-full text-xs font-bold" style={{ backgroundColor: '#161950' }}>
                                  {searchCriteria.skills.length}
                                </span>
                              )}
                            </div>
                            {searchCriteria.skills.length > 0 && (
                              <button
                                onClick={() => setSearchCriteria(prev => ({ ...prev, skills: [] }))}
                                className="text-xs text-red-500 hover:text-red-700 font-semibold"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <select
                            multiple
                            value={searchCriteria.skills}
                            onChange={(e) => setSearchCriteria(prev => ({
                              ...prev,
                              skills: Array.from(e.target.selectedOptions, option => option.value)
                            }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#161950]/20 text-xs h-24 bg-white"
                            style={{ borderColor: '#ccc' }}
                            onFocus={(e) => e.target.style.borderColor = '#161950'}
                            onBlur={(e) => e.target.style.borderColor = '#ccc'}
                          >
                            {SKILLS_OPTIONS.map(skill => (
                              <option key={skill} value={skill} className="py-1">{skill}</option>
                            ))}
                          </select>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <span className="font-semibold">💡</span> Ctrl/Cmd + Click for multiple
                            </p>
                            <span className="text-xs text-gray-400">{SKILLS_OPTIONS.length} options</span>
                          </div>
                        </div>

                        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#161950]/30 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4" style={{ color: '#161950' }} />
                              <label className="text-[#344054] text-xs font-semibold font-outfit">
                                Sectors Matrix
                              </label>
                              {searchCriteria.sectors.length > 0 && (
                                <span className="px-2 py-0.5 text-white rounded-full text-xs font-bold" style={{ backgroundColor: '#161950' }}>
                                  {searchCriteria.sectors.length}
                                </span>
                              )}
                            </div>
                            {searchCriteria.sectors.length > 0 && (
                              <button
                                onClick={() => setSearchCriteria(prev => ({ ...prev, sectors: [] }))}
                                className="text-xs text-red-500 hover:text-red-700 font-semibold"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <select
                            multiple
                            value={searchCriteria.sectors}
                            onChange={(e) => setSearchCriteria(prev => ({
                              ...prev,
                              sectors: Array.from(e.target.selectedOptions, option => option.value)
                            }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#161950]/20 text-xs h-24 bg-white"
                            style={{ borderColor: '#ccc' }}
                            onFocus={(e) => e.target.style.borderColor = '#161950'}
                            onBlur={(e) => e.target.style.borderColor = '#ccc'}
                          >
                            {SECTORS_OPTIONS.map(sector => (
                              <option key={sector} value={sector} className="py-1">{sector}</option>
                            ))}
                          </select>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <span className="font-semibold">🏢</span> Industry sectors
                            </p>
                            <span className="text-xs text-gray-400">{SECTORS_OPTIONS.length} options</span>
                          </div>
                        </div>

                        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#161950]/30 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4" style={{ color: '#161950' }} />
                              <label className="text-[#344054] text-xs font-semibold font-outfit">
                                Services Matrix
                              </label>
                              {searchCriteria.services.length > 0 && (
                                <span className="px-2 py-0.5 text-white rounded-full text-xs font-bold" style={{ backgroundColor: '#161950' }}>
                                  {searchCriteria.services.length}
                                </span>
                              )}
                            </div>
                            {searchCriteria.services.length > 0 && (
                              <button
                                onClick={() => setSearchCriteria(prev => ({ ...prev, services: [] }))}
                                className="text-xs text-red-500 hover:text-red-700 font-semibold"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <select
                            multiple
                            value={searchCriteria.services}
                            onChange={(e) => setSearchCriteria(prev => ({
                              ...prev,
                              services: Array.from(e.target.selectedOptions, option => option.value)
                            }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#161950]/20 text-xs h-24 bg-white"
                            style={{ borderColor: '#ccc' }}
                            onFocus={(e) => e.target.style.borderColor = '#161950'}
                            onBlur={(e) => e.target.style.borderColor = '#ccc'}
                          >
                            {SERVICES_OPTIONS.map(service => (
                              <option key={service} value={service} className="py-1">{service}</option>
                            ))}
                          </select>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <span className="font-semibold">⚙️</span> Service offerings
                            </p>
                            <span className="text-xs text-gray-400">{SERVICES_OPTIONS.length} options</span>
                          </div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#161950]/30 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <List className="w-4 h-4" style={{ color: '#161950' }} />
                              <label className="text-[#344054] text-xs font-semibold font-outfit">
                                Project Types
                              </label>
                              {searchCriteria.projectTypes.length > 0 && (
                                <span className="px-2 py-0.5 text-white rounded-full text-xs font-bold" style={{ backgroundColor: '#161950' }}>
                                  {searchCriteria.projectTypes.length}
                                </span>
                              )}
                            </div>
                            {searchCriteria.projectTypes.length > 0 && (
                              <button
                                onClick={() => setSearchCriteria(prev => ({ ...prev, projectTypes: [] }))}
                                className="text-xs text-red-500 hover:text-red-700 font-semibold"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <select
                            multiple
                            value={searchCriteria.projectTypes}
                            onChange={(e) => setSearchCriteria(prev => ({
                              ...prev,
                              projectTypes: Array.from(e.target.selectedOptions, option => option.value)
                            }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#161950]/20 text-xs h-24 bg-white"
                            style={{ borderColor: '#ccc' }}
                            onFocus={(e) => e.target.style.borderColor = '#161950'}
                            onBlur={(e) => e.target.style.borderColor = '#ccc'}
                          >
                            {PROJECT_TYPES_OPTIONS.map(type => (
                              <option key={type} value={type} className="py-1">{type}</option>
                            ))}
                          </select>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <span className="font-semibold">📁</span> Project categories
                            </p>
                            <span className="text-xs text-gray-400">{PROJECT_TYPES_OPTIONS.length} options</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t-2 border-gray-200">
                        <div className="p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200 mb-3">
                          <p className="text-xs text-gray-700 font-medium mb-1">
                            <span className="font-bold text-red-600">
                              {(searchCriteria.position ? 1 : 0) + 
                               searchCriteria.skills.length + 
                               searchCriteria.sectors.length + 
                               searchCriteria.services.length + 
                               searchCriteria.projectTypes.length +
                               (searchCriteria.experience ? 1 : 0) +
                               (searchCriteria.location ? 1 : 0)}
                            </span> filters currently active
                          </p>
                          <p className="text-xs text-gray-600">Clear all filters to see full results</p>
                        </div>
                        <button
                          onClick={() => {
                            setSearchCriteria({
                              position: '',
                              skills: [],
                              sectors: [],
                              services: [],
                              projectTypes: [],
                              experience: '',
                              location: ''
                            });
                          }}
                          className="w-full h-11 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg text-white text-sm font-bold font-outfit transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                        >
                          <XCircle className="w-4 h-4" />
                          Reset All Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {searchMode === 'filters' && (
                  <div className="mt-5 p-3 bg-[#161950]/10 rounded-lg border border-[#161950]/20">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-[#161950] rounded-full animate-pulse"></div>
                      <p className="text-xs font-semibold text-[#1A1A1A]">Live Filtering Active</p>
                    </div>
                    <p className="text-xs text-gray-600">
                      Results update automatically as you modify filters
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-300">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[#1A1A1A] text-lg font-bold font-outfit">Candidate List</h2>
                    <p className="text-gray-600 text-xs font-medium mt-1">
                      {allCandidates.filter(c => c.currentStage === 'pending').length} Pending • {' '}
                      {allCandidates.filter(c => c.currentStage === 'review').length} In Interview • {' '}
                      Showing {displayResults.length} of {allCandidates.length}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-10 px-4 bg-gray-50 rounded-lg border border-gray-300 flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-bold text-gray-900">{displayResults.length}</span>
                      <span className="text-xs text-gray-500">results</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {displayResults.length === 0 ? (
                  <div className="text-center py-16 bg-white border-2 border-gray-300">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Candidates Found</h3>
                    <p className="text-sm text-gray-600">
                      Try adjusting your search criteria or use AI search for better results
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {displayResults.map((candidate) => {
                      const availabilityConfig = getAvailabilityConfig(candidate.availability);
                      const AvailabilityIcon = availabilityConfig.icon;
                      
                      return (
                        <div
                          key={candidate.id}
                          className="bg-white rounded-lg border border-gray-300 hover:shadow-lg transition-all"
                        >
                          <div className="p-5">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                  <h3 className="text-[#1A1A1A] text-base font-bold font-outfit">{candidate.name}</h3>
                                  
                                  <span className={`px-2.5 py-1 rounded text-xs font-semibold font-outfit ${
                                    candidate.currentStage === 'review'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {candidate.currentStage === 'review' ? 'In Interview' : 'Pending'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 mb-3">
                                  <Briefcase className="w-4 h-4 text-gray-400" />
                                  <p className="text-sm font-medium text-gray-700 font-outfit">{candidate.role}</p>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 font-outfit">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    {candidate.location}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    {candidate.experience}
                                  </div>
                                </div>

                                {candidate.skills.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {candidate.skills.slice(0, 4).map((skill, idx) => (
                                      <span key={idx} className="px-2 py-1 bg-gray-50 text-gray-700 text-xs font-medium font-outfit rounded border border-gray-200">
                                        {skill}
                                      </span>
                                    ))}
                                    {candidate.skills.length > 4 && (
                                      <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs font-medium font-outfit rounded border border-gray-200">
                                        +{candidate.skills.length - 4}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="ml-4">
                                <div className={`w-24 h-24 rounded-lg flex flex-col items-center justify-center ${
                                  candidate.matchPercentage >= 70 ? 'bg-green-600' :
                                  candidate.matchPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}>
                                  <p className="text-white text-2xl font-bold font-outfit">{candidate.matchPercentage}%</p>
                                  <p className="text-white text-xs font-medium font-outfit mt-1">AI Match</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                              <button
                                onClick={() => handleViewDetails(candidate)}
                                className="flex-1 h-10 px-4 bg-white rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold font-outfit hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              
                              {candidate.currentStage === 'pending' ? (
                                <button
                                  onClick={() => handleScheduleInterview(candidate)}
                                  className="flex-1 h-10 px-4 rounded-lg text-white text-sm font-semibold font-outfit hover:opacity-90 transition-all flex items-center justify-center gap-2"
                                  style={{ backgroundColor: '#161950' }}
                                >
                                  <Calendar className="w-4 h-4" />
                                  Schedule Interview
                                </button>
                              ) : (
                                <button
                                  onClick={() => changeStage({ id: candidate.id, stage: 'accepted' })}
                                  className="flex-1 h-10 px-4 bg-green-600 rounded-lg text-white text-sm font-semibold font-outfit hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                                >
                                  <UserCheck className="w-4 h-4" />
                                  Hire Candidate
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <EmployeeDetailsModal
        employee={selectedCandidate}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onStageChange={handleStageChange}
        onDownloadCV={handleDownloadCV}
      />

      <ScheduleInterviewModal
        isOpen={isScheduleModalOpen}
        employeeName={selectedCandidate?.name || ''}
        employeeEmail={selectedCandidate?.email}
        onConfirm={handleInterviewScheduled}
        onClose={() => setIsScheduleModalOpen(false)}
      />
    </div>
  );
}