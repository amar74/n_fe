import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInviteAcceptance } from '@/hooks/useInviteAcceptance';
import { LoadingCard } from '@/components/invite/LoadingCard';
import { SignupForm } from '@/components/invite/SignupForm';
import { SuccessMessage } from '@/components/invite/SuccessMessage';
import { ErrorCard } from '@/components/invite/ErrorCard';
import { Toaster } from '@/components/ui/toaster';

// @author amar74.soft
export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const calledRef = useRef(false);

  const {
    isAcceptingInvite,
    inviteData,
    inviteAccepted,
    inviteError,
    isSigningUp,
    signupComplete,
    signupError,
    acceptInvite,
    signup,
    goToLogin,
  } = useInviteAcceptance();

  useEffect(() => {
    if (token && !calledRef.current) {
      calledRef.current = true;
      acceptInvite(token);
    }
  }, [token, acceptInvite]);

  const handleSignup = async (password: string) => {
    if (!inviteData?.email) {
      goToLogin();
      return;
    }
    await signup({ email: inviteData.email, password });
  };

  return (
    <>
      
      {isAcceptingInvite && <LoadingCard message="Accepting invitation..." />}

      
      {(inviteError || !inviteData || !inviteData.email || !inviteData.role) && (
        <ErrorCard error={inviteError} onGoToLogin={goToLogin} />
      )}

      
      {signupComplete && inviteData && (
        <SuccessMessage 
          email={inviteData.email} 
          onGoToLogin={goToLogin} 
        />
      )}

      
      {inviteAccepted && inviteData && !signupComplete && (
        <SignupForm
          inviteData={inviteData}
          isSigningUp={isSigningUp}
          onSubmit={handleSignup}
        />
      )}

      
      <Toaster />
    </>
  );
}
