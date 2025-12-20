import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { apiClient } from '@/services/api/client';
import { useToast } from '@/hooks/shared';
import { Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react';

const ResetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);

  // Get email from navigation state (passed from ForgotPasswordPage)
  const emailFromState = (location.state as any)?.email || '';

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      email: emailFromState,
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = form.handleSubmit(async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    form.clearErrors();

    try {
      await apiClient.post('/auth/reset-password', {
        email: data.email,
        otp: data.otp,
        new_password: data.newPassword,
      });

      setPasswordReset(true);
      
      toast.success('Success', {
        description: 'Your password has been reset successfully!',
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);

    } catch (error: any) {
      console.error('Reset password error:', error);
      
      const errorMessage = error.response?.data?.detail || 'Failed to reset password';
      
      toast.error('Error', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleResendOtp = async () => {
    const emailValue = form.getValues('email');

    if (!emailValue) {
      form.setError('email', {
        type: 'manual',
        message: 'Enter your email to resend the OTP',
      });
      return;
    }

    setIsResending(true);
    form.clearErrors('otp');

    try {
      await apiClient.post('/auth/forgot-password', { email: emailValue });
      toast.success('OTP Sent', {
        description: 'A new 6-digit OTP has been emailed to you.',
      });
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      const errorMessage =
        error.response?.data?.detail ||
        'Unable to resend OTP. Please try again.';
      toast.error('Error', { description: errorMessage });
    } finally {
      setIsResending(false);
    }
  };

  // Success state
  if (passwordReset) {
    return (
      <div className="w-full min-h-screen relative bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-[480px] p-12 rounded-2xl border border-[#E6E6E6] bg-white flex flex-col items-center gap-6 shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          
          <div className="text-center space-y-3">
            <h1 className="text-[#101828] text-[32px] font-semibold font-outfit">Password Reset Complete!</h1>
            <p className="text-[#667085] text-[15px] font-normal font-outfit leading-relaxed">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
          </div>

          <p className="text-sm text-[#667085] font-outfit">
            Redirecting to sign in page...
          </p>

          <Button
            onClick={() => navigate('/auth/login')}
            className="w-full bg-[#161950] hover:bg-[#1E2B5B]"
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="w-full min-h-screen relative bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-[480px] p-12 rounded-2xl border border-[#E6E6E6] bg-white flex flex-col gap-8 shadow-lg">
        <button
          onClick={() => navigate('/forgot-password')}
          className="inline-flex justify-start items-center gap-1.5 transition-all duration-200 hover:opacity-70 hover:gap-2 self-start"
        >
          <ArrowLeft className="w-5 h-5 text-[#344054]" />
          <span className="text-[#344054] text-sm font-normal font-outfit">Back</span>
        </button>

        <div className="flex flex-col gap-3">
          <h1 className="text-[#101828] text-[32px] font-semibold font-outfit">
            Reset Your Password
          </h1>
          <p className="text-[#667085] text-[14px] font-normal font-outfit leading-relaxed">
            Enter the 6-digit OTP sent to your email and create a new password.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-xs font-semibold mb-2">⚠️ Important:</p>
          <p className="text-yellow-700 text-xs">
            The OTP is valid for 10 minutes and can only be used once. Make sure to complete 
            the password reset now, or you'll need to request a new OTP.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel className="text-[#344054] text-[14px] font-medium font-outfit">
                    Email address<span className="text-[#F04438]">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      className="h-12 px-4 py-3 bg-white rounded-lg border border-[#D0D5DD] text-[#101828] placeholder:text-[#98A2B3] text-[15px] font-normal font-outfit focus-visible:ring-4 focus-visible:ring-[#465FFF1F] focus-visible:border-[#465FFF] focus-visible:outline-none focus-visible:shadow-sm hover:border-[#98A2B3] transition-all duration-200"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-[#F04438] font-outfit" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel className="text-[#344054] text-[14px] font-medium font-outfit">
                    OTP (6 digits)<span className="text-[#F04438]">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      className="h-12 px-4 py-3 bg-white rounded-lg border border-[#D0D5DD] text-[#101828] placeholder:text-[#98A2B3] text-[20px] font-mono font-bold tracking-widest text-center focus-visible:ring-4 focus-visible:ring-[#465FFF1F] focus-visible:border-[#465FFF] focus-visible:outline-none focus-visible:shadow-sm hover:border-[#98A2B3] transition-all duration-200"
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <p className="text-xs text-[#667085] font-outfit">Check your email for the 6-digit code</p>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="self-start text-sm font-semibold text-[#161950] hover:text-[#1E2B5B] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isResending ? 'Resending OTP...' : "Didn't receive the code? Resend"}
                  </button>
                  <FormMessage className="text-xs text-[#F04438] font-outfit" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel className="text-[#344054] text-[14px] font-medium font-outfit">
                    New Password<span className="text-[#F04438]">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        className="h-12 px-4 py-3 pr-12 bg-white rounded-lg border border-[#D0D5DD] text-[#101828] placeholder:text-[#98A2B3] text-[15px] font-normal font-outfit focus-visible:ring-4 focus-visible:ring-[#465FFF1F] focus-visible:border-[#465FFF] focus-visible:outline-none focus-visible:shadow-sm hover:border-[#98A2B3] transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#344054] transition-colors"
                        tabIndex={-1}
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </FormControl>
                  <p className="text-xs text-[#667085] font-outfit">Minimum 8 characters</p>
                  <FormMessage className="text-xs text-[#F04438] font-outfit" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel className="text-[#344054] text-[14px] font-medium font-outfit">
                    Confirm New Password<span className="text-[#F04438]">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        className="h-12 px-4 py-3 pr-12 bg-white rounded-lg border border-[#D0D5DD] text-[#101828] placeholder:text-[#98A2B3] text-[15px] font-normal font-outfit focus-visible:ring-4 focus-visible:ring-[#465FFF1F] focus-visible:border-[#465FFF] focus-visible:outline-none focus-visible:shadow-sm hover:border-[#98A2B3] transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#344054] transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-[#F04438] font-outfit" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-[48px] px-5 py-3 bg-[#161950] rounded-lg text-white text-[15px] font-semibold font-outfit hover:bg-[#1E2B5B] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
