import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  UserCheck,
  Calendar,
  Plus,
  Eye,
  MessageSquare
} from 'lucide-react';

function EmployeeSurveyDashboard() {
  // Mock data - replace with actual API calls later
  const stats = [
    {
      title: 'Total Surveys',
      value: '18',
      change: '+10%',
      trend: 'up',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Surveys',
      value: '6',
      change: '+3%',
      trend: 'up',
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Response Rate',
      value: '85%',
      change: '+5%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Responses',
      value: '2,567',
      change: '+18%',
      trend: 'up',
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const recentSurveys = [
    {
      id: 1,
      title: 'Employee Engagement Survey',
      department: 'All Departments',
      status: 'Active',
      responses: 156,
      created: '2024-10-18',
    },
    {
      id: 2,
      title: 'Onboarding Experience Feedback',
      department: 'New Hires',
      status: 'Active',
      responses: 45,
      created: '2024-10-22',
    },
    {
      id: 3,
      title: 'Annual Performance Review',
      department: 'Engineering',
      status: 'Completed',
      responses: 89,
      created: '2024-10-08',
    },
    {
      id: 4,
      title: 'Work-Life Balance Survey',
      department: 'All Departments',
      status: 'Active',
      responses: 203,
      created: '2024-10-20',
    },
    {
      id: 5,
      title: 'Training Needs Assessment',
      department: 'Sales',
      status: 'Active',
      responses: 34,
      created: '2024-10-24',
    },
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Employee Survey Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Manage and track internal employee surveys and feedback
              </p>
            </div>
            <Button className="flex items-center gap-2 bg-black text-white hover:bg-gray-800">
              <Plus className="h-4 w-4" />
              Create New Survey
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    {stat.trend === 'up' ? (
                      <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {stat.change}
                      </span>
                    ) : (
                      <span className="text-red-600 text-sm font-semibold">
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Surveys */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Recent Employee Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Survey Title</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Responses</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Created Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSurveys.map((survey) => (
                    <tr key={survey.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-900">{survey.title}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">{survey.department}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          survey.status === 'Active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {survey.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">{survey.responses}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">{survey.created}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default memo(EmployeeSurveyDashboard);

