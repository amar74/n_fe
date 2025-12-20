import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Users,
  Calendar,
  Plus,
  Eye,
  MessageSquare
} from 'lucide-react';

function AccountSurveyDashboard() {
  // Mock data - replace with actual API calls later
  const stats = [
    {
      title: 'Total Surveys',
      value: '24',
      change: '+12%',
      trend: 'up',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Surveys',
      value: '8',
      change: '+5%',
      trend: 'up',
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Response Rate',
      value: '78%',
      change: '+8%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Responses',
      value: '1,234',
      change: '+23%',
      trend: 'up',
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const recentSurveys = [
    {
      id: 1,
      title: 'Q4 Client Satisfaction Survey',
      account: 'Acme Corp',
      status: 'Active',
      responses: 45,
      created: '2024-10-15',
    },
    {
      id: 2,
      title: 'Product Feedback Survey',
      account: 'TechStart Inc',
      status: 'Active',
      responses: 32,
      created: '2024-10-20',
    },
    {
      id: 3,
      title: 'Service Quality Assessment',
      account: 'Global Solutions',
      status: 'Completed',
      responses: 67,
      created: '2024-10-10',
    },
    {
      id: 4,
      title: 'Annual Partnership Review',
      account: 'Enterprise LLC',
      status: 'Active',
      responses: 23,
      created: '2024-10-25',
    },
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Account Survey Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Manage and track surveys sent to your client accounts
              </p>
            </div>
            <Button className="flex items-center gap-2 bg-black text-white hover:bg-gray-800">
              <Plus className="h-4 w-4" />
              Create New Survey
            </Button>
          </div>
        </div>

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

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Recent Account Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Survey Title</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Account</th>
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
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">{survey.account}</span>
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
                          <Users className="h-4 w-4 text-gray-500" />
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

export default memo(AccountSurveyDashboard);

