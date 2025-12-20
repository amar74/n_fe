import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { apiClient } from '@/services/api/client';
import { useToast } from '@/hooks/shared';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import LogoIcon from '@assets/Asset 2 1.svg';

const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = form.handleSubmit(async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    form.clearErrors();

    try {
      await apiClient.post('/auth/forgot-password', {
        email: data.email,
      });

      setSubmittedEmail(data.email);
      setEmailSent(true);
      
      toast.success('Email Sent', {
        description: 'Password reset OTP has been sent to your email.',
      });

    } catch (error: any) {
      console.error('Forgot password error:', error);
      
      const errorMessage = error.response?.data?.detail || 'Failed to send reset email';
      
      toast.error('Error', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  if (emailSent) {
    return (
      <div className="w-full min-h-screen relative bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-[480px] p-12 rounded-2xl border border-[#E6E6E6] bg-white flex flex-col items-center gap-6 shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          
          <div className="text-center space-y-3">
            <h1 className="text-[#101828] text-[32px] font-semibold font-outfit">Check Your Email</h1>
            <p className="text-[#667085] text-[15px] font-normal font-outfit leading-relaxed">
              We've sent password reset instructions to:
            </p>
            <p className="text-[#161950] text-[16px] font-semibold font-outfit">
              {submittedEmail}
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
            <p className="text-yellow-800 text-sm font-semibold">⚠️ Important:</p>
            <ul className="text-yellow-700 text-xs space-y-1 list-disc list-inside">
              <li>The OTP is valid for <strong>10 minutes</strong></li>
              <li>The OTP can be used <strong>only once</strong></li>
              <li>Once you enter the OTP, you must complete the password reset immediately</li>
              <li>If you don't complete the reset, you'll need to request a new OTP</li>
            </ul>
          </div>

          <div className="text-center text-sm text-[#667085] font-outfit">
            Didn't receive the email? Check your spam folder or{' '}
            <button
              onClick={() => {
                setEmailSent(false);
                form.reset();
              }}
              className="text-[#161950] font-semibold hover:underline"
            >
              try again
            </button>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Button
              onClick={() => navigate('/auth/reset-password', { state: { email: submittedEmail } })}
              className="w-full bg-[#161950] hover:bg-[#1E2B5B]"
            >
              Enter OTP & Reset Password
            </Button>
            <Button
              onClick={() => navigate('/auth/login')}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-[480px] p-12 rounded-2xl border border-[#E6E6E6] bg-white flex flex-col gap-8 shadow-lg">
        <button
          onClick={() => navigate('/auth/login')}
          className="inline-flex justify-start items-center gap-1.5 transition-all duration-200 hover:opacity-70 hover:gap-2 self-start"
        >
          <ArrowLeft className="w-5 h-5 text-[#344054]" />
          <span className="text-[#344054] text-sm font-normal font-outfit">Back to Sign In</span>
        </button>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-[#161950]/10 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-[#161950]" />
            </div>
          </div>
          
          <h1 className="text-[#101828] text-[32px] font-semibold font-outfit text-center">
            Forgot Password?
          </h1>
          <p className="text-[#667085] text-[14px] font-normal font-outfit leading-relaxed text-center">
            No worries! Enter your email address and we'll send you instructions to reset your password.
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

            {form.formState.errors.root && (
              <div className="text-[#F04438] text-sm text-center bg-[#FEF3F2] border border-[#FECDCA] rounded-lg px-4 py-3 font-outfit">
                {form.formState.errors.root.message}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-[48px] px-5 py-3 bg-[#161950] rounded-lg text-white text-[15px] font-semibold font-outfit hover:bg-[#1E2B5B] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
