/**
 * Centralized Google Maps API Loader
 * Prevents multiple script injections and provides a unified loading interface
 */

declare global {
  interface Window {
    google: typeof google;
    googleMapsCallback?: () => void;
    gm_authFailure?: () => void;
  }
}

type GoogleMapsLoadOptions = {
  libraries?: string[];
  onAuthFailure?: (error: string) => void;
};

class GoogleMapsLoader {
  private static instance: GoogleMapsLoader;
  private loadPromise: Promise<void> | null = null;
  private isLoaded = false;
  private isLoading = false;
  private apiKey: string | null = null;
  private callbacks: Array<() => void> = [];

  private constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    // Set up global auth failure handler
    window.gm_authFailure = () => {
      console.error('Google Maps authentication failed');
      this.handleAuthFailure('Google Maps API authentication failed. Check your API key and restrictions.');
    };
  }

  static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader();
    }
    return GoogleMapsLoader.instance;
  }

  private handleAuthFailure(message: string) {
    console.error('Auth failure:', message);
    this.callbacks.forEach(cb => cb());
  }

  async load(options: GoogleMapsLoadOptions = {}): Promise<void> {
    console.log('GoogleMapsLoader.load() called');
    
    // If already loaded, return immediately
    if (this.isLoaded && window.google?.maps?.places) {
      console.log('Google Maps already loaded and ready');
      return Promise.resolve();
    }

    // If currently loading, wait for existing promise
    if (this.isLoading && this.loadPromise) {
      console.log('Google Maps is already loading, waiting for existing promise...');
      return this.loadPromise;
    }

    // Check for API key
    if (!this.apiKey) {
      const error = 'Google Maps API key is missing. Set VITE_GOOGLE_MAPS_API_KEY in your .env file';
      console.error(error);
      throw new Error(error);
    }

    console.log('API Key found:', this.apiKey.substring(0, 10) + '...');

    // Start loading
    this.isLoading = true;
    this.loadPromise = new Promise<void>((resolve, reject) => {
      // Check if script already exists
      const existingScript = document.getElementById('google-maps-script');
      
      if (existingScript) {
        console.log('Existing script found in DOM');
        
        // Script exists and API is ready
        if (window.google?.maps?.places?.Autocomplete) {
          console.log('Google Maps script found and Places API ready');
          this.isLoaded = true;
          this.isLoading = false;
          resolve();
          return;
        }
        
        // Script exists but not ready - remove it and reload
        console.log('Script exists but not ready, removing and reloading...');
        existingScript.remove();
      }

      // Create unique callback name
      const callbackName = `googleMapsCallback_${Date.now()}`;
      console.log('Creating callback:', callbackName);
      
      let timeoutId: NodeJS.Timeout;
      
      window[callbackName] = () => {
        console.log('Google Maps callback fired!');
        clearTimeout(timeoutId);
        
        // Verify Places API is available
        if (!window.google?.maps?.places?.Autocomplete) {
          const error = 'Google Maps loaded but Places API not available. Ensure Places API is enabled in Google Cloud Console.';
          console.error(error);
          console.error('Available:', {
            google: !!window.google,
            maps: !!window.google?.maps,
            places: !!window.google?.maps?.places,
            Autocomplete: !!window.google?.maps?.places?.Autocomplete
          });
          this.isLoading = false;
          reject(new Error(error));
          return;
        }

        console.log('Places API verified and ready');
        this.isLoaded = true;
        this.isLoading = false;
        resolve();
        
        // Clean up callback
        setTimeout(() => delete window[callbackName], 100);
      };

      // Set timeout
      timeoutId = setTimeout(() => {
        this.isLoading = false;
        const error = `Timeout: Google Maps didn't load in 15s. Check: 1) API key valid, 2) Places API enabled, 3) Billing enabled, 4) Referrer restrictions (add ${window.location.origin}/* to allowed referrers)`;
        console.error(error);
        console.error('Debug info:', {
          apiKey: this.apiKey ? 'Present' : 'Missing',
          scriptExists: !!document.getElementById('google-maps-script'),
          windowGoogle: !!window.google,
          callbackExists: !!window[callbackName]
        });
        delete window[callbackName];
        reject(new Error(error));
      }, 15000);

      // Build script URL
      const libraries = options.libraries || ['places'];
      const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=${libraries.join(',')}&callback=${callbackName}`;

      console.log('Loading Google Maps API with callback...');
      
      // Create and inject script
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = scriptUrl;
      script.async = true;
      script.defer = true;
      
      script.onerror = (error) => {
        clearTimeout(timeoutId);
        this.isLoading = false;
        const errorMessage = 'Failed to load Google Maps script. Check: 1) Internet connection, 2) API key valid, 3) No browser console errors';
        console.error(errorMessage, error);
        reject(new Error(errorMessage));
        delete window[callbackName];
      };

      console.log('Appending script to document head...');
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  isApiLoaded(): boolean {
    return this.isLoaded && !!window.google?.maps?.places;
  }

  getApi() {
    if (!this.isApiLoaded()) {
      throw new Error('Google Maps API not loaded. Call load() first.');
    }
    return window.google;
  }
}

// Export singleton instance
export const googleMapsLoader = GoogleMapsLoader.getInstance();

// Export convenience function
export async function loadGoogleMaps(options?: GoogleMapsLoadOptions): Promise<void> {
  return googleMapsLoader.load(options);
}

// Export check function
export function isGoogleMapsLoaded(): boolean {
  return googleMapsLoader.isApiLoaded();
}
