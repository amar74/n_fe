import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LogoIcon from '@assets/Asset 2 1.svg';
import VectorGrid1 from '@assets/Vector.svg';
import VectorGrid2 from '@assets/Vector-1.svg';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="w-full min-h-screen relative bg-white flex flex-col lg:flex-row">
        {/* Left Side - Success Message */}
        <div className="flex-1 relative min-h-screen flex items-center justify-center px-4 py-20 sm:py-24 lg:py-0 lg:px-0">
          <div className="w-full max-w-[650px] lg:max-w-none lg:w-auto relative flex flex-col items-center lg:items-start justify-center lg:pl-[156px] lg:pr-16 xl:pr-20">
            {/* Back to Sign-in */}
            <button
              onClick={() => navigate('/auth/login')}
              className="mb-8 lg:mb-0 lg:absolute lg:top-[-94px] lg:left-[156px] inline-flex justify-start items-center gap-1.5 z-10 transition-all duration-200 hover:opacity-70 hover:gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.7083 5L7.5 10.2083L12.7083 15.4167" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">Back to Sign-in</span>
            </button>

            {/* Success Card */}
            <div className="w-full max-w-[440px] sm:max-w-[480px] lg:w-[460px] xl:w-[480px] p-8 sm:p-10 lg:p-12 rounded-2xl border border-[#E6E6E6] bg-white flex flex-col justify-start items-start gap-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <h1 className="text-[#101828] text-[32px] sm:text-[36px] font-semibold font-outfit leading-[1.2]">Check Your Email</h1>
                <p className="text-[#667085] text-[14px] font-normal font-outfit leading-relaxed">
                  We've sent you a password reset link. Please check your email and follow the instructions to reset your password.
                </p>
              </div>

              <div className="self-stretch rounded-lg bg-[#F0FDF4] border border-[#86EFAC] px-4 py-3">
                <div className="text-[#16A34A] text-sm font-outfit">
                  Reset link sent successfully! Check your inbox.
                </div>
              </div>

              <Button
                onClick={() => navigate('/auth/login')}
                className="self-stretch h-[48px] px-5 py-3 bg-[#161950] rounded-lg text-white text-[15px] font-semibold font-outfit leading-tight hover:bg-[#1E2B5B] hover:shadow-lg active:scale-[0.98] transition-all duration-200 shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
              >
                Back to Sign In
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Brand Panel (Hidden on mobile/tablet, visible on large screens) */}
        <div className="hidden lg:flex lg:w-[50%] flex-shrink-0 relative items-center justify-center overflow-hidden min-h-screen">
          {/* Background Shape */}
          <div className="absolute inset-0 w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 700 800" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M0 -3.98999H702.062V800H108C48.3532 800 0 751.647 0 692V-3.98999Z" fill="#161950"/>
            </svg>
          </div>
          
          {/* Background Grid Vectors */}
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
          
          {/* Top Right Corner Decorations */}
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

          {/* Bottom Left Corner Decorations */}
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

          {/* Logo with text - Centered */}
          <div className="relative z-10 inline-flex flex-col justify-start items-center gap-6">
            <div className="inline-flex justify-start items-center gap-5">
              <img src={LogoIcon} alt="Megapolis Logo" className="w-[88px] h-[88px]" />
              <div className="inline-flex flex-col justify-center items-start">
                <h2 className="text-white text-4xl font-semibold font-poppins">Megapolis</h2>
                <p className="text-[#ABA4A1] text-xl font-medium font-poppins">Advisory</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative bg-white flex flex-col lg:flex-row">
      {/* Left Side - Form Area */}
      <div className="flex-1 relative min-h-screen flex items-center justify-center px-4 py-20 sm:py-24 lg:py-0 lg:px-0">
        <div className="w-full max-w-[650px] lg:max-w-none lg:w-auto relative flex flex-col items-center lg:items-start justify-center lg:pl-[156px] lg:pr-16 xl:pr-20">
          {/* Back to Sign-in */}
          <button
            onClick={() => navigate('/auth/login')}
            className="mb-8 lg:mb-0 lg:absolute lg:top-[-94px] lg:left-[156px] inline-flex justify-start items-center gap-1.5 z-10 transition-all duration-200 hover:opacity-70 hover:gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.7083 5L7.5 10.2083L12.7083 15.4167" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[#344054] text-sm font-normal font-outfit leading-tight">Back to Sign-in</span>
          </button>

          {/* Forgot Password Form */}
          <div className="w-full max-w-[440px] sm:max-w-[480px] lg:w-[460px] xl:w-[480px] p-8 sm:p-10 lg:p-12 rounded-2xl border border-[#E6E6E6] bg-white flex flex-col justify-start items-start gap-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] transition-shadow duration-300">
            {/* Title with subtitle */}
            <div className="self-stretch flex flex-col justify-start items-start gap-3">
              <h1 className="text-[#101828] text-[32px] sm:text-[36px] font-semibold font-outfit leading-[1.2]">Forgot Your Password ?</h1>
              <p className="text-[#667085] text-[14px] font-normal font-outfit leading-relaxed">
                Enter your e-mail address and we will send you a link to reset your password
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="self-stretch flex flex-col justify-start items-start gap-6">
              {/* Error Message */}
              {error && (
                <div className="self-stretch rounded-lg bg-[#FEF3F2] border border-[#FECDCA] px-4 py-3">
                  <div className="text-[#F04438] text-sm font-outfit">{error}</div>
                </div>
              )}

              {/* Email Field */}
              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                <label className="text-[#344054] text-[14px] font-medium font-outfit leading-tight">
                  Email address<span className="text-[#F04438]">*</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="self-stretch h-12 px-4 py-3 bg-white rounded-lg border border-[#D0D5DD] text-[#101828] placeholder:text-[#98A2B3] text-[15px] font-normal font-outfit focus-visible:ring-4 focus-visible:ring-[#465FFF1F] focus-visible:border-[#465FFF] focus-visible:outline-none focus-visible:shadow-sm hover:border-[#98A2B3] transition-all duration-200"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="self-stretch h-[48px] px-5 py-3 bg-[#161950] rounded-lg text-white text-[15px] font-semibold font-outfit leading-tight hover:bg-[#1E2B5B] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
              >
                {isSubmitting ? 'Sending reset link...' : 'Send Reset Link'}
              </Button>

              {/* Footer */}
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
          </div>
        </div>
      </div>

      {/* Right: Brand Panel (Hidden on mobile/tablet, visible on large screens) */}
      <div className="hidden lg:flex lg:w-[50%] flex-shrink-0 relative items-center justify-center overflow-hidden min-h-screen">
        {/* Background Shape */}
        <div className="absolute inset-0 w-full h-full">
          <svg width="100%" height="100%" viewBox="0 0 700 800" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 -3.98999H702.062V800H108C48.3532 800 0 751.647 0 692V-3.98999Z" fill="#161950"/>
          </svg>
        </div>
        
        {/* Background Grid Vectors */}
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
        
        {/* Top Right Corner Decorations */}
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

        {/* Bottom Left Corner Decorations */}
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

        {/* Logo with text - Centered */}
        <div className="relative z-10 inline-flex flex-col justify-start items-center gap-6">
          <div className="inline-flex justify-start items-center gap-5">
            <img src={LogoIcon} alt="Megapolis Logo" className="w-[88px] h-[88px]" />
            <div className="inline-flex flex-col justify-center items-start">
              <h2 className="text-white text-4xl font-semibold font-poppins">Megapolis</h2>
              <p className="text-[#ABA4A1] text-xl font-medium font-poppins">Advisory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}