import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { LoginCredentials, LoginFormData } from '@/types/auth';
import { LoginFormSchema } from '@/types/auth';
import { useToast } from '@/hooks/useToast';
import { STORAGE_CONSTANTS } from '@/constants/storageConstants';
import { Eye, EyeOff } from 'lucide-react';
import LogoIcon from '@assets/Asset 2 1.svg';
import VectorGrid1 from '@assets/Vector.svg';
import VectorGrid2 from '@assets/Vector-1.svg';

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast, presets } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    mode: 'onBlur', // Validate on blur for better UX
  });

  const onSubmit = form.handleSubmit(async (data: LoginFormData) => {
    setIsSubmitting(true);

    form.clearErrors();

    try {
      const credentials: LoginCredentials = {
        email: data.email,
        password: data.password,
      };

      const { data: authResponse, error } = await signIn(credentials.email, credentials.password);

      if (error) {

        const isInvalidCredentials =
          error.message.toLowerCase().includes('invalid') ||
          error.message.toLowerCase().includes('credentials') ||
          error.message.toLowerCase().includes('password') ||
          error.message.toLowerCase().includes('email');

        if (isInvalidCredentials) {
          // Highlight both email and password fields for invalid credentials
          form.setError('email', {
            type: 'manual',
            message: 'Invalid credentials',
          });
          form.setError('password', {
            type: 'manual',
            message: 'Invalid credentials',
          });

          // Show error toast using global toast service
          presets.authError();
        } else {
          // For other errors, just highlight email field
          form.setError('email', {
            type: 'manual',
            message: error.message,
          });

          toast.error('Sign In Failed', {
            description: error.message,
            duration: 4000,
          });
        }
      } else {
        if (data.rememberMe) {
          localStorage.setItem(STORAGE_CONSTANTS.REMEMBER_ME, 'true');
        }

        presets.authSuccess('Welcome back!');

        // Navigate based on fresh response data (not state) to avoid race conditions
        // Use setTimeout to show toast before navigation
        setTimeout(() => {
          if (authResponse?.user) {
            // Check org_id from the fresh API response
            // Handle both null and undefined (backend may not include the field)
            if (!authResponse.user.org_id) {
              console.log('[LoginPage] User has no org_id (from API response), redirecting to create organization');
              navigate('/organization/create', { replace: true });
            } else {
              console.log('[LoginPage] User has org_id (from API response), redirecting to dashboard');
              navigate('/', { replace: true });
            }
          } else {
            // Fallback if no user data in response
            console.log('[LoginPage] No user data in response, redirecting to dashboard');
            navigate('/', { replace: true });
          }
        }, 500);
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.';

      form.setError('root', {
        type: 'manual',
        message: errorMessage,
      });

      toast.error('Error', {
        description: errorMessage,
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="w-full min-h-screen relative bg-white flex flex-col lg:flex-row">
      
      <div className="flex-1 relative min-h-screen flex items-center justify-center px-4 py-20 sm:py-24 lg:py-0 lg:px-0">
        
        <div className="w-full max-w-[650px] lg:max-w-none lg:w-auto relative flex flex-col items-center lg:items-start justify-center lg:pl-[156px] lg:pr-16 xl:pr-20">
          
          <button
            onClick={() => navigate('/')}
            className="absolute top-[-60px] left-0 sm:top-[-80px] lg:top-[-94px] lg:left-[156px] inline-flex justify-start items-center gap-1.5 z-10 transition-all duration-200 hover:opacity-70 hover:gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.7083 5L7.5 10.2083L12.7083 15.4167" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">Back to dashboard</span>
          </button>

          
          <div className="w-full max-w-[440px] sm:max-w-[480px] lg:w-[460px] xl:w-[480px] p-8 sm:p-10 lg:p-12 rounded-2xl border border-[#E6E6E6] bg-white flex flex-col justify-start items-start gap-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] transition-shadow duration-300">
            
            <div className="self-stretch flex flex-col justify-start items-start gap-3">
              <h1 className="text-[#101828] text-[32px] sm:text-[36px] font-semibold font-outfit leading-[1.2]">Sign In</h1>
              <p className="text-[#667085] text-[14px] font-normal font-outfit leading-relaxed">
                Enter your email and password to sign in!
              </p>
            </div>

            
            <Form {...form}>
              <form onSubmit={onSubmit} className="self-stretch flex flex-col justify-start items-start gap-6">
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="self-stretch flex flex-col justify-start items-start gap-2">
                      <FormLabel className="text-[#344054] text-[14px] font-medium font-outfit leading-tight">
                        Email address<span className="text-[#F04438]">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter your email"
                          autoComplete="off"
                          className="self-stretch h-12 px-4 py-3 bg-white rounded-lg border border-[#D0D5DD] text-[#101828] placeholder:text-[#98A2B3] text-[15px] font-normal font-outfit focus-visible:ring-4 focus-visible:ring-[#465FFF1F] focus-visible:border-[#465FFF] focus-visible:outline-none focus-visible:shadow-sm hover:border-[#98A2B3] transition-all duration-200"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-[#F04438] font-outfit" />
                    </FormItem>
                  )}
                />

                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="self-stretch flex flex-col justify-start items-start gap-2">
                      <FormLabel className="text-[#344054] text-[14px] font-medium font-outfit leading-tight">
                        Password<span className="text-[#F04438]">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="self-stretch h-12 px-4 py-3 pr-12 bg-white rounded-lg border border-[#D0D5DD] text-[#101828] placeholder:text-[#98A2B3] text-[15px] font-normal font-outfit focus-visible:ring-4 focus-visible:ring-[#465FFF1F] focus-visible:border-[#465FFF] focus-visible:outline-none focus-visible:shadow-sm hover:border-[#98A2B3] transition-all duration-200"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#344054] transition-colors"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-[#F04438] font-outfit" />
                    </FormItem>
                  )}
                />

                
                <div className="self-stretch flex justify-between items-center">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex justify-start items-center gap-2.5 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="w-5 h-5 rounded-md border-2 border-[#D0D5DD] data-[state=checked]:bg-[#465FFF] data-[state=checked]:border-[#465FFF]"
                          />
                        </FormControl>
                        <FormLabel className="text-[#344054] text-sm font-normal font-outfit leading-tight cursor-pointer select-none">
                          Keep me logged in
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-[#465FFF] text-sm font-normal font-outfit leading-tight hover:underline hover:text-[#3451E6] transition-all duration-200"
                  >
                    Forgot password?
                  </button>
                </div>

                
                {form.formState.errors.root && (
                  <div className="text-[#F04438] text-sm text-center self-stretch bg-[#FEF3F2] border border-[#FECDCA] rounded-lg px-4 py-3 font-outfit">
                    {form.formState.errors.root.message}
                  </div>
                )}

                
                <Button
                  type="submit"
                  className="self-stretch h-[48px] px-5 py-3 bg-[#161950] rounded-lg text-white text-[15px] font-semibold font-outfit leading-tight hover:bg-[#1E2B5B] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>

                
                <p className="self-stretch text-center text-sm font-normal font-outfit leading-tight">
                  <span className="text-[#667085]">Don't have an account? </span>
                  <button
                    type="button"
                    onClick={() => navigate('/contact')}
                    className="text-[#465FFF] font-semibold hover:underline hover:text-[#3451E6] transition-all duration-200"
                  >
                    Contact Us
                  </button>
                </p>
              </form>
            </Form>
          </div>
        </div>
      </div>

      
      <div className="hidden lg:flex lg:w-[50%] flex-shrink-0 relative items-center justify-center overflow-hidden min-h-screen">
        
        <div className="absolute inset-0 w-full h-full">
          <svg width="100%" height="100%" viewBox="0 0 700 800" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 -3.98999H702.062V800H108C48.3532 800 0 751.647 0 692V-3.98999Z" fill="#161950"/>
          </svg>
        </div>
        
        
        <img 
          src={VectorGrid1} 
          alt="" 
          className="absolute left-[38%] top-0 w-[432px] h-[249px] opacity-30 pointer-events-none"
        />
        <img 
          src={VectorGrid2} 
          alt="" 
          className="absolute left-[2%] bottom-[68px] w-[450px] h-[255px] opacity-30 pointer-events-none"
        />
        
        
        <svg 
          width="52" 
          height="53" 
          viewBox="0 0 52 53" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="absolute right-[60px] top-[40px]"
        >
          <path d="M51.2021 0.338379L0.660065 0.338374L0.66006 52.1939C28.5737 52.1939 51.2021 29.5654 51.2021 1.65178L51.2021 0.338379Z" fill="white" fillOpacity="0.08"/>
        </svg>
        <svg 
          width="52" 
          height="53" 
          viewBox="0 0 52 53" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="absolute right-[120px] top-[100px]"
        >
          <path d="M51.1538 0.70166L0.609253 0.701656L0.609248 52.5575C28.5242 52.5575 51.1538 29.9279 51.1538 2.01293L51.1538 0.70166Z" fill="white" fillOpacity="0.08"/>
        </svg>

        
        <svg 
          width="52" 
          height="53" 
          viewBox="0 0 52 53" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-[120px] bottom-[100px]"
        >
          <path d="M0.735352 52.6519L51.2774 52.6519L51.2774 0.796326C23.3638 0.796326 0.735352 23.4248 0.735352 51.3385L0.735352 52.6519Z" fill="white" fillOpacity="0.08"/>
        </svg>
        <svg 
          width="52" 
          height="53" 
          viewBox="0 0 52 53" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-[180px] bottom-[160px]"
        >
          <path d="M0.783691 52.2883L51.3282 52.2883L51.3282 0.432526C23.4133 0.432526 0.783691 23.0621 0.783691 50.9771L0.783691 52.2883Z" fill="white" fillOpacity="0.08"/>
        </svg>

        
        <div className="relative z-10 inline-flex flex-col justify-start items-center gap-6">
          <div className="inline-flex justify-start items-center gap-5">
            <img src={LogoIcon} alt="Megapolis Logo" className="w-[88px] h-[88px]" />
            <div className="inline-flex flex-col justify-center items-start">
              <h2 className="text-white text-4xl font-semibold font-poppins" style={{ color: '#ffffff' }}>Megapolis</h2>
              <p className="text-white text-xl font-medium font-poppins" style={{ color: '#ffffff' }}>Advisory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
