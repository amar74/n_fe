import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Sparkles, Bell, ChevronDown } from 'lucide-react';
import { AddressForm } from './components/AddressForm/AddressForm';
import { ContactForm } from './components/ContactForm/ContactForm';
import { useCreateOrganizationPage } from './useCreateOrganizationPage';
import { memo } from 'react';

function CreateOrganizationPage() {
  const {
    form,
    control,
    errors,
    websiteValue,
    isSubmitting,
    isAnalyzing,
    showAISuggestions,
    aiSuggestions,
    appliedSuggestions,
    user,
    isAuthLoading,
    isAuthenticated,
    handleSubmit,
    handleWebsiteChange,
    handleSignOut,
    applySuggestion,
  } = useCreateOrganizationPage();

  // Show loading during auth initialization to prevent flicker
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D3C8B]"></div>
          <p className="text-gray-600 text-sm font-inter">Initializing...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (shouldn't happen, but safety check)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D3C8B]"></div>
          <p className="text-gray-600 text-sm font-inter">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-inter">
      
      <header className="w-full border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            
            <div className="w-11 h-11 relative bg-gray-200 rounded-xl flex items-center justify-center">
              <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative">
                <g clipPath="url(#clip0_869_8336)">
                  <path d="M7.08764 6.87988H6.05859V7.94044H7.08764V6.87988Z" fill="#0B1451"/>
                  <path d="M5.8104 10.9994L1.53752 15.4031C0.24615 12.6261 0.249671 9.36911 1.53752 6.5957L5.8104 10.9994Z" fill="#4C4C4C"/>
                  <path d="M10.4816 6.18488L5.80999 10.9996L1.53711 6.59585C2.00894 5.57703 2.6533 4.62353 3.47284 3.7789C4.29239 2.93427 5.2202 2.26746 6.20876 1.78027L10.4816 6.18397V6.18488Z" fill="#0F0901"/>
                  <path d="M10.4816 15.8147L6.20876 20.2184C5.2202 19.7321 4.29239 19.0644 3.47285 18.2206C2.6533 17.376 2.00894 16.4225 1.53711 15.4037L5.80999 11L10.4816 15.8147Z" fill="#0F0901"/>
                  <path d="M16.6866 8.7136C15.411 9.61109 14.2324 9.61109 12.6576 8.7136L10 5.89244L14.2729 1.57097C15.2614 2.05721 16.1857 2.7214 17.0053 3.56597C17.8248 4.41055 18.4718 5.3669 18.9445 6.38565L16.6857 8.7136C16.6857 8.7136 17.9622 7.81611 16.6866 8.7136Z" fill="#0F0901"/>
                  <path d="M17.1671 13.0755C15.8915 12.1779 14.7129 12.1779 13.138 13.0755L10.4805 15.8144L14.7533 20.2181C15.7419 19.7318 16.6662 19.0677 17.4857 18.2231C18.3053 17.3785 18.9523 16.4222 19.425 15.4034L17.1662 13.0755C17.1662 13.0755 18.4427 13.973 17.1671 13.0755Z" fill="#0F0901"/>
                  <path d="M14.7547 1.78062L10.3923 6.28516L6.20898 1.78062C8.90704 0.453337 12.0637 0.453337 14.7547 1.78062Z" fill="#4C4C4C"/>
                  <path d="M14.7547 20.2182C12.0637 21.5454 8.90616 21.5454 6.20898 20.2182L10.4819 15.8145L14.7547 20.2182Z" fill="#4C4C4C"/>
                </g>
                <defs>
                  <clipPath id="clip0_869_8336">
                    <rect width="18.8571" height="20.4286" fill="white" transform="translate(0.570312 0.785156)"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
            
            
            <div className="flex flex-col leading-tight">
              <div className="text-[#0F0901] text-base font-semibold font-poppins">Megapolis</div>
              <div className="text-stone-400 text-base font-medium font-poppins">Advisory</div>
            </div>
          </div>

          
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-900">{user?.email?.split('@')[0] || 'User'}</span>
                <span className="text-xs text-gray-500">{user?.email || ''}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600 hidden md:block" />
            </div>
          </div>
        </div>
      </header>

      
      <main className="flex-1 w-full bg-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          
          <div className="flex items-center gap-2 text-sm mb-8 font-poppins">
            <span className="text-gray-600 hover:text-gray-900 cursor-pointer transition-colors">Sign-in</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Create Organization</span>
          </div>

          
          <div className="text-center mb-12 flex flex-col items-center justify-center">
            <h1 className="text-[36px] font-bold text-gray-900 mb-4 font-inter tracking-tight">
              Create Your Organization
            </h1>
            <p className="text-gray-600 text-[16px] mx-auto font-poppins leading-relaxed text-center">
              Set up your organization to get started with the platform, You need an organization to access all features and collaborate with your team.
            </p>
          </div>

          
          <div className="max-w-4xl mx-auto bg-white rounded-[20px] p-10 border border-gray-200 shadow-sm">
            <Form {...form}>
              <form onSubmit={handleSubmit} className="space-y-7">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <FormField
                  control={control}
                  name="website"
                  render={({ field }) => (
                    <FormItem className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <FormLabel className="text-[13px] font-medium text-gray-900 font-poppins">
                          Company Website*
                        </FormLabel>
                        <Badge className="bg-[#4361EE] hover:bg-[#3651DE] text-white text-[10px] px-2.5 py-0.5 rounded-md flex items-center gap-1 font-poppins font-medium">
                          <Sparkles className="h-3 w-3" /> AI Enhanced
                        </Badge>
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          type="url"
                          placeholder="https://your-company.com"
                          className={`h-12 border-gray-300 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 font-poppins text-[14px] placeholder:text-gray-400 ${
                            isAnalyzing ? 'bg-blue-50 border-blue-300' : 
                            showAISuggestions ? 'bg-green-50 border-green-300' : ''
                          }`}
                          onChange={(e) => handleWebsiteChange(e.target.value)}
                          disabled={isSubmitting || isAnalyzing}
                        />
                      </FormControl>
                      <FormMessage className="text-xs font-poppins" />
                      {isAnalyzing && (
                        <div className="flex items-center gap-2 text-xs text-blue-600 font-poppins">
                          <Sparkles className="h-3 w-3 animate-pulse" />
                          <span>AI analyzing website...</span>
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-2.5">
                      <FormLabel className="text-[13px] font-medium text-gray-900 font-poppins">
                        Organization Name*
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Megapolis"
                          className={`h-12 border-gray-300 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 font-poppins text-[14px] placeholder:text-gray-400 ${
                            showAISuggestions && field.value ? 'bg-blue-50 border-blue-300' : ''
                          }`}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage className="text-xs font-poppins" />
                    </FormItem>
                  )}
                />
              </div>

              
              <AddressForm 
                isSubmitting={isSubmitting}
                showAISuggestions={showAISuggestions}
              />

              
              <ContactForm
                control={control}
                isSubmitting={isSubmitting}
                userEmail={user?.email}
              />

              
              {showAISuggestions && aiSuggestions && aiSuggestions.suggestions && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-purple-900 font-inter">AI Suggestions</h3>
                        <p className="text-sm text-purple-700 font-poppins">
                          Found {Object.keys(aiSuggestions.suggestions || {}).length} suggestions 
                          ({appliedSuggestions.length} auto-applied)
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        // Hide suggestions panel
                        const event = new CustomEvent('hideAISuggestions');
                        window.dispatchEvent(event);
                      }}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium font-poppins"
                    >
                      Hide
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(aiSuggestions.suggestions || {}).map(([field, suggestion]: [string, any]) => (
                      <div
                        key={field}
                        className={`p-4 rounded-lg border-2 ${
                          appliedSuggestions.includes(field)
                            ? 'bg-green-50 border-green-200'
                            : 'bg-white border-purple-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 capitalize font-poppins">
                              {field.replace('_', ' ').replace('company_name', 'Organization Name')}
                            </span>
                            {suggestion.confidence !== undefined && (
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                suggestion.confidence >= 0.9 ? 'bg-green-100 text-green-800' :
                                suggestion.confidence >= 0.7 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {(suggestion.confidence * 100).toFixed(0)}%
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              applySuggestion(field, suggestion.value);
                              // Update applied suggestions state
                              if (!appliedSuggestions.includes(field)) {
                                const event = new CustomEvent('applySuggestion', { 
                                  detail: { field, suggestion } 
                                });
                                window.dispatchEvent(event);
                              }
                            }}
                            disabled={appliedSuggestions.includes(field)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all font-poppins ${
                              appliedSuggestions.includes(field)
                                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                                : 'bg-purple-600 text-white hover:bg-purple-700'
                            }`}
                          >
                            {appliedSuggestions.includes(field) ? 'Applied' : 'Apply'}
                          </button>
                        </div>

                        <div className="text-sm text-gray-700 mb-2 font-poppins">
                          {typeof suggestion.value === 'object' && suggestion.value !== null ? (
                            <div className="space-y-1">
                              {Object.entries(suggestion.value || {}).map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-medium">{key}:</span> {String(value)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            suggestion.value || 'N/A'
                          )}
                        </div>

                        {suggestion.reasoning && (
                          <p className="text-xs text-gray-600 italic font-poppins">
                            {suggestion.reasoning}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {aiSuggestions.warnings && aiSuggestions.warnings.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2 font-poppins">Warnings:</h4>
                      <ul className="text-xs text-yellow-700 space-y-1 font-poppins">
                        {aiSuggestions.warnings.map((warning: string, index: number) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  type="button"
                  variant="outline" 
                  className="flex-1 h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-poppins font-medium text-[14px] rounded-lg transition-colors"
                  onClick={handleSignOut}
                  disabled={isSubmitting}
                >
                  Back to Sign-in
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 h-12 bg-[#2B3674] hover:bg-[#1f2855] text-white font-poppins font-medium text-[14px] rounded-lg shadow-sm transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Organization'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
        </div>
      </main>
    </div>
  );
}

export default memo(CreateOrganizationPage);
