// @author piyush.7492
import { memo, useState, useEffect } from 'react';
import { ChevronDown, Sparkles, TrendingUp, Target, CheckCircle, Database, Search, Shield, Lightbulb, BarChart3 } from 'lucide-react';

type AIAnalysisProgressCardProps = {
  progress: number;
  isAnalyzing: boolean;
  opportunityName?: string;
  analysisSteps?: string[];
  currentStep?: string;
}

export const AIAnalysisProgressCard = memo(({ 
  progress, 
  isAnalyzing, 
  opportunityName = "Current Opportunity",
  analysisSteps = [
    "Data Collection & Validation",
    "Market Research & Trends",
    "Competitor Analysis",
    "Financial Viability Assessment",
    "Risk & Opportunity Mapping",
    "Strategic Recommendations"
  ],
  currentStep
}: AIAnalysisProgressCardProps) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const getProgressColor = (progress: number) => {
    if (progress < 16) return 'from-red-500 to-red-600';
    if (progress < 33) return 'from-orange-500 to-orange-600';
    if (progress < 50) return 'from-yellow-500 to-yellow-600';
    if (progress < 66) return 'from-blue-500 to-blue-600';
    if (progress < 83) return 'from-indigo-500 to-indigo-600';
    return 'from-green-500 to-green-600';
  };

  const getStepProgressColor = (index: number) => {
    const colors = [
      'from-red-500 to-red-600',
      'from-orange-500 to-orange-600', 
      'from-yellow-500 to-yellow-600',
      'from-blue-500 to-blue-600',
      'from-indigo-500 to-indigo-600',
      'from-green-500 to-green-600'
    ];
    return colors[index] || 'from-gray-500 to-gray-600';
  };

  const getStatusText = (progress: number) => {
    if (progress === 0) return 'Starting Analysis';
    if (progress < 16) return 'Collecting Data';
    if (progress < 33) return 'Researching Market';
    if (progress < 50) return 'Analyzing Competitors';
    if (progress < 66) return 'Assessing Finances';
    if (progress < 83) return 'Mapping Risks';
    if (progress < 100) return 'Generating Strategy';
    return 'Analysis Complete';
  };

  const getStatusIcon = (progress: number) => {
    if (progress === 100) return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <Sparkles className="w-5 h-5 text-[#4338CA] animate-pulse" />;
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case "Data Collection & Validation":
        return <Database className="w-4 h-4" />;
      case "Market Research & Trends":
        return <Search className="w-4 h-4" />;
      case "Competitor Analysis":
        return <Target className="w-4 h-4" />;
      case "Financial Viability Assessment":
        return <BarChart3 className="w-4 h-4" />;
      case "Risk & Opportunity Mapping":
        return <Shield className="w-4 h-4" />;
      case "Strategic Recommendations":
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full p-8 bg-white rounded-2xl border border-[#E5E7EB] shadow-lg">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#4338CA] to-[#3730A3] rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-[#111827] text-xl font-bold font-['Inter']">
                AI Analysis Progress
              </h3>
              <p className="text-[#6B7280] text-sm font-medium">
                {opportunityName}
              </p>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <ChevronDown className="w-5 h-5 text-[#6B7280]" />
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getStatusIcon(progress)}
            <span className="text-[#374151] font-semibold">
              {getStatusText(progress)}
            </span>
          </div>
          <div className="text-[#111827] text-2xl font-bold">
            {animatedProgress}%
          </div>
        </div>

        <div className="relative">
          <div className="w-full h-3 bg-[#F3F4F6] rounded-full overflow-hidden shadow-inner">
            <div 
              className={`h-full bg-gradient-to-r ${getProgressColor(progress)} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
              style={{ width: `${animatedProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </div>
          </div>
          
          <div className="flex justify-between mt-2">
            {analysisSteps.map((step, index) => {
              const stepThreshold = ((index + 1) / analysisSteps.length) * 100;
              const isCompleted = progress >= stepThreshold;
              const isCurrent = progress >= (index / analysisSteps.length) * 100 && progress < stepThreshold;
              const stepColor = isCompleted ? 'bg-green-500' : isCurrent ? 'bg-[#4338CA]' : 'bg-gray-300';
              
              return (
                <div key={index} className="flex flex-col items-center relative group">
                  <div className={`w-3 h-3 rounded-full ${stepColor} transition-all duration-300 cursor-pointer ${
                    isCurrent ? 'animate-pulse shadow-lg' : ''
                  }`}>
                    {isCompleted && (
                      <CheckCircle className="w-3 h-3 text-white -m-0.5" />
                    )}
                  </div>
                  <span className="text-xs text-[#6B7280] mt-1">{Math.round(stepThreshold)}%</span>
                  
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                      <div className="flex items-center gap-2">
                        <div className="text-gray-300">
                          {getStepIcon(step)}
                        </div>
                        <span className="font-medium">{step}</span>
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        {isCompleted ? '✓ Complete' : isCurrent ? 'In Progress' : 'Pending'}
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-3 text-center">
          <span className="text-xs text-gray-500">
            Hover over progress dots to see step details
          </span>
        </div>
      </div>

      {progress > 0 && (
        <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#111827]">{analysisSteps.length}</div>
              <div className="text-xs text-[#6B7280] uppercase tracking-wide">Steps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#4338CA]">{Math.round(progress * 0.8 + 1200)}ms</div>
              <div className="text-xs text-[#6B7280] uppercase tracking-wide">Processing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Math.round(progress * 0.9 + 85)}%</div>
              <div className="text-xs text-[#6B7280] uppercase tracking-wide">Confidence</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

AIAnalysisProgressCard.displayName = 'AIAnalysisProgressCard';
