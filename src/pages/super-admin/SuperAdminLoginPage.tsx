import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/services/api/client';
import LogoIcon from '@assets/Asset 2 1.svg';
import VectorGrid1 from '@assets/Vector.svg';
import VectorGrid2 from '@assets/Vector-1.svg';

// @abhishek.softication - refactor needed
const SuperAdminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type SuperAdminLoginFormData = z.infer<typeof SuperAdminLoginSchema>;

interface SuperAdminLoginResponse {
  message: string;
  token: string;
  expire_at: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export default function SuperAdminLoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<SuperAdminLoginFormData>({
    resolver: zodResolver(SuperAdminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    mode: 'onBlur',
  });

  const onSubmit = form.handleSubmit(async (data: SuperAdminLoginFormData) => {
    setIsSubmitting(true);
    form.clearErrors();

    try {
      const response = await apiClient.post<SuperAdminLoginResponse>('/super-admin/login', {
        email: data.email,
        password: data.password,
      });

      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userRole', 'super_admin');
      localStorage.setItem('userEmail', response.data.user.email);

      if (data.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Redirect to Super Admin dashboard
      setTimeout(() => {
        navigate('/super-admin/dashboard', { replace: true });
      }, 500);
    } catch (err: any) {
      const errorMessage = error.response?.data?.detail || 'Invalid credentials';
      
      form.setError('email', {
        type: 'manual',
        message: errorMessage,
      });
      form.setError('password', {
        type: 'manual',
        message: errorMessage,
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

          
          <div className="w-full max-w-[440px] sm:max-w-[480px] lg:w-[460px] xl:w-[480px] p-8 sm:p-10 lg:p-12 rounded-2xl border-2 border-[#7C3AED] border-opacity-30 bg-white flex flex-col justify-start items-start gap-8 shadow-[0_4px_6px_-1px_rgba(124,58,237,0.1),0_2px_4px_-1px_rgba(124,58,237,0.06)] hover:shadow-[0_10px_15px_-3px_rgba(124,58,237,0.15),0_4px_6px_-2px_rgba(124,58,237,0.1)] transition-shadow duration-300">
            
            <div className="self-stretch flex flex-col justify-start items-start gap-3">
              <div className="flex items-center gap-3">
                <h1 className="text-[#101828] text-[32px] sm:text-[36px] font-semibold font-outfit leading-[1.2]">Super Admin</h1>
                <span className="px-3 py-1 bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white text-xs font-semibold rounded-full">ADMIN</span>
              </div>
              <p className="text-[#667085] text-[14px] font-normal font-outfit leading-relaxed">
                Access the Super Admin Dashboard with elevated privileges
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
                          placeholder="superadmin@megapolis.com"
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
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter admin password"
                          className="self-stretch h-12 px-4 py-3 bg-white rounded-lg border border-[#D0D5DD] text-[#101828] placeholder:text-[#98A2B3] text-[15px] font-normal font-outfit focus-visible:ring-4 focus-visible:ring-[#465FFF1F] focus-visible:border-[#465FFF] focus-visible:outline-none focus-visible:shadow-sm hover:border-[#98A2B3] transition-all duration-200"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-[#F04438] font-outfit" />
                    </FormItem>
                  )}
                />

                
                <div className="self-stretch flex justify-start items-center">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex justify-start items-center gap-2.5 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="w-5 h-5 rounded-md border-2 border-[#D0D5DD] data-[state=checked]:bg-[#7C3AED] data-[state=checked]:border-[#7C3AED]"
                          />
                        </FormControl>
                        <FormLabel className="text-[#344054] text-sm font-normal font-outfit leading-tight cursor-pointer select-none">
                          Keep me logged in
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                
                {form.formState.errors.root && (
                  <div className="text-[#F04438] text-sm text-center self-stretch bg-[#FEF3F2] border border-[#FECDCA] rounded-lg px-4 py-3 font-outfit">
                    {form.formState.errors.root.message}
                  </div>
                )}

                
                <Button
                  type="submit"
                  className="self-stretch h-[48px] px-5 py-3 bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] rounded-lg text-white text-[15px] font-semibold font-outfit leading-tight hover:from-[#6D28D9] hover:to-[#4338CA] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Authenticating...' : 'Access Admin Portal'}
                </Button>

                
                <div className="self-stretch flex items-center justify-center gap-2 px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 1.33334L3.33333 3.33334V7.33334C3.33333 10.6 5.66667 13.7333 8 14.6667C10.3333 13.7333 12.6667 10.6 12.6667 7.33334V3.33334L8 1.33334Z" fill="#7C3AED" fillOpacity="0.2" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.66667 8L7.66667 9L10 6.66667" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[#667085] text-xs font-medium font-outfit">Secure Admin Authentication</span>
                </div>
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

        
        <div className="relative z-10 inline-flex flex-col justify-start items-center gap-8 px-8">
          
          <div className="inline-flex justify-start items-center gap-5">
            <img src={LogoIcon} alt="Megapolis Logo" className="w-[88px] h-[88px]" />
            <div className="inline-flex flex-col justify-center items-start">
              <h2 className="text-white text-4xl font-semibold font-poppins">Megapolis</h2>
              <p className="text-[#ABA4A1] text-xl font-medium font-poppins">Advisory</p>
            </div>
          </div>
          
          
          <div className="w-full h-[1px] bg-white bg-opacity-20"></div>
          
          
          <div className="inline-flex flex-col items-center gap-4">
            
            
            <p className="text-center text-white text-opacity-80 text-base font-normal font-outfit leading-relaxed max-w-md">
              Complete system control with elevated privileges for managing vendors, users, and platform operations
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
