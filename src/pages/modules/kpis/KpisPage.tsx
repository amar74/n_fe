import { memo } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Plus, Search, Filter, TrendingUp, TrendingDown } from 'lucide-react';

function KPIsPage() {
  return (
    <div className="w-full h-full bg-[#F5F3F2] font-inter">
      <div className="flex flex-col w-full p-6 gap-6">
        
        <div className="flex justify-between items-end">
          
          <div className="flex flex-col gap-3">
            
            <div className="flex items-center gap-2">
              <Link to="/" className="text-gray-500 text-sm font-normal font-inter leading-tight hover:text-gray-900">
                Dashboard
              </Link>
              <span className="text-[#344054] text-sm font-normal font-inter leading-tight">/</span>
              <span className="text-[#344054] text-sm font-normal font-inter leading-tight">KPI's</span>
            </div>
            
            
            <h1 className="text-[#1A1A1A] text-3xl font-semibold font-inter leading-loose">Key Performance Indicators</h1>
          </div>

          
          <div className="flex items-start gap-3">
            
            <button 
              className="h-11 px-5 py-2 bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg flex items-center gap-2.5 hover:from-slate-900 hover:to-black transition-all shadow-lg"
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-semibold font-inter leading-normal">Create KPI</span>
            </button>
          </div>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total KPIs', value: '0', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50', trend: null },
            { label: 'On Target', value: '0', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', trend: 'up' },
            { label: 'At Risk', value: '0', icon: TrendingDown, color: 'text-yellow-600', bg: 'bg-yellow-50', trend: 'down' },
            { label: 'Critical', value: '0', icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50', trend: 'down' },
          ].map((stat, index) => (
            <div key={index} className="p-6 bg-white rounded-2xl border border-gray-200 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm font-medium font-inter">{stat.label}</span>
                <div className={`p-2 ${stat.bg} rounded-lg`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-[#1A1A1A] text-3xl font-bold font-inter">{stat.value}</div>
                {stat.trend && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {stat.trend === 'up' ? (
                      <TrendingUp className={`w-3 h-3 ${stat.color}`} />
                    ) : (
                      <TrendingDown className={`w-3 h-3 ${stat.color}`} />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-6">
          
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search KPIs..."
                className="w-full h-12 pl-12 pr-4 bg-gray-50 rounded-lg border border-gray-200 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              />
            </div>
            <button className="h-12 px-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2 hover:bg-gray-100 transition-colors">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 text-sm font-medium font-inter">Filter</span>
            </button>
          </div>

          
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="p-4 bg-slate-50 rounded-full">
              <BarChart3 className="w-12 h-12 text-slate-600" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-[#1A1A1A] text-xl font-semibold font-inter">No KPIs defined yet</h3>
              <p className="text-gray-500 text-sm font-inter text-center max-w-md">
                Define and track key performance indicators for your business. Monitor progress and make data-driven decisions.
              </p>
            </div>
            <button className="mt-4 h-11 px-6 py-2 bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg flex items-center gap-2 hover:from-slate-900 hover:to-black transition-all shadow-lg">
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-semibold font-inter">Create Your First KPI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(KPIsPage);
