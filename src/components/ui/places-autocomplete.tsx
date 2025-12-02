/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import { loadGoogleMaps, isGoogleMapsLoaded } from '@/lib/google-maps-loader';

type PlacesAutocompleteProps = {
  value: string;
  onChange: (value: string, placeDetails?: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

/**
 * Google Places Autocomplete Component
 * Uses centralized Google Maps loader to prevent conflicts
 */
export function PlacesAutocomplete({
  value,
  onChange,
  placeholder = 'Enter an address',
  className = '',
  disabled = false,
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const listenerRef = useRef<google.maps.MapsEventListener | null>(null);
  
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAutocomplete = async () => {
      try {
        console.log('Initializing Google Places Autocomplete...');
        setIsLoading(true);
        setError(null);

        // Load Google Maps API
        await loadGoogleMaps({ libraries: ['places'] });

        if (!mounted) return;

        // Verify API is loaded
        if (!isGoogleMapsLoaded()) {
          throw new Error('Google Maps API failed to load');
        }

        // Verify input ref exists
        if (!inputRef.current) {
          console.warn('Input ref not available yet, retrying...');
          setTimeout(() => {
            if (mounted && !autocompleteRef.current) {
              initializeAutocomplete();
            }
          }, 100);
          return;
        }

        console.log('Google Maps loaded, creating Autocomplete instance...');

        // Create autocomplete instance
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' },
          fields: ['address_components', 'formatted_address', 'geometry', 'name'],
        });

        autocompleteRef.current = autocomplete;

        // Add place_changed listener
        const listener = autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          
          if (!place) {
            console.warn('No place selected');
            return;
          }

          console.log('Place selected:', place);

          // Call parent onChange with place details
          const address = place.formatted_address || place.name || '';
          // Update the input value to show the selected address
          if (inputRef.current) {
            inputRef.current.value = address;
          }
          onChange(address, place);
        });

        listenerRef.current = listener;

        setIsReady(true);
        setIsLoading(false);
        console.log('Places Autocomplete ready');

      } catch (err) {
        if (!mounted) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Failed to initialize Places Autocomplete:', errorMessage);
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    initializeAutocomplete();

    // Cleanup
    return () => {
      mounted = false;
      
      if (listenerRef.current) {
        window.google?.maps?.event.removeListener(listenerRef.current);
        listenerRef.current = null;
      }
      
      if (autocompleteRef.current) {
        // Clear autocomplete instance
        window.google?.maps?.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, []);

  // Handle manual input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={error ? 'Google Maps unavailable - enter manually' : placeholder}
          disabled={disabled || isLoading}
          className={`
            w-full h-12 pl-10 pr-4 py-2.5
            bg-white rounded-lg
            border border-gray-300
            text-sm text-gray-900
            placeholder:text-gray-500
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            transition-colors
            ${error ? 'border-red-300 bg-red-50' : ''}
            ${className}
          `.trim()}
          autoComplete="off"
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-red-800">Google Maps Error</div>
              <div className="mt-1 text-xs text-red-600 leading-relaxed">{error}</div>
              
              {error.includes('API key') && (
                <div className="mt-3 p-2 bg-white rounded border border-red-200">
                  <div className="text-xs font-medium text-red-800 mb-2">✅ Quick Fix:</div>
                  <ol className="ml-4 list-decimal space-y-1 text-xs text-gray-700">
                    <li>Ensure <code className="px-1 py-0.5 bg-gray-100 rounded font-mono text-[10px]">VITE_GOOGLE_MAPS_API_KEY</code> is in <code className="px-1 py-0.5 bg-gray-100 rounded">.env</code></li>
                    <li>Restart the dev server with <code className="px-1 py-0.5 bg-gray-100 rounded font-mono text-[10px]">pnpm dev</code></li>
                  </ol>
                </div>
              )}
              
              {(error.includes('Places API') || error.includes('Timeout')) && (
                <div className="mt-3 p-2 bg-white rounded border border-red-200">
                  <div className="text-xs font-medium text-red-800 mb-2">Common Issues:</div>
                  <ul className="ml-4 list-disc space-y-1 text-xs text-gray-700">
                    <li><strong>Places API not enabled:</strong> Go to <a href="https://console.cloud.google.com/apis/library/places-backend.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud</a> and enable it</li>
                    <li><strong>Billing not enabled:</strong> Google Maps requires a billing account</li>
                    <li><strong>Referrer restrictions:</strong> Add <code className="px-1 py-0.5 bg-gray-100 rounded font-mono text-[10px]">{window.location.origin}/*</code> to allowed referrers</li>
                    <li><strong>API key restrictions:</strong> Ensure "Places API" is allowed for your key</li>
                  </ul>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <button 
                      onClick={() => window.location.reload()} 
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      🔄 Retry (reload page)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!error && !isLoading && !isReady && (
        <p className="mt-1 text-xs text-gray-500">
          💡 Type to see address suggestions or enter manually
        </p>
      )}
    </div>
  );
}
