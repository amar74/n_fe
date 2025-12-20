import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Package, 
  FolderKanban,
  FileText,
  Building2
} from 'lucide-react';

function NotFoundPage() {
  const navigate = useNavigate();

  const quickLinks = [
    {
      name: 'Opportunities',
      path: '/module/opportunities',
      icon: TrendingUp,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      name: 'Accounts',
      path: '/module/accounts',
      icon: Building2,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      iconColor: 'text-purple-500',
    },
    {
      name: 'Proposals',
      path: '/module/proposals',
      icon: FileText,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      iconColor: 'text-green-500',
    },
    {
      name: 'Resources',
      path: '/module/resources',
      icon: Package,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      iconColor: 'text-orange-500',
    },
    {
      name: 'Projects',
      path: '/module/projects',
      icon: FolderKanban,
      color: 'bg-pink-500',
      lightColor: 'bg-pink-50',
      iconColor: 'text-pink-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F3F2] flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full">
        <Card className="border-0 shadow-sm mb-6">
          <CardContent className="p-12 text-center">
            <div className="mb-6">
              <h1 className="text-8xl md:text-9xl font-bold text-gray-900 mb-3">404</h1>
              <div className="h-1 w-20 bg-gray-900 mx-auto"></div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Page Not Found
            </h2>
            <p className="text-base md:text-lg text-gray-600 mb-2 max-w-md mx-auto">
              Sorry, we couldn't find the page you're looking for.
            </p>
            <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
              The page you are trying to access doesn't exist or has been moved.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="flex items-center gap-2 px-6 py-2.5 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all font-semibold"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              
              <Button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white hover:bg-gray-800 transition-all font-semibold"
              >
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Quick Navigation
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Card
                  key={link.name}
                  className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => navigate(link.path)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 ${link.lightColor} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-6 w-6 ${link.iconColor}`} />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {link.name}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="border-0 shadow-sm bg-gray-50">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-600">
              Need help? Try navigating from the sidebar or return to the dashboard to access all features.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default memo(NotFoundPage);

