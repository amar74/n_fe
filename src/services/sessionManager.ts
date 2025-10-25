import { STORAGE_CONSTANTS } from '@/constants/storageConstants';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes warning before logout

class SessionManager {
  private inactivityTimer: NodeJS.Timeout | null = null;
  private warningTimer: NodeJS.Timeout | null = null;
  private isWarningShown = false;
  private onLogoutCallback: (() => void) | null = null;
  private onWarningCallback: (() => void) | null = null;

  init(onLogout: () => void, onWarning?: () => void) {
    this.onLogoutCallback = onLogout;
    this.onWarningCallback = onWarning;
    
    // Only start inactivity timer if user hasn't checked "Keep me logged in"
    if (!this.shouldKeepLoggedIn()) {
      this.resetInactivityTimer();
    }
    
    this.setupActivityListeners();
  }

  private setupActivityListeners() {
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown'
    ];

    events.forEach(event => {
      document.addEventListener(event, this.handleActivity.bind(this), true);
    });

    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  private handleActivity() {
    if (this.isWarningShown) {
      this.hideWarning();
    }
    
    // Only reset timer if user hasn't checked "Keep me logged in"
    if (!this.shouldKeepLoggedIn()) {
      this.resetInactivityTimer();
    }
  }

  private shouldKeepLoggedIn(): boolean {
    const rememberMe = localStorage.getItem(STORAGE_CONSTANTS.REMEMBER_ME);
    return rememberMe === 'true';
  }

  private handleVisibilityChange() {
    if (document.hidden) {
      this.pauseTimers();
    } else {
      // Only resume timers if user hasn't checked "Keep me logged in"
      if (!this.shouldKeepLoggedIn()) {
        this.resumeTimers();
      }
    }
  }

  private resetInactivityTimer() {
    this.clearTimers();
    
    this.warningTimer = setTimeout(() => {
      this.showWarning();
    }, INACTIVITY_TIMEOUT - WARNING_TIME);

    this.inactivityTimer = setTimeout(() => {
      this.logout();
    }, INACTIVITY_TIMEOUT);
  }

  private showWarning() {
    this.isWarningShown = true;
    if (this.onWarningCallback) {
      this.onWarningCallback();
    }
  }

  private hideWarning() {
    this.isWarningShown = false;
  }

  private pauseTimers() {
    this.clearTimers();
  }

  private resumeTimers() {
    this.resetInactivityTimer();
  }

  private clearTimers() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }

  private logout() {
    this.clearTimers();
    this.isWarningShown = false;
    
    localStorage.removeItem(STORAGE_CONSTANTS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_CONSTANTS.USER_INFO);
    
    if (this.onLogoutCallback) {
      this.onLogoutCallback();
    }
  }

  extendSession() {
    this.hideWarning();
    
    // Only reset timer if user hasn't checked "Keep me logged in"
    if (!this.shouldKeepLoggedIn()) {
      this.resetInactivityTimer();
    }
  }

  setKeepLoggedIn(keepLoggedIn: boolean) {
    localStorage.setItem(STORAGE_CONSTANTS.REMEMBER_ME, keepLoggedIn.toString());
    
    if (keepLoggedIn) {
      // If user wants to keep logged in, clear any existing timers
      this.clearTimers();
      this.isWarningShown = false;
    } else {
      // If user doesn't want to keep logged in, start the inactivity timer
      this.resetInactivityTimer();
    }
  }

  getRemainingTime(): number {
    return INACTIVITY_TIMEOUT;
  }

  isWarningActive(): boolean {
    return this.isWarningShown;
  }

  destroy() {
    this.clearTimers();
    
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown'
    ];

    events.forEach(event => {
      document.removeEventListener(event, this.handleActivity.bind(this), true);
    });

    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }
}

export const sessionManager = new SessionManager();