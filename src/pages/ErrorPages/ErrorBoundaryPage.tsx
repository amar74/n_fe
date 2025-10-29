import { memo } from 'react';
import { useNavigate, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  ArrowLeft, 
  AlertTriangle, 
  RefreshCw,
  TrendingUp,
  Building2,
  Package,
  FolderKanban
} from 'lucide-react';

function ErrorBoundaryPage() {
  const navigate = useNavigate();
  const error = useRouteError();
  
  let errorMessage = 'An unexpected error occurred';
  let errorDetails = 'Something went wrong while processing your request.';
  let statusCode = 500;

  // Handle different error types
  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    errorMessage = error.statusText || errorMessage;
    errorDetails = error.data?.message || errorDetails;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = error.stack?.split('\n')[0] || errorDetails;
  }

  const handleRefresh = () => {
    window.location.reload();
  };

  const isDevelopment = import.meta.env.DEV;

  const quickLinks = [
    { name: 'Opportunities', path: '/module/opportunities', icon: TrendingUp, color: 'text-blue-500' },
    { name: 'Accounts', path: '/module/accounts', icon: Building2, color: 'text-purple-500' },
    { name: 'Resources', path: '/module/resources', icon: Package, color: 'text-orange-500' },
    { name: 'Projects', path: '/module/projects', icon: FolderKanban, color: 'text-pink-500' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F3F2] flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full">
        {/* Main Error Card */}
        <Card className="border-0 shadow-sm mb-6">
          <CardContent className="p-8 md:p-12">
            {/* Error Icon and Code */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-2">{statusCode}</h1>
              <div className="h-1 w-20 bg-red-600 mx-auto"></div>
            </div>

            {/* Error Message */}
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                Oops! Something went wrong
              </h2>
              <p className="text-base md:text-lg text-gray-700 mb-2 font-medium">
                {errorMessage}
              </p>
              <p className="text-sm text-gray-600 max-w-xl mx-auto">
                {errorDetails}
              </p>
            </div>

            {/* Development Mode - Show Full Error */}
            {isDevelopment && error instanceof Error && (
              <details className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <summary className="cursor-pointer text-sm font-semibold text-gray-700 mb-2">
                  🔧 Developer Details (Development Mode)
                </summary>
                <pre className="text-xs text-gray-800 overflow-x-auto whitespace-pre-wrap mt-2 p-3 bg-white rounded border border-gray-200 max-h-64">
                  {error.stack || error.message}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleRefresh}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white hover:bg-gray-800 transition-all font-semibold"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Page
              </Button>
              
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="flex items-center justify-center gap-2 px-6 py-2.5 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all font-semibold"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="flex items-center justify-center gap-2 px-6 py-2.5 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all font-semibold"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              What can you do?
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-gray-900 font-bold mt-0.5">•</span>
                <span>Try refreshing the page to see if the issue resolves</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900 font-bold mt-0.5">•</span>
                <span>Go back to the previous page and try again</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900 font-bold mt-0.5">•</span>
                <span>Return to the dashboard and navigate from there</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900 font-bold mt-0.5">•</span>
                <span>If the problem persists, please contact support</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="border-0 shadow-sm bg-gray-50">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-700 mb-3 text-center">
              Quick navigation:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.name}
                    onClick={() => navigate(link.path)}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200"
                  >
                    <Icon className={`h-4 w-4 ${link.color}`} />
                    {link.name}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default memo(ErrorBoundaryPage);

