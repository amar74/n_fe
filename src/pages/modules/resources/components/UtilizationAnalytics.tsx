import { TrendingUp, TrendingDown, Users, Clock, Target, AlertTriangle } from 'lucide-react';

type UtilizationAnalyticsProps = {
  employees: any[];
};

export function UtilizationAnalytics({ employees }: UtilizationAnalyticsProps) {
  // Calculate utilization metrics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e: any) => e.status === 'active').length;
  const utilizationRate = totalEmployees > 0 ? Math.round((activeEmployees / totalEmployees) * 100) : 0;
  
  // Bench employees (not assigned to projects)
  const benchEmployees = employees.filter((e: any) => {
    // Assuming employees have allocation status - adjust based on your data model
    return e.status === 'active' && (!e.allocation_percentage || e.allocation_percentage === 0);
  });
  
  const benchPercentage = totalEmployees > 0 ? Math.round((benchEmployees.length / totalEmployees) * 100) : 0;
  
  // Average bill rate
  const avgBillRate = employees.length > 0
    ? Math.round(employees.reduce((sum: number, e: any) => sum + (e.bill_rate || 0), 0) / employees.length)
    : 0;

  const metrics = [
    {
      label: 'Utilization Rate',
      value: `${utilizationRate}%`,
      icon: Target,
      color: utilizationRate >= 75 ? 'text-green-600' : utilizationRate >= 50 ? 'text-amber-600' : 'text-red-600',
      bgColor: utilizationRate >= 75 ? 'bg-green-50' : utilizationRate >= 50 ? 'bg-amber-50' : 'bg-red-50',
      trend: utilizationRate >= 75 ? 'up' : 'down',
    },
    {
      label: 'On Bench',
      value: `${benchEmployees.length}`,
      icon: Clock,
      color: benchPercentage > 20 ? 'text-red-600' : benchPercentage > 10 ? 'text-amber-600' : 'text-green-600',
      bgColor: benchPercentage > 20 ? 'bg-red-50' : benchPercentage > 10 ? 'bg-amber-50' : 'bg-green-50',
      trend: benchPercentage > 20 ? 'down' : 'up',
    },
    {
      label: 'Avg Bill Rate',
      value: `$${avgBillRate}/hr`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: 'up',
    },
    {
      label: 'Active Employees',
      value: `${activeEmployees}`,
      icon: Users,
      color: 'text-[#161950]',
      bgColor: 'bg-[#161950]/10',
      trend: 'up',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200" style={{ backgroundColor: '#f0f0ff' }}>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Target className="w-6 h-6" style={{ color: '#161950' }} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Utilization Analytics</h3>
            <p className="text-sm text-gray-600 mt-1">Team performance and resource allocation</p>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <div key={idx} className={`p-4 rounded-xl border ${metric.bgColor} border-gray-200`}>
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${metric.color}`} />
                <TrendIcon className={`w-4 h-4 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              <p className="text-sm text-gray-600 font-medium mt-1">{metric.label}</p>
            </div>
          );
        })}
      </div>

      {benchEmployees.length > 0 && (
        <div className="p-6 border-t border-gray-200 bg-amber-50">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <p className="text-sm font-bold text-amber-900">Bench Alert</p>
          </div>
          <p className="text-sm text-amber-700">
            {benchEmployees.length} employee{benchEmployees.length !== 1 ? 's' : ''} on bench ({benchPercentage}%). 
            Consider reallocating to active projects.
          </p>
        </div>
      )}
    </div>
  );
}

