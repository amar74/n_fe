import { Award, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';

type PerformanceAnalyticsProps = {
  employees: any[];
};

export function PerformanceAnalytics({ employees }: PerformanceAnalyticsProps) {
  // Calculate performance metrics
  const totalBillable = employees.reduce((sum: number, e: any) => {
    const billRate = e.bill_rate || 0;
    const hoursPerMonth = 160; // Standard billable hours per month
    return sum + (billRate * hoursPerMonth);
  }, 0);
  
  const avgBillRate = employees.length > 0
    ? employees.reduce((sum: number, e: any) => sum + (e.bill_rate || 0), 0) / employees.length
    : 0;

  const highPerformers = employees.filter((e: any) => {
    const billRate = e.bill_rate || 0;
    return billRate >= avgBillRate * 1.2; // 20% above average
  });

  const metrics = [
    {
      label: 'Monthly Billable Potential',
      value: `$${Math.round(totalBillable).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Based on current bill rates',
    },
    {
      label: 'Average Bill Rate',
      value: `$${Math.round(avgBillRate)}/hr`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Across all employees',
    },
    {
      label: 'High Performers',
      value: `${highPerformers.length}`,
      icon: Award,
      color: 'text-[#161950]',
      bgColor: 'bg-[#161950]/10',
      description: '20%+ above average',
    },
    {
      label: 'Total Employees',
      value: `${employees.length}`,
      icon: BarChart3,
      color: 'text-[#161950]',
      bgColor: 'bg-[#161950]/10',
      description: 'Active workforce',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200" style={{ backgroundColor: '#f0f0ff' }}>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <BarChart3 className="w-6 h-6" style={{ color: '#161950' }} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Performance Analytics</h3>
            <p className="text-sm text-gray-600 mt-1">Billability and revenue metrics</p>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          
          return (
            <div key={idx} className={`p-4 rounded-xl border ${metric.bgColor} border-gray-200`}>
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              <p className="text-sm font-semibold text-gray-700 mt-1">{metric.label}</p>
              <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

