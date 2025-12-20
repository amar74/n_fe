import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Calendar as CalendarIcon, 
  DollarSign, 
  TrendingUp,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { format, isToday, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';

interface AttendanceRecord {
  id: string;
  date: string;
  punch_in: string | null;
  punch_out: string | null;
  total_hours: number | null;
  status: 'present' | 'absent' | 'leave';
}

interface AttendanceStats {
  dailyHours: number;
  weeklyHours: number;
  monthlyHours: number;
  totalPayout: number;
}

const MAX_DAILY_HOURS = 8;

// Helper function to get nth occurrence of a weekday in a month
function getNthWeekday(year: number, month: number, weekday: number, n: number): Date {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const offset = (weekday - firstWeekday + 7) % 7;
  const day = 1 + offset + (n - 1) * 7;
  return new Date(year, month, day);
}

// Helper function to get last occurrence of a weekday in a month
function getLastWeekday(year: number, month: number, weekday: number): Date {
  const lastDay = new Date(year, month + 1, 0);
  const lastWeekday = lastDay.getDay();
  const offset = (lastWeekday - weekday + 7) % 7;
  return new Date(year, month, lastDay.getDate() - offset);
}

// US Federal Holidays for a given year
function getUSHolidays(year: number): Array<{ date: Date; name: string }> {
  const holidays: Array<{ date: Date; name: string }> = [];
  
  // New Year's Day (January 1)
  holidays.push({ date: new Date(year, 0, 1), name: 'New Year\'s Day' });
  
  // Martin Luther King Jr. Day (3rd Monday in January)
  holidays.push({ date: getNthWeekday(year, 0, 1, 3), name: 'Martin Luther King Jr. Day' });
  
  // Presidents' Day (3rd Monday in February)
  holidays.push({ date: getNthWeekday(year, 1, 1, 3), name: 'Presidents\' Day' });
  
  // Memorial Day (last Monday in May)
  holidays.push({ date: getLastWeekday(year, 4, 1), name: 'Memorial Day' });
  
  // Independence Day (July 4)
  holidays.push({ date: new Date(year, 6, 4), name: 'Independence Day' });
  
  // Labor Day (1st Monday in September)
  holidays.push({ date: getNthWeekday(year, 8, 1, 1), name: 'Labor Day' });
  
  // Columbus Day (2nd Monday in October)
  holidays.push({ date: getNthWeekday(year, 9, 1, 2), name: 'Columbus Day' });
  
  // Veterans Day (November 11)
  holidays.push({ date: new Date(year, 10, 11), name: 'Veterans Day' });
  
  // Thanksgiving (4th Thursday in November)
  holidays.push({ date: getNthWeekday(year, 10, 4, 4), name: 'Thanksgiving' });
  
  // Christmas (December 25)
  holidays.push({ date: new Date(year, 11, 25), name: 'Christmas' });
  
  return holidays;
}

// Check if a date is a US holiday
function isUSHoliday(date: Date): { isHoliday: boolean; holidayName?: string } {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  const holidays = getUSHolidays(year);
  
  // Normalize the check date
  const checkDate = new Date(year, month, day);
  checkDate.setHours(0, 0, 0, 0);
  
  for (const holiday of holidays) {
    // Normalize holiday date
    const holidayDate = new Date(holiday.date);
    holidayDate.setHours(0, 0, 0, 0);
    
    // Compare dates
    if (
      checkDate.getFullYear() === holidayDate.getFullYear() &&
      checkDate.getMonth() === holidayDate.getMonth() &&
      checkDate.getDate() === holidayDate.getDate()
    ) {
      return { isHoliday: true, holidayName: holiday.name };
    }
  }
  
  return { isHoliday: false };
}

export function EmployeeAttendancePage() {
  const { backendUser } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Fetch employee record for hourly rate
  const { data: employeeRecord } = useQuery({
    queryKey: ['employeeRecord', backendUser?.id],
    queryFn: async () => {
      if (!backendUser?.id) return null;
      try {
        const response = await apiClient.get('/resources/employees/me');
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) return null;
        return null;
      }
    },
    enabled: !!backendUser?.id,
  });

  const hourlyRate = employeeRecord?.bill_rate || 0;

  // Fetch attendance records for the month
  const { data: attendanceRecords, isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ['attendance', backendUser?.id, format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      if (!backendUser?.id) return [];
      try {
      const response = await apiClient.get(`/resources/employee/attendance`, {
        params: {
          month: format(currentMonth, 'yyyy-MM'),
        },
      });
        return response.data.records || [];
      } catch (error: any) {
        if (error.response?.status === 404) return [];
        return [];
      }
    },
    enabled: !!backendUser?.id,
  });

  // Get today's attendance
  const todayRecord = useMemo(() => {
    if (!attendanceRecords) return null;
    return attendanceRecords.find((record) => isSameDay(new Date(record.date), new Date())) || null;
  }, [attendanceRecords]);

  // Punch in mutation - always use current date and time
  const punchInMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const dateStr = format(now, 'yyyy-MM-dd');
      const timeStr = format(now, 'HH:mm:ss');
      
      const response = await apiClient.post('/resources/employee/attendance/punch-in', {
        date: dateStr,
        time: timeStr,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      const now = new Date();
      toast.success('Punched In Successfully!', {
        description: `You punched in at ${format(now, 'HH:mm')} on ${format(now, 'MMM d, yyyy')}`,
      });
    },
    onError: (error: any) => {
      console.error('Punch In Error:', error);
      toast.error('Punch In Failed', {
        description: error.response?.data?.detail || error.response?.data?.message || 'Failed to punch in. Please try again.',
      });
    },
  });

  // Punch out mutation - always use current date and time
  const punchOutMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const dateStr = format(now, 'yyyy-MM-dd');
      const timeStr = format(now, 'HH:mm:ss');
      
      const response = await apiClient.post('/resources/employee/attendance/punch-out', {
        date: dateStr,
        time: timeStr,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      const now = new Date();
      toast.success('Punched Out Successfully!', {
        description: `You punched out at ${format(now, 'HH:mm')} on ${format(now, 'MMM d, yyyy')}`,
      });
    },
    onError: (error: any) => {
      console.error('Punch Out Error:', error);
      toast.error('Punch Out Failed', {
        description: error.response?.data?.detail || error.response?.data?.message || 'Failed to punch out. Please try again.',
      });
    },
  });

  // Calculate hours with max 8 hours rule
  const calculateHours = (punchIn: string | null, punchOut: string | null, forCurrentDay: boolean = false): number => {
    if (!punchIn) return 0;
    
    // If punched in but not out, and it's the current day, calculate hours until now
    if (!punchOut && forCurrentDay) {
      const inTime = new Date(punchIn);
      const now = new Date();
      const diffMs = now.getTime() - inTime.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      // Maximum 8 hours per day (even if worked more)
      return Math.min(diffHours, MAX_DAILY_HOURS);
    }
    
    if (!punchOut) return 0;
    
    const inTime = new Date(punchIn);
    const outTime = new Date(punchOut);
    const diffMs = outTime.getTime() - inTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    // Maximum 8 hours per day (even if worked more)
    return Math.min(diffHours, MAX_DAILY_HOURS);
  };

  // Calculate statistics
  const stats = useMemo((): AttendanceStats => {
    if (!attendanceRecords) {
      return { dailyHours: 0, weeklyHours: 0, monthlyHours: 0, totalPayout: 0 };
    }

    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    let dailyHours = 0;
    let weeklyHours = 0;
    let monthlyHours = 0;

    attendanceRecords.forEach((record) => {
      const hours = calculateHours(record.punch_in, record.punch_out);
      const recordDate = new Date(record.date);

      // Daily hours (today only)
      if (isSameDay(recordDate, today)) {
        dailyHours = hours;
      }

      // Weekly hours
      if (recordDate >= weekStart && recordDate <= weekEnd) {
        weeklyHours += hours;
      }

      // Monthly hours
      if (recordDate >= monthStart && recordDate <= monthEnd) {
        monthlyHours += hours;
      }
    });

    const totalPayout = monthlyHours * hourlyRate;

    return {
      dailyHours: Math.round(dailyHours * 100) / 100,
      weeklyHours: Math.round(weeklyHours * 100) / 100,
      monthlyHours: Math.round(monthlyHours * 100) / 100,
      totalPayout: Math.round(totalPayout * 100) / 100,
    };
  }, [attendanceRecords, currentMonth, hourlyRate]);

  // Generate calendar days with attendance status (with padding for proper calendar layout)
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const firstDayOfWeek = start.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Create array of all days in month
    const daysInMonth = eachDayOfInterval({ start, end });
    
    // Map month days to calendar data
    const monthDays = daysInMonth.map((day) => {
      const record = attendanceRecords?.find((r) => isSameDay(new Date(r.date), day));
      
      // Check if it's a past day or today
      const isPastOrToday = day <= new Date();
      const isFuture = day > new Date();
      
      if (!record) {
        // No record found
        if (isFuture) {
          // Future dates: not-marked
          return {
            date: day,
            status: 'not-marked' as const,
            hours: 0,
            punchIn: null,
            punchOut: null,
          };
        } else {
          // Past dates without record: absent
          return {
            date: day,
            status: 'absent' as const,
            hours: 0,
            punchIn: null,
            punchOut: null,
          };
        }
      }

      // Record exists - calculate hours
      const isCurrentDay = isToday(day);
      const hours = calculateHours(record.punch_in, record.punch_out, isCurrentDay);
      
      // Determine status:
      // - If punched in but not out: present (still working)
      // - If punched in and out: present (if hours > 0) or absent (if no hours)
      // - If no punch in: absent
      let status: 'present' | 'absent' | 'not-marked' = 'absent';
      
      if (record.punch_in) {
        if (record.punch_out) {
          // Both punch in and out
          status = hours > 0 ? 'present' : 'absent';
        } else {
          // Only punched in (still working) - show as present
          status = 'present';
        }
      } else {
        // No punch in
        status = 'absent';
      }
      
      return {
        date: day,
        status,
        hours,
        punchIn: record.punch_in,
        punchOut: record.punch_out,
      };
    });
    
    // Pad beginning of month with empty days (null values) for calendar grid alignment
    const emptyDaysBefore: (null | typeof monthDays[0])[] = Array.from({ length: firstDayOfWeek }, () => null);
    
    // Calculate days needed at end to fill the grid (complete weeks)
    const totalDays = emptyDaysBefore.length + monthDays.length;
    const rowsNeeded = Math.ceil(totalDays / 7);
    const totalCells = rowsNeeded * 7;
    const emptyDaysAfter: (null | typeof monthDays[0])[] = Array.from({ length: totalCells - totalDays }, () => null);
    
    // Combine: empty days before + month days + empty days after
    return [...emptyDaysBefore, ...monthDays, ...emptyDaysAfter];
  }, [currentMonth, attendanceRecords]);

  const handlePunchIn = () => {
    punchInMutation.mutate();
  };

  const handlePunchOut = () => {
    punchOutMutation.mutate();
  };

  const formatTime = (timeString: string | null): string => {
    if (!timeString) return '--:--';
    return format(new Date(timeString), 'HH:mm');
  };

  const formatDate = (date: Date): string => {
    return format(date, 'MMMM yyyy');
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F3F2] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161950]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3F2] p-6 font-outfit">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance & Time Tracking</h1>
          <p className="text-gray-600">Track your daily work hours and view attendance calendar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Today's Hours</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.dailyHours.toFixed(2)} hrs</h3>
                  {todayRecord?.punch_in && (
                    <p className="text-xs text-gray-500 mt-1">
                      In: {formatTime(todayRecord.punch_in)}
                      {todayRecord.punch_out ? ` | Out: ${formatTime(todayRecord.punch_out)}` : ''}
                    </p>
                  )}
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">This Week</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.weeklyHours.toFixed(2)} hrs</h3>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">This Month</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.monthlyHours.toFixed(2)} hrs</h3>
                </div>
                <CalendarIcon className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Monthly Payout</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    ${stats.totalPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  {hourlyRate > 0 && (
                    <p className="text-xs text-gray-500 mt-1">@ ${hourlyRate}/hr</p>
                  )}
                </div>
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Punch In/Out</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {format(new Date(), 'HH:mm')}
                </div>
                <div className="text-sm text-gray-600">
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </div>
              </div>

              {!todayRecord?.punch_in ? (
                <Button
                  onClick={handlePunchIn}
                  disabled={punchInMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold"
                >
                  {punchInMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Punching In...
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Punch In
                    </>
                  )}
                </Button>
              ) : !todayRecord.punch_out ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Punched In:</span>
                      <span className="font-semibold text-gray-900">{formatTime(todayRecord.punch_in)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Working hours: {calculateHours(todayRecord.punch_in, null, true).toFixed(2)} hrs
                    </div>
                  </div>
                  <Button
                    onClick={handlePunchOut}
                    disabled={punchOutMutation.isPending}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-semibold"
                  >
                    {punchOutMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Punching Out...
                      </div>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 mr-2" />
                        Punch Out
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Punched In:</span>
                      <span className="font-semibold text-gray-900">{formatTime(todayRecord.punch_in)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Punched Out:</span>
                      <span className="font-semibold text-gray-900">{formatTime(todayRecord.punch_out)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-sm font-semibold text-gray-900">Total Hours:</span>
                      <span className="text-lg font-bold text-gray-900">
                        {calculateHours(todayRecord.punch_in, todayRecord.punch_out).toFixed(2)} hrs
                      </span>
                    </div>
                    {calculateHours(todayRecord.punch_in, todayRecord.punch_out) > MAX_DAILY_HOURS && (
                      <div className="text-xs text-amber-600 mt-2">
                        * Capped at {MAX_DAILY_HOURS} hours (max per day)
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#161950] to-[#1E2B5B] text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Attendance Calendar</CardTitle>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-semibold min-w-[180px] text-center text-white">
                    {formatDate(currentMonth)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-7 gap-2 mb-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <div 
                    key={day} 
                    className={`
                      text-center text-sm font-bold py-3 uppercase tracking-wider
                      ${index === 0 ? 'text-red-600' : index === 6 ? 'text-gray-600' : 'text-gray-700'}
                      bg-gray-50 rounded-lg
                    `}
                  >
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((dayData, index) => {
                  // Handle empty days (null) - make them invisible
                  if (!dayData || !dayData.date) {
                    return (
                      <div
                        key={index}
                        className="aspect-square"
                      />
                    );
                  }
                  
                  const isSelected = isSameDay(dayData.date, selectedDate);
                  const isCurrentDay = isToday(dayData.date);
                  const isCurrentMonth = isSameMonth(dayData.date, currentMonth);
                  const dayOfWeek = dayData.date.getDay();
                  const isSunday = dayOfWeek === 0;
                  const isSaturday = dayOfWeek === 6;
                  const isWeekend = isSunday || isSaturday;
                  const isFuture = dayData.date > new Date();
                  
                  // Status-based styling
                  if (!isCurrentMonth) {
                    // Days from other months - hide them
                    return (
                      <div
                        key={index}
                        className="aspect-square"
                      />
                    );
                  }
                  
                  // Check for holiday - normalize dates to compare only year/month/day
                  const dateToCheck = new Date(dayData.date);
                  dateToCheck.setHours(0, 0, 0, 0);
                  const holidayInfo = isUSHoliday(dateToCheck);
                  const isHoliday = holidayInfo.isHoliday;
                  
                  // Check if there's actual attendance data (punch in/out exists)
                  const hasAttendanceData = dayData.punchIn !== null || dayData.punchOut !== null;
                  
                  // Base styles
                  let bgColor = 'bg-white';
                  let textColor = 'text-gray-900';
                  let borderColor = 'border border-gray-200';
                  let hoverEffect = 'hover:border-[#161950] hover:shadow-sm';
                  
                  // Holiday styling - always visible unless there's attendance data or it's current day
                  // Use blue theme color (#161950) for holidays
                  if (isHoliday && !isCurrentDay && !hasAttendanceData) {
                    bgColor = 'bg-blue-50';
                    borderColor = 'border-2 border-[#161950]';
                    textColor = 'text-[#161950]';
                    hoverEffect = 'hover:border-[#1E2B5B] hover:shadow-md';
                  }
                  // Holiday with attendance - show both (holiday border + status background)
                  else if (isHoliday && !isCurrentDay && hasAttendanceData) {
                    borderColor = 'border-2 border-[#161950]';
                    hoverEffect = 'hover:border-[#1E2B5B] hover:shadow-md';
                    // Status will set background below
                  }
                  
                  // Sunday styling - RED color (only if not holiday and not current day)
                  else if (isSunday && !isHoliday && !isCurrentDay && !hasAttendanceData) {
                    bgColor = 'bg-red-50';
                    textColor = 'text-red-700';
                    borderColor = 'border border-red-200';
                  }
                  
                  // Saturday styling - lighter gray (only if not holiday and not current day)
                  else if (isSaturday && !isHoliday && !isCurrentDay && !hasAttendanceData) {
                    bgColor = 'bg-gray-50';
                    textColor = 'text-gray-600';
                  }
                  
                  // Status colors (present/absent) - only if attendance exists
                  if (hasAttendanceData && !isCurrentDay) {
                    if (dayData.status === 'present') {
                      bgColor = 'bg-green-50';
                      if (!isHoliday) borderColor = 'border border-green-300';
                      textColor = 'text-green-900';
                    } else if (dayData.status === 'absent') {
                      bgColor = 'bg-red-50';
                      if (!isHoliday) borderColor = 'border border-red-300';
                      textColor = 'text-red-900';
                    }
                  }
                  
                  // Current day styling - takes highest priority (uses blue theme)
                  if (isCurrentDay) {
                    bgColor = 'bg-blue-50';
                    borderColor = 'border-2 border-blue-500';
                    textColor = 'text-blue-900';
                    hoverEffect = 'hover:border-blue-600 hover:shadow-lg';
                  }
                  
                  // Selected day styling
                  if (isSelected && !isCurrentDay) {
                    borderColor = 'border-2 border-[#161950]';
                    bgColor = bgColor.includes('green') ? 'bg-green-100' : bgColor.includes('red') ? 'bg-red-100' : bgColor.includes('blue-50') && isHoliday ? 'bg-blue-100' : 'bg-gray-100';
                  }

                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedDate(dayData.date)}
                      className={`
                        ${bgColor} ${borderColor} ${textColor}
                        ${hoverEffect}
                        rounded-xl p-2.5 cursor-pointer transition-all duration-300
                        aspect-square flex flex-col items-start justify-between
                        relative group shadow-sm hover:shadow-md
                        ${isCurrentDay ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <div className={`
                          text-base font-bold
                          ${isCurrentDay ? 'text-blue-700' : isSunday && !isHoliday ? 'text-red-700' : isHoliday ? 'text-[#161950]' : 'text-gray-900'}
                        `}>
                          {format(dayData.date, 'd')}
                        </div>
                        {isHoliday && (
                          <div 
                            className="w-2.5 h-2.5 rounded-full bg-[#161950] border border-[#1E2B5B] shadow-sm flex-shrink-0" 
                            title={holidayInfo.holidayName || 'Holiday'}
                          />
                        )}
                      </div>
                      
                      {isHoliday && !hasAttendanceData && (
                        <div className="text-[10px] text-[#161950] font-bold leading-tight mb-1 w-full text-left px-0.5">
                          {holidayInfo.holidayName?.split(' ')[0] || 'Holiday'}
                        </div>
                      )}
                      
                      {dayData.punchIn && (
                        <div className="flex-1 flex items-center justify-center w-full my-1">
                          <div className={`
                            text-xs font-bold px-2.5 py-1 rounded-full
                            ${dayData.status === 'present' 
                              ? 'bg-green-200 text-green-800 border border-green-300' 
                              : 'bg-red-200 text-red-800 border border-red-300'
                            }
                          `}>
                            {dayData.punchOut 
                              ? `${dayData.hours.toFixed(1)}h` 
                              : 'Working...'}
                          </div>
                        </div>
                      )}
                      
                      {dayData.punchIn ? (
                        <div className="w-full space-y-1 mt-auto pt-1 border-t border-gray-200">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></div>
                            <div className="text-[10px] text-green-700 font-semibold leading-tight">
                              In: {formatTime(dayData.punchIn)}
                            </div>
                          </div>
                          {dayData.punchOut ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></div>
                              <div className="text-[10px] text-red-700 font-semibold leading-tight">
                                Out: {formatTime(dayData.punchOut)}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 animate-pulse"></div>
                              <div className="text-[10px] text-blue-700 font-semibold leading-tight">
                                Still working
                              </div>
                            </div>
                          )}
                          {dayData.punchOut && dayData.hours > 0 && (
                            <div className="text-[9px] text-gray-600 font-medium leading-tight pt-0.5">
                              Total: {dayData.hours.toFixed(2)}h
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Absent/Unavailable - Show when not punched */
                        <div className="w-full mt-auto pt-1 border-t border-gray-100">
                          {(() => {
                            const dayIsFuture = dayData.date > new Date();
                            if (dayData.status === 'absent') {
                              return (
                                <div className="text-[10px] text-red-600 font-medium text-center">
                                  Absent
                                </div>
                              );
                            } else if (dayIsFuture) {
                              return (
                                <div className="text-[10px] text-gray-400 font-medium text-center">
                                  Not available
                                </div>
                              );
                            } else {
                              return (
                                <div className="text-[10px] text-gray-500 font-medium text-center">
                                  No punch
                                </div>
                              );
                            }
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex items-center justify-center flex-wrap gap-5 mt-6 pt-5 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-green-300 bg-green-50"></div>
                  <span className="text-xs text-gray-600 font-medium">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-red-300 bg-red-50"></div>
                  <span className="text-xs text-gray-600 font-medium">Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-50"></div>
                  <span className="text-xs text-gray-600 font-medium">Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-red-200 bg-red-50"></div>
                  <span className="text-xs text-red-600 font-semibold">Sunday</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-[#161950] bg-blue-50 relative">
                    <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[#161950]"></div>
                  </div>
                  <span className="text-xs text-[#161950] font-semibold">Holiday</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedDate && (
          <Card className="mt-6 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Details for {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const selectedRecord = attendanceRecords?.find((r) => isSameDay(new Date(r.date), selectedDate));
                
                if (!selectedRecord) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      No attendance record for this date
                    </div>
                  );
                }

                const hours = calculateHours(selectedRecord.punch_in, selectedRecord.punch_out);
                const rawHours = selectedRecord.punch_in && selectedRecord.punch_out
                  ? (new Date(selectedRecord.punch_out).getTime() - new Date(selectedRecord.punch_in).getTime()) / (1000 * 60 * 60)
                  : 0;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Punch In</p>
                      <p className="text-lg font-semibold">{formatTime(selectedRecord.punch_in)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Punch Out</p>
                      <p className="text-lg font-semibold">{formatTime(selectedRecord.punch_out)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Worked Hours</p>
                      <p className="text-lg font-semibold">{rawHours.toFixed(2)} hrs</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Billable Hours (Max {MAX_DAILY_HOURS}h)</p>
                      <p className="text-lg font-semibold text-[#161950]">
                        {hours.toFixed(2)} hrs
                        {rawHours > MAX_DAILY_HOURS && (
                          <span className="text-xs text-amber-600 ml-2">
                            (Capped from {rawHours.toFixed(2)}h)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

