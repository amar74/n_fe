import { useState } from 'react';
import { Download, Eye, GripVertical, Mail, Phone, Calendar, User, Clock, CheckCircle, XCircle, AlertCircle, Star, MapPin, Briefcase, TrendingUp, Users, Award, Power } from 'lucide-react';

export type Employee = {
  id: string;
  number: string;
  name: string;
  email: string;
  phone: string;
  cvUrl: string;
  stage: string;
  appliedDate: string;
  reviewNotes: string;
  position?: string;
  experience?: string;
  skills?: string[];
  rating?: number;
  location?: string;
};

type KanbanBoardProps = {
  employeesByStage: {
    pending: Employee[];
    review: Employee[];
    accepted: Employee[];
    rejected: Employee[];
  };
  onStageChange: (employeeId: string, newStage: string, notes?: string) => void;
  onEmployeeClick: (employee: Employee) => void;
  onDownloadCV: (cvUrl: string, name: string) => void;
  onActivateEmployee?: (employee: Employee) => void;
};

const stages = [
  { 
    id: 'pending', 
    title: 'Pending Review', 
    subtitle: 'Awaiting HR Review',
    color: 'bg-white border-l-4 border-l-amber-500', 
    headerBg: 'bg-gradient-to-r from-amber-50 to-orange-50',
    badgeColor: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg',
    icon: Clock,
    iconColor: 'text-amber-600',
    description: 'New applications waiting for initial review'
  },
  { 
    id: 'review', 
    title: 'Under Review', 
    subtitle: 'Interview Process',
    color: 'bg-white border-l-4 border-l-blue-500', 
    headerBg: 'bg-[#161950]/10',
    badgeColor: 'bg-[#161950] text-white shadow-lg',
    icon: Users,
    iconColor: 'text-blue-600',
    description: 'Candidates in active interview process'
  },
  { 
    id: 'accepted', 
    title: 'Accepted', 
    subtitle: 'Ready to Onboard',
    color: 'bg-white border-l-4 border-l-green-600', 
    headerBg: 'bg-gradient-to-r from-green-50 to-emerald-50',
    badgeColor: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg',
    icon: CheckCircle,
    iconColor: 'text-green-600',
    description: 'Successful candidates ready for onboarding'
  },
  { 
    id: 'rejected', 
    title: 'Not Selected', 
    subtitle: 'Application Closed',
    color: 'bg-white border-l-4 border-l-gray-400', 
    headerBg: 'bg-gradient-to-r from-gray-50 to-slate-50',
    badgeColor: 'bg-gradient-to-r from-gray-400 to-slate-400 text-white shadow-lg',
    icon: XCircle,
    iconColor: 'text-gray-500',
    description: 'Applications that did not meet requirements'
  },
];

export function KanbanBoard({ employeesByStage, onStageChange, onEmployeeClick, onDownloadCV, onActivateEmployee }: KanbanBoardProps) {
  const [draggedEmployee, setDraggedEmployee] = useState<Employee | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const handleDragStart = (employee: Employee) => {
    setDraggedEmployee(employee);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    if (draggedEmployee && draggedEmployee.stage !== newStage) {
      // Open employee details modal which will handle stage change confirmation
      onEmployeeClick(draggedEmployee);
      // The EmployeeDetailsModal will handle the stage change with proper confirmation
    }
    setDraggedEmployee(null);
    setDragOverStage(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stages.map((stage) => {
        const employees = employeesByStage[stage.id as keyof typeof employeesByStage] || [];
        const isDragOver = dragOverStage === stage.id;
        const IconComponent = stage.icon;

        return (
          <div
            key={stage.id}
            className={`flex flex-col rounded-xl border border-gray-200 bg-white transition-all duration-300 shadow-lg hover:shadow-xl ${
              isDragOver ? 'ring-2 ring-blue-500 scale-[1.02] shadow-2xl bg-blue-50' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            <div className={`p-5 ${stage.headerBg} border-b border-gray-200 rounded-t-xl relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gray-400 rounded-full transform translate-x-8 -translate-y-8"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gray-400 rounded-full transform -translate-x-6 translate-y-6"></div>
              </div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white shadow-sm ${stage.iconColor}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{stage.title}</h3>
                      <p className="text-sm text-gray-600 font-medium">{stage.subtitle}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${stage.badgeColor} shadow-md`}>
                    {employees.length}
                  </div>
                </div>
                <p className="text-xs text-gray-500 italic">{stage.description}</p>
              </div>
            </div>

            <div className="flex-1 p-4 space-y-4 min-h-[450px] max-h-[650px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {employees.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <div className="p-4 bg-gray-100 rounded-full mb-3">
                    <User className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">No candidates</p>
                  <p className="text-xs text-gray-400 mt-1">Drag candidates here to move them</p>
                </div>
              ) : (
                employees.map((employee, index) => (
                  <div
                    key={employee.id}
                    draggable
                    onDragStart={() => handleDragStart(employee)}
                    className={`${stage.color} rounded-xl p-5 shadow-lg border border-gray-200 cursor-move hover:shadow-xl transition-all duration-300 group relative transform hover:scale-[1.02] hover:-translate-y-1`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="p-1 bg-gray-100 rounded-md">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="pr-8">
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full text-xs font-bold text-gray-700 mb-4 shadow-sm">
                        <Award className="w-3 h-3" />
                        #{employee.number}
                      </div>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-[#161950]/10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md border border-[#161950]/20">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            stage.id === 'accepted' ? 'bg-green-500' :
                            stage.id === 'rejected' ? 'bg-red-500' :
                            stage.id === 'review' ? 'bg-blue-500' : 'bg-amber-500'
                          }`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-bold text-gray-900 truncate mb-1">
                            {employee.name}
                          </h4>
                          {employee.position && (
                            <p className="text-sm text-gray-600 font-medium truncate">
                              {employee.position}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2.5 mb-4">
                        <div className="flex items-center gap-2.5 text-sm text-gray-600">
                          <div className="p-1 bg-gray-100 rounded">
                            <Mail className="w-3.5 h-3.5 text-gray-500" />
                          </div>
                          <span className="truncate font-medium" title={employee.email}>{employee.email}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm text-gray-600">
                          <div className="p-1 bg-gray-100 rounded">
                            <Phone className="w-3.5 h-3.5 text-gray-500" />
                          </div>
                          <span className="font-medium">{employee.phone}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm text-gray-500">
                          <div className="p-1 bg-gray-100 rounded">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                          <span className="font-medium">
                            Applied {new Date(employee.appliedDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                        {employee.location && (
                          <div className="flex items-center gap-2.5 text-sm text-gray-500">
                            <div className="p-1 bg-gray-100 rounded">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                            <span className="font-medium">{employee.location}</span>
                          </div>
                        )}
                      </div>

                      {employee.skills && employee.skills.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {employee.skills.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
                                {skill}
                              </span>
                            ))}
                            {employee.skills.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                                +{employee.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {employee.rating && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 ${
                                  i < employee.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            {employee.rating}/5
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                        {stage.id === 'accepted' && onActivateEmployee && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onActivateEmployee(employee);
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#151950] to-[#1e2570] hover:from-[#1e2570] hover:to-[#151950] rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                          >
                            <Power className="w-4 h-4" />
                            Activate User Account
                          </button>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onEmployeeClick(employee)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 transition-all duration-200 hover:shadow-md"
                          >
                            <Eye className="w-4 h-4" />
                            Details
                          </button>
                          <button
                            onClick={() => onDownloadCV(employee.cvUrl, employee.name)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                          >
                            <Download className="w-4 h-4" />
                            CV
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

