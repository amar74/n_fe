import { TrendingUp, Users, Award, Target, BarChart3, Activity } from 'lucide-react';

export default function ResourceOptimizationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resource Optimization</h1>
          <p className="text-gray-600 mt-2">AI-powered resource allocation and utilization insights</p>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Utilization by Office</h2>
                <p className="text-sm text-gray-600">Employee allocation across locations</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">Northeast Office</p>
                  <p className="text-sm text-gray-600">New York, Boston</p>
                </div>
                <span className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-lg">92% Utilized</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#161950]/10 border border-[#161950]/20 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">Southeast Office</p>
                  <p className="text-sm text-gray-600">Atlanta, Miami</p>
                </div>
                <span className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg">78% Utilized</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">West Coast Office</p>
                  <p className="text-sm text-gray-600">San Francisco, Seattle</p>
                </div>
                <span className="px-4 py-2 bg-yellow-100 text-yellow-700 font-bold rounded-lg">85% Utilized</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">Central Office</p>
                  <p className="text-sm text-gray-600">Chicago, Dallas</p>
                </div>
                <span className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-lg">65% Utilized</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#161950]/10 rounded-xl border border-[#161950]/20">
                <Target className="w-6 h-6 text-[#161950]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Skills in Demand</h2>
                <p className="text-sm text-gray-600">Current market skill analysis</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">Project Management</p>
                  <p className="text-sm text-gray-600">Construction & Infrastructure</p>
                </div>
                <span className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-lg">High Demand</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">Software Development</p>
                  <p className="text-sm text-gray-600">Technology & IT</p>
                </div>
                <span className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-lg">Available</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">Data Analysis</p>
                  <p className="text-sm text-gray-600">Analytics & Insights</p>
                </div>
                <span className="px-4 py-2 bg-yellow-100 text-yellow-700 font-bold rounded-lg">Medium Demand</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">UX/UI Design</p>
                  <p className="text-sm text-gray-600">Design & Product</p>
                </div>
                <span className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-lg">High Demand</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-50 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">AI Optimization Recommendations</h2>
                <p className="text-sm text-gray-600">Smart suggestions to improve resource utilization</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">⚠️ 2 employees underutilized</p>
                <p className="text-sm text-gray-600">
                  Suggest reallocation to Project Alpha or Beta to increase productivity
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">🔥 High workload detected for UX team</p>
                <p className="text-sm text-gray-600">
                  Suggest hiring 1 more designer or reallocate resources from available pool
                </p>
              </div>

              <div className="p-4 bg-[#161950]/10 border-l-4 border-[#161950] rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">💡 Skill gap identified</p>
                <p className="text-sm text-gray-600">
                  3 designers available but 2 missing for upcoming project deadlines
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">✅ Optimal allocation achieved</p>
                <p className="text-sm text-gray-600">
                  Engineering team is well-balanced with 85% average utilization
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

