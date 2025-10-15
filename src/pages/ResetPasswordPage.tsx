import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@lib/supabase';
import { useToast } from '@/hooks/useToast';
import type { ResetPasswordFormRequest } from '@/types/auth';
import { ResetPasswordNewFormSchema } from '@/types/auth';
import LoginPage from '@pages/LoginPage';

export default function ResetPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  // temp solution by jhalak32
  const navigate = useNavigate();
  const { toast, presets } = useToast();

  const form = useForm<ResetPasswordFormRequest>({
    resolver: zodResolver(ResetPasswordNewFormSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          toast.error('Invalid Reset Link', {
            description: 'Invalid or expired reset link. Please request a new password reset.',
            duration: 5000,
          });
          setIsCheckingSession(false);
          return;
        }

        if (session) {
          setIsValidSession(true);
        } else {
          toast.error('Invalid Reset Link', {
            description: 'Invalid or expired reset link. Please request a new password reset.',
            duration: 5000,
          });
        }
      } catch (err) {
        toast.error('Error', {
          description: 'An error occurred. please try again.',
          duration: 4000,
        });
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = form.getValues();
    
    // Validate form
    const result = await form.trigger();
    if (!result) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) {
        form.setError('newPassword', {
          type: 'manual',
          message: error.message,
        });

        toast.error('Update Failed', {
          description: error.message,
          duration: 4000,
        });
      } else {
        presets.authSuccess('Password updated successfully! Redirecting to login...');
        form.reset();
        
        // Sign out to ensure user needs to login with new password
        await supabase.auth.signOut();

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/auth/login', { replace: true });
        }, 2000);
      }
    } catch (err) {
      const errorMessage = 'update failed. Please try again.';
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
  };

  const handleBackToDashboard = () => {
    navigate('/auth/login');
  };

  // Loading/Checking Session State
  if (isCheckingSession) {
    return (
      <div className="w-full min-h-screen relative overflow-hidden">
        
        <div className="absolute inset-0 w-full h-full">
          <LoginPage />
        </div>
        <div className="absolute inset-0 w-full h-full bg-black/50 backdrop-blur-sm" />

        
        <div className="relative z-10 w-full min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md p-8 bg-white rounded-2xl border border-[#E6E6E6] flex flex-col items-center gap-8 shadow-lg">
            <div className="self-stretch flex flex-col items-center gap-3">
              <h1 className="text-[#101828] text-[32px] sm:text-[36px] font-semibold font-outfit leading-[1.2] text-center">
                Verifying Reset Link
              </h1>
              <p className="text-[#667085] text-[14px] font-normal font-outfit leading-relaxed text-center">
                Please wait while we verify your password reset link...
              </p>
            </div>

            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161950]"></div>
            </div>

            <Button
              onClick={handleBackToDashboard}
              className="self-stretch h-[48px] px-5 py-3 bg-transparent border border-[#D0D5DD] rounded-lg text-[#344054] text-[15px] font-semibold font-outfit leading-tight hover:bg-gray-50 transition-all duration-200"
            >
              Back to Sign-in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Invalid Session State
  if (!isValidSession) {
    return (
      <div className="w-full min-h-screen relative overflow-hidden">
        
        <div className="absolute inset-0 w-full h-full">
          <LoginPage />
        </div>
        <div className="absolute inset-0 w-full h-full bg-black/50 backdrop-blur-sm" />

        
        <div className="relative z-10 w-full min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md p-8 bg-white rounded-2xl border border-[#E6E6E6] flex flex-col items-start gap-8 shadow-lg">
            <div className="self-stretch flex flex-col items-center gap-3">
              <h1 className="text-[#101828] text-[32px] sm:text-[36px] font-semibold font-outfit leading-[1.2] text-center">
                Invalid Reset Link
              </h1>
              <p className="text-[#667085] text-[14px] font-normal font-outfit leading-relaxed text-center">
                This password reset link is invalid or has expired. Please request a new password reset.
              </p>
            </div>

            <div className="self-stretch rounded-lg bg-[#FEF3F2] border border-[#FECDCA] px-4 py-3">
              <div className="text-[#F04438] text-sm font-outfit text-center">
                Reset link expired or invalid
              </div>
            </div>

            <Button
              onClick={handleBackToDashboard}
              className="self-stretch h-[48px] px-5 py-3 bg-[#161950] rounded-lg text-white text-[15px] font-semibold font-outfit leading-tight hover:bg-[#1E2B5B] hover:shadow-lg transition-all duration-200"
            >
              Back to Sign-in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative overflow-hidden">
      
      <div className="absolute inset-0 w-full h-full">
        <LoginPage />
      </div>
      <div className="absolute inset-0 w-full h-full bg-black/50 backdrop-blur-sm" />

      
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md p-8 sm:p-10 bg-white rounded-2xl border border-[#E6E6E6] flex flex-col items-start gap-8 shadow-xl">
          
          <div className="self-stretch flex flex-col items-start gap-3">
            <h1 className="self-stretch text-center text-[#101828] text-[32px] sm:text-[36px] font-semibold font-outfit leading-[1.2]">
              Reset Your Password
            </h1>
            <p className="self-stretch text-center text-[#667085] text-[14px] font-normal font-outfit leading-relaxed">
              Enter your e-mail address and we will send you a link to reset your password
            </p>
          </div>

          
          <form onSubmit={handleSubmit} className="self-stretch flex flex-col items-start gap-6">
            
            {form.formState.errors.root && (
              <div className="self-stretch rounded-lg bg-[#FEF3F2] border border-[#FECDCA] px-4 py-3">
                <div className="text-[#F04438] text-sm font-outfit">
                  {form.formState.errors.root.message}
                </div>
              </div>
            )}

            
            <div className="self-stretch flex flex-col items-start gap-2">
              <label className="text-[#344054] text-[14px] font-medium font-outfit leading-tight">
                New Password<span className="text-[#F04438]">*</span>
              </label>
              <Input
                type="password"
                {...form.register('newPassword')}
                placeholder="*********"
                className="self-stretch h-12 px-4 py-3 bg-white rounded-lg border border-[#D0D5DD] text-[#101828] placeholder:text-[#98A2B3] text-[15px] font-normal font-outfit focus-visible:ring-4 focus-visible:ring-[#465FFF1F] focus-visible:border-[#465FFF] focus-visible:outline-none focus-visible:shadow-sm hover:border-[#98A2B3] transition-all duration-200"
              />
              {form.formState.errors.newPassword && (
                <p className="text-[#F04438] text-sm font-outfit">
                  {form.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            
            <div className="self-stretch flex flex-col items-start gap-2">
              <label className="text-[#344054] text-[14px] font-medium font-outfit leading-tight">
                Confirm Password<span className="text-[#F04438]">*</span>
              </label>
              <Input
                type="password"
                {...form.register('confirmPassword')}
                placeholder="123456"
                className="self-stretch h-12 px-4 py-3 bg-white rounded-lg border border-[#D0D5DD] text-[#101828] placeholder:text-[#98A2B3] text-[15px] font-normal font-outfit focus-visible:ring-4 focus-visible:ring-[#465FFF1F] focus-visible:border-[#465FFF] focus-visible:outline-none focus-visible:shadow-sm hover:border-[#98A2B3] transition-all duration-200"
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-[#F04438] text-sm font-outfit">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            
            <p className="text-[#667085] text-sm font-normal font-outfit leading-tight">
              Min 8 character require
            </p>

            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="self-stretch h-[48px] px-5 py-3 bg-[#161950] rounded-lg text-white text-[15px] font-semibold font-outfit leading-tight hover:bg-[#1E2B5B] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
            >
              {isSubmitting ? 'Saving Password...' : 'Save Your Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
