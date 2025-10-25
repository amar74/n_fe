import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionManager } from '@/services/sessionManager';
import { useToast } from '@/hooks/useToast';

export function useSessionManager() {
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = useCallback(() => {
    setShowWarning(false);
    
    toast.info('Session expired due to inactivity. Please log in again.');
    
    navigate('/login');
  }, [navigate, toast]);

  const handleWarning = useCallback(() => {
    setShowWarning(true);
  }, []);

  const handleExtendSession = useCallback(() => {
    setShowWarning(false);
    sessionManager.extendSession();
    toast.success('Session extended for another 30 minutes');
  }, [toast]);

  const handleLogoutNow = useCallback(() => {
    setShowWarning(false);
    handleLogout();
  }, [handleLogout]);

  useEffect(() => {
    sessionManager.init(handleLogout, handleWarning);

    return () => {
      sessionManager.destroy();
    };
  }, [handleLogout, handleWarning]);

  return {
    showWarning,
    handleExtendSession,
    handleLogoutNow,
  };
}