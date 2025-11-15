import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, Award, 
  DollarSign, Clock, FileText, Edit, Trash2, Download, Users,
  TrendingUp, Building2, CheckCircle2, XCircle, Loader2, 
  CalendarDays, BarChart3, Wallet, AlertCircle, Target, Eye, EyeOff, Key, Copy
} from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { copyToClipboard } from '@/utils/clipboard';
import { toast } from 'sonner';
import { useState } from 'react';

export default function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { employees: allEmployees, isLoading, deleteEmployee } = useEmployees();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showPassword, setShowPassword] = useState(false);
  
  const employee = (allEmployees as any[])?.find((emp: any) => emp.id === id);
  
  // Extract password from review_notes if available (stored during activation)
  const extractPassword = (notes: string) => {
    if (!notes) return null;
    const match = notes.match(/Password:\s*([^\s,]+)/);
    return match ? match[1] : null;
  };
  
  const temporaryPassword = employee?.review_notes ? extractPassword(employee.review_notes) : null;

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      await deleteEmployee(id!);
      toast.success('Employee deleted successfully');
      navigate('/module/resources/management');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete employee');
    }
  };

  const handleDownloadCV = () => {
    toast.info('CV download feature - coming soon');
  };

  const handleCopyEmployeeId = async () => {
    if (!employee?.employee_number) {
      toast.error('Employee ID not available');
      return;
    }

    await copyToClipboard(employee.employee_number);
    toast.success('Employee ID copied to clipboard');
  };

  const handleCopyUserId = async () => {
    if (!employee?.user_id) {
      toast.error('User ID not available');
      return;
    }

    await copyToClipboard(employee.user_id);
    toast.success('User ID copied to clipboard');
  };

  const handleCopyPassword = async () => {
    if (!temporaryPassword) {
      toast.error('Temporary password not available');
      return;
    }

    await copyToClipboard(temporaryPassword);
    toast.success('Password copied to clipboard');
  };

  const handleCopyCredentials = async () => {
    const credentials = `Employee ID: ${employee.employee_number}\nUser ID: ${employee.user_id || 'Not assigned'}\nEmail: ${employee.email}\nPassword: ${temporaryPassword || 'Not available'}`;
    await copyToClipboard(credentials);
    toast.success('Login credentials copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#F5F3F2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#151950]" />
          <p className="text-gray-600">Loading employee profile...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="w-full min-h-screen bg-[#F5F3F2] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Employee Not Found</h2>
          <p className="text-gray-600 mb-6">The employee you're looking for doesn't exist.</p>
          <Link to="/module/resources/management">
            <button className="px-6 py-3 bg-[#151950] text-white rounded-lg hover:bg-[#1e2570] transition-colors">
              Back to Active Employees
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate stats from real data
  const billRate = employee.bill_rate || 0;
  const standardHoursPerWeek = 40;
  const standardHoursPerMonth = 160;
  const workingDaysPerWeek = 5;
  const workingDaysPerMonth = 22; // Average working days
  
  const dailyRate = billRate * 8; // 8 hours per day
  const weeklyEarnings = billRate * standardHoursPerWeek;
  const monthlyEarnings = billRate * standardHoursPerMonth;
  const yearlyEarnings = monthlyEarnings * 12;
  
  // Attendance calculation (mock for now - will be real data from backend)
  const totalWorkingDays = workingDaysPerMonth;
  const presentDays = 20; // TODO: Get from backend
  const absentDays = 2; // TODO: Get from backend
  const leaveDays = 0; // TODO: Get from backend
  const attendancePercentage = ((presentDays / totalWorkingDays) * 100).toFixed(1);
  
  // Generate calendar for current month
  const generateCalendar = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const days = [];
    
    // Add empty slots for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isPast = date < new Date();
      const isToday = date.toDateString() === new Date().toDateString();
      
      // TODO: Get real attendance from backend
      let status = 'not-marked';
      if (isPast && !isWeekend) {
        status = Math.random() > 0.1 ? 'present' : 'absent';
      } else if (isWeekend) {
        status = 'weekend';
      }
      
      days.push({ day, date, status, isToday, isWeekend, isPast });
    }
    
    return days;
  };
  
  const calendarDays = generateCalendar();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
  return (
    <div className="w-full min-h-screen bg-[#F5F3F2] font-inter">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link to="/module/resources/management">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </Link>
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Link to="/" className="hover:text-gray-900">Dashboard</Link>
                <span>/</span>
                <Link to="/module/resources" className="hover:text-gray-900">Resources</Link>
                <span>/</span>
                <Link to="/module/resources/management" className="hover:text-gray-900">Active Employees</Link>
                <span>/</span>
                <span className="text-gray-900 font-semibold">Profile</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Employee Profile</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Employee
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Employee Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              {/* Profile Header */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-[#151950] to-[#1e2570] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold">
                  {employee.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <span className="uppercase text-xs tracking-wide text-gray-500">Employee ID</span>
                    <span className="font-mono text-sm text-gray-900 bg-blue-50 border border-blue-200 px-2 py-1 rounded-md">
                      {employee.employee_number}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyEmployeeId}
                      className="p-2 rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  {employee.user_id && (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <span className="uppercase text-xs tracking-wide text-gray-500">User ID</span>
                      <span className="font-mono text-xs sm:text-sm text-gray-900 bg-purple-50 border border-purple-200 px-2 py-1 rounded-md break-all">
                        {employee.user_id}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyUserId}
                        className="p-2 rounded-md border border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                    employee.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {employee.status === 'active' ? 'Active' : employee.status}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Contact Information</h3>
                
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <a href={`mailto:${employee.email}`} className="text-gray-700 hover:text-[#151950]">
                    {employee.email}
                  </a>
                </div>
                
                {employee.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a href={`tel:${employee.phone}`} className="text-gray-700 hover:text-[#151950]">
                      {employee.phone}
                    </a>
                  </div>
                )}
                
                {employee.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700">{employee.location}</span>
                  </div>
                )}
              </div>

              {/* Employment Details */}
              <div className="space-y-3 border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Employment Details</h3>
                
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs">Job Title</p>
                    <p className="text-gray-900 font-medium">{employee.job_title || employee.role || 'Not specified'}</p>
                  </div>
                </div>
                
                {employee.department && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs">Department</p>
                      <p className="text-gray-900 font-medium">{employee.department}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs">Joined</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(employee.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                {employee.experience && (
                  <div className="flex items-center gap-3 text-sm">
                    <Award className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs">Experience</p>
                      <p className="text-gray-900 font-medium">{employee.experience}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 pt-4 mt-4 flex gap-2">
                <button
                  onClick={handleDownloadCV}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#151950] text-white rounded-lg hover:bg-[#1e2570] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download CV
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <FileText className="w-4 h-4" />
                  View Resume
                </button>
              </div>
            </div>

            {/* Skills */}
            {employee.skills && employee.skills.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#151950]" />
                  Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {employee.skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Earnings Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#151950]" />
                Earnings Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Hourly</span>
                  <span className="font-bold text-gray-900">${billRate}/hr</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Daily (8 hrs)</span>
                  <span className="font-bold text-gray-900">${dailyRate}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm text-blue-700 font-medium">Weekly (40 hrs)</span>
                  <span className="font-bold text-blue-900">${weeklyEarnings.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm text-green-700 font-medium">Monthly (160 hrs)</span>
                  <span className="font-bold text-green-900">${monthlyEarnings.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <span className="text-sm text-purple-700 font-medium">Yearly (Est.)</span>
                  <span className="font-bold text-purple-900">${yearlyEarnings.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Terms & Availability */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#151950]" />
                Payment Terms & Availability
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Payment Frequency</p>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Monthly</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Payment Method</p>
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <Wallet className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Bank Transfer</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Working Days</p>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-purple-700">Per Week</span>
                      <span className="font-bold text-purple-900">{workingDaysPerWeek} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-700">Per Month</span>
                      <span className="font-bold text-purple-900">{workingDaysPerMonth} days</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Total Available Days</p>
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-2xl font-bold text-orange-900 text-center">{presentDays}/{totalWorkingDays}</p>
                    <p className="text-xs text-center text-orange-700 mt-1">This Month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Financial Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <DollarSign className="w-6 h-6 text-purple-600 mb-2" />
                <p className="text-xs text-purple-700 font-medium mb-1">Hourly Rate</p>
                <p className="text-2xl font-bold text-purple-900">${billRate}</p>
                <p className="text-xs text-purple-600 mt-1">per hour</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                <Calendar className="w-6 h-6 text-orange-600 mb-2" />
                <p className="text-xs text-orange-700 font-medium mb-1">Daily Rate</p>
                <p className="text-2xl font-bold text-orange-900">${dailyRate.toLocaleString()}</p>
                <p className="text-xs text-orange-600 mt-1">8 hours/day</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <Clock className="w-6 h-6 text-blue-600 mb-2" />
                <p className="text-xs text-blue-700 font-medium mb-1">Weekly Earnings</p>
                <p className="text-2xl font-bold text-blue-900">${weeklyEarnings.toLocaleString()}</p>
                <p className="text-xs text-blue-600 mt-1">40 hrs/week</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
                <p className="text-xs text-green-700 font-medium mb-1">Monthly Earnings</p>
                <p className="text-2xl font-bold text-green-900">${(monthlyEarnings / 1000).toFixed(1)}K</p>
                <p className="text-xs text-green-600 mt-1">160 hrs/month</p>
              </div>
            </div>

            {/* Performance & Attendance Stats */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#151950]" />
                  Performance & Attendance Overview
                </h3>
                <span className="text-sm text-gray-500">
                  {monthNames[selectedMonth]} {selectedYear}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-3xl font-bold text-green-700">{presentDays}</p>
                  <p className="text-xs text-gray-600 mt-1">Present Days</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-3xl font-bold text-red-700">{absentDays}</p>
                  <p className="text-xs text-gray-600 mt-1">Absent Days</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-3xl font-bold text-blue-700">{leaveDays}</p>
                  <p className="text-xs text-gray-600 mt-1">Leave Days</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-3xl font-bold text-purple-700">{attendancePercentage}%</p>
                  <p className="text-xs text-gray-600 mt-1">Attendance</p>
                </div>
              </div>

              {/* Attendance Calendar */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-[#151950]" />
                    Attendance Calendar
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (selectedMonth === 0) {
                          setSelectedMonth(11);
                          setSelectedYear(selectedYear - 1);
                        } else {
                          setSelectedMonth(selectedMonth - 1);
                        }
                      }}
                      className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => {
                        if (selectedMonth === 11) {
                          setSelectedMonth(0);
                          setSelectedYear(selectedYear + 1);
                        } else {
                          setSelectedMonth(selectedMonth + 1);
                        }
                      }}
                      className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                    >
                      Next →
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((day, index) => (
                    <div
                      key={index}
                      className={`aspect-square flex items-center justify-center text-sm rounded-lg ${
                        !day
                          ? 'bg-transparent'
                          : day.status === 'present'
                          ? 'bg-green-100 text-green-700 font-medium border border-green-300'
                          : day.status === 'absent'
                          ? 'bg-red-100 text-red-700 font-medium border border-red-300'
                          : day.status === 'weekend'
                          ? 'bg-gray-100 text-gray-400'
                          : day.isToday
                          ? 'bg-blue-100 text-blue-700 font-bold border-2 border-blue-500'
                          : 'bg-white border border-gray-200 text-gray-700'
                      }`}
                    >
                      {day?.day}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                    <span className="text-gray-600">Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                    <span className="text-gray-600">Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 rounded"></div>
                    <span className="text-gray-600">Weekend</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded"></div>
                    <span className="text-gray-600">Today</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Working Availability - Only show if real schedule data exists */}
            {employee.schedule && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#151950]" />
                  Working Schedule
                </h3>
                <div className="text-center py-8">
                  <p className="text-gray-600 text-sm">
                    Schedule management coming soon. Contact HR for availability details.
                  </p>
                </div>
              </div>
            )}

            {/* Projects & Accounts - Real data from backend */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#151950]" />
                    Projects
                  </h3>
                </div>
                <div className="text-center py-8">
                  <p className="text-4xl font-bold text-gray-900 mb-2">
                    {employee.projects_count || 0}
                  </p>
                  <p className="text-sm text-gray-500">Total Projects</p>
                  {(!employee.projects_count || employee.projects_count === 0) && (
                    <p className="text-xs text-gray-400 mt-2">No projects assigned yet</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#151950]" />
                    Accounts
                  </h3>
                </div>
                <div className="text-center py-8">
                  <p className="text-4xl font-bold text-gray-900 mb-2">
                    {employee.accounts_count || 0}
                  </p>
                  <p className="text-sm text-gray-500">Associated Accounts</p>
                  {(!employee.accounts_count || employee.accounts_count === 0) && (
                    <p className="text-xs text-gray-400 mt-2">No accounts assigned yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* User Credentials */}
            {employee.user_id && (
              <div className="bg-gradient-to-r from-[#151950] to-[#1e2570] rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  User Account Credentials
                </h3>
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-sm text-white/70 mb-2">User ID</p>
                    <p className="text-base font-mono font-bold break-all">{employee.user_id}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-sm text-white/70 mb-2">Email (Login)</p>
                    <p className="text-base font-mono font-bold">{employee.email}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-white/70">Temporary Password</p>
                      <div className="flex gap-2">
                        {temporaryPassword && (
                          <button
                            onClick={handleCopyPassword}
                            className="flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-xs"
                            title="Copy Password"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="flex items-center gap-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-xs"
                        >
                          {showPassword ? (
                            <>
                              <EyeOff className="w-3 h-3" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              Show
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    {temporaryPassword ? (
                      <p className="text-base font-mono font-bold select-all">
                        {showPassword ? temporaryPassword : '••••••••••••'}
                      </p>
                    ) : (
                      <p className="text-sm text-white/60 italic">
                        Password not stored (activated before password storage was enabled)
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-3 mt-4">
                  {temporaryPassword && (
                    <button
                      onClick={handleCopyCredentials}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Login Credentials
                    </button>
                  )}
                  <div className="flex items-start gap-2 p-3 bg-white/10 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-white/80">
                      <strong>Security Note:</strong> This is the initial password set during activation. 
                      Employee should change it on first login. Passwords are securely hashed in the database.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

