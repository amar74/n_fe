import { memo } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Link } from 'react-router-dom';

type ErrorPageProps = {
  title?: string;
  message?: string;
  error?: Error;
  showRetry?: boolean;
  onRetry?: () => void;
}

export const ErrorPage = memo(({ 
  title = "Unexpected Application Error!",
  message = "Something went wrong while loading this page.",
  error,
  showRetry = true,
  onRetry
}: ErrorPageProps) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-[#FEE2E2] to-[#FECACA] rounded-full flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-12 h-12 text-[#DC2626]" />
          </div>
        </div>

        
        <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] p-8 text-center">
          
          <h1 className="text-3xl font-bold text-[#111827] mb-4 font-['Inter']">
            {title}
          </h1>

          
          <p className="text-lg text-[#6B7280] mb-8 font-['Inter'] leading-relaxed">
            {message}
          </p>

          
          {error && (
            <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-6 mb-8 text-left">
              <div className="flex items-center gap-2 mb-3">
                <Bug className="w-5 h-5 text-[#6B7280]" />
                <span className="text-sm font-semibold text-[#374151] uppercase tracking-wide">
                  Error Details
                </span>
              </div>
              <div className="bg-[#1F2937] rounded-lg p-4 overflow-x-auto">
                <code className="text-[#F3F4F6] text-sm font-mono leading-relaxed">
                  {error.message || 'Unknown error occurred'}
                </code>
              </div>
              {error.stack && (
                <details className="mt-4">
                  <summary className="text-sm text-[#6B7280] cursor-pointer hover:text-[#374151] transition-colors">
                    View Stack Trace
                  </summary>
                  <div className="mt-2 bg-[#1F2937] rounded-lg p-4 overflow-x-auto max-h-40 overflow-y-auto">
                    <code className="text-[#F3F4F6] text-xs font-mono leading-relaxed whitespace-pre">
                      {error.stack}
                    </code>
                  </div>
                </details>
              )}
            </div>
          )}

          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {showRetry && (
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-[#4338CA] text-white rounded-xl font-semibold hover:bg-[#3730A3] hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
            )}
            
            <Link
              to="/"
              className="px-6 py-3 bg-white text-[#374151] rounded-xl font-semibold border border-[#D1D5DB] hover:bg-[#F9FAFB] hover:border-[#9CA3AF] hover:scale-105 transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>
          </div>

          
          <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
            <p className="text-sm text-[#6B7280] font-['Inter']">
              If this problem persists, please contact our support team or check our{' '}
              <a 
                href="#" 
                className="text-[#4338CA] hover:text-[#3730A3] font-semibold transition-colors"
              >
                status page
              </a>
              {' '}for updates.
            </p>
          </div>
        </div>

        
        <div className="text-center mt-8">
          <p className="text-sm text-[#9CA3AF] font-['Inter']">
            Error ID: {Date.now().toString(36).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
});

ErrorPage.displayName = 'ErrorPage';