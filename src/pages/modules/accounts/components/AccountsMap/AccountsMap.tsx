/// <reference types="@types/google.maps" />
import React, { useEffect, useRef, useState, useMemo, memo } from 'react';
import { AccountListItem } from '@/types/accounts';
import { calculateCityAggregates, getRiskColor, getRiskLevel, CityAggregate } from './utils';
import { loadGoogleMaps, isGoogleMapsLoaded } from '@/lib/google-maps-loader';

// Window.google is declared in google-maps-loader

type AccountsMapProps = {
  accounts: AccountListItem[];
}

function AccountsMap({ accounts }: AccountsMapProps) {
  // working but need cleanup - guddy.tech
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevAccountsRef = useRef<string>('');

  // Create a stable key from accounts to detect changes
  const accountsKey = useMemo(() => {
    return accounts.map(a => `${a.account_id}-${a.client_address?.city || ''}`).join('|');
  }, [accounts]);

  // Memoize city aggregates - instant synchronous calculation
  const cityAggregates = useMemo(() => {
    console.log('[AccountsMap] Calculating city aggregates from', accounts.length, 'accounts');
    console.log('[AccountsMap] Account cities:', accounts.map(a => `${a.client_address?.city || 'No city'}, ${a.client_address?.state || 'No state'}`));
    
    const aggregates = calculateCityAggregates(accounts);
    
    console.log('[AccountsMap] Result:', aggregates.length, 'cities with valid coordinates');
    if (aggregates.length > 0) {
      console.log('[AccountsMap] Cities:', aggregates.map(a => `${a.city} (${a.accountCount} accounts, pos: ${a.position.lat.toFixed(2)}, ${a.position.lng.toFixed(2)})`));
    } else {
      console.warn('[AccountsMap] No valid city aggregates created! Check if accounts have city and state data.');
    }
    
    return aggregates;
  }, [accounts]);

  useEffect(() => {
    if (isLoaded && !infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow();
    }
  }, [isLoaded]);

  // Create marker with info window - moved out of useCallback to avoid dependency issues
  const createMarker = (cityData: CityAggregate, map: google.maps.Map) => {
    // Calculate dynamic size based on account count (smaller to reduce overlap)
    // Minimum 16px, maximum 32px for better separation
    const markerSize = Math.min(32, Math.max(16, 14 + (cityData.accountCount * 3)));
    
    // Create custom SVG marker for better visibility
    const svgMarker = {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: markerSize,
      fillColor: cityData.riskColor,
      fillOpacity: 0.95,
      strokeColor: '#FFFFFF',
      strokeWeight: 4,
      anchor: new window.google.maps.Point(0, 0),
    };

    const marker = new window.google.maps.Marker({
      position: cityData.position,
      map: map,
      title: `${cityData.city}: ${cityData.accountCount} accounts`,
      label: {
        text: cityData.accountCount.toString(),
        color: '#FFFFFF',
        fontSize: cityData.accountCount >= 10 ? '11px' : '13px',
        fontWeight: 'bold',
        fontFamily: 'Outfit, sans-serif',
      },
      icon: svgMarker,
      optimized: false, // Better rendering for custom markers
    });

    // Add click listener for info window
    marker.addListener('click', () => {
      if (infoWindowRef.current) {
        const content = `
          <div style="padding: 12px; font-family: 'Outfit', sans-serif;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1A1A1A;">
              ${cityData.city}
            </h3>
            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #667085;">Total Accounts:</span>
                <span style="font-weight: 600; color: #1A1A1A;">${cityData.accountCount}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #667085;">AI Health Score:</span>
                <span style="font-weight: 600; color: ${cityData.riskColor};">${cityData.avgHealthScore.toFixed(1)}%</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #667085;">Risk Level:</span>
                <span style="padding: 2px 8px; background: ${cityData.riskColor}20; color: ${cityData.riskColor}; border-radius: 12px; font-size: 12px; font-weight: 600;">
                  ${cityData.riskLevel}
                </span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #667085;">Total Value:</span>
                <span style="font-weight: 600; color: #1A1A1A;">$${cityData.totalValue.toFixed(1)}M</span>
              </div>
            </div>
          </div>
        `;
        
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(map, marker);
      }
    });

    // Add hover effect to show city name prominently
    marker.addListener('mouseover', () => {
      if (infoWindowRef.current) {
        const hoverContent = `
          <div style="padding: 8px 12px; font-family: 'Outfit', sans-serif; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
            <div style="font-size: 16px; font-weight: 700; color: #1A1A1A; margin-bottom: 4px;">
              ${cityData.city}
            </div>
            <div style="font-size: 14px; color: #667085;">
              <span style="font-weight: 600; color: ${cityData.riskColor};">${cityData.accountCount}</span> account${cityData.accountCount > 1 ? 's' : ''}
            </div>
          </div>
        `;
        infoWindowRef.current.setContent(hoverContent);
        infoWindowRef.current.open(map, marker);
      }
    });

    return marker;
  };

  // Update markers when cityAggregates or accountsKey changes
  useEffect(() => {
    if (!isLoaded || !mapRef.current || cityAggregates.length === 0) {
      console.log('[AccountsMap] Skipping marker update - isLoaded:', isLoaded, 'cityAggregates:', cityAggregates.length);
      return;
    }

    // Only skip if accounts key is exactly the same AND we already have markers
    if (prevAccountsRef.current === accountsKey && markersRef.current.length > 0) {
      console.log('[AccountsMap] Accounts unchanged and markers already exist, skipping update');
      return;
    }

    console.log('[AccountsMap] UPDATING MARKERS for', cityAggregates.length, 'cities with accounts:', accountsKey);
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Update the previous accounts key
    prevAccountsRef.current = accountsKey;

    // Create map if it doesn't exist
    if (!googleMapRef.current) {
      // Default center (US center, will be adjusted by bounds)
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        zoom: 4,
        center: { lat: 39.8283, lng: -98.5795 },
        styles: [
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#e9e9e9' }, { lightness: 17 }]
          },
          {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }, { lightness: 20 }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [{ color: '#ffffff' }, { lightness: 17 }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#ffffff' }, { lightness: 29 }, { weight: 0.2 }]
          },
          {
            featureType: 'road.arterial',
            elementType: 'geometry',
            stylers: [{ color: '#ffffff' }, { lightness: 18 }]
          },
          {
            featureType: 'road.local',
            elementType: 'geometry',
            stylers: [{ color: '#ffffff' }, { lightness: 16 }]
          },
          {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }, { lightness: 21 }]
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#dedede' }, { lightness: 21 }]
          },
          {
            elementType: 'labels.text.stroke',
            stylers: [{ visibility: 'on' }, { color: '#ffffff' }, { lightness: 16 }]
          },
          {
            elementType: 'labels.text.fill',
            stylers: [{ saturation: 36 }, { color: '#333333' }, { lightness: 40 }]
          },
          {
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [{ color: '#f2f2f2' }, { lightness: 19 }]
          },
          {
            featureType: 'administrative',
            elementType: 'geometry.fill',
            stylers: [{ color: '#fefefe' }, { lightness: 20 }]
          },
          {
            featureType: 'administrative',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#fefefe' }, { lightness: 17 }, { weight: 1.2 }]
          }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });
    }

    // Create bounds to fit all markers
    const bounds = new window.google.maps.LatLngBounds();

    // Create markers for each city
    cityAggregates.forEach(cityData => {
      const marker = createMarker(cityData, googleMapRef.current!);
      markersRef.current.push(marker);
      bounds.extend(cityData.position);
    });

    // Fit map to show all markers
    if (cityAggregates.length > 1) {
      // Add padding to prevent markers from being cut off at edges
      googleMapRef.current.fitBounds(bounds, {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
      });
      const listener = window.google.maps.event.addListenerOnce(googleMapRef.current, 'bounds_changed', () => {
        const zoom = googleMapRef.current?.getZoom();
        // Allow higher zoom levels to separate overlapping markers
        if (zoom && zoom > 18) {
          googleMapRef.current?.setZoom(18);
        }
      });
      
      return () => {
        window.google.maps.event.removeListener(listener);
      };
    } else if (cityAggregates.length === 1) {
      googleMapRef.current.setCenter(cityAggregates[0].position);
      googleMapRef.current.setZoom(12);
    }
  }, [isLoaded, cityAggregates, accountsKey]); // Watch accountsKey to trigger updates

  // Load Google Maps using centralized loader
  useEffect(() => {
    let mounted = true;

    const initializeMap = async () => {
      try {
        console.log('[AccountsMap] Initializing Google Maps...');
        setError(null);

        // Use centralized loader to prevent conflicts
        await loadGoogleMaps({ libraries: ['places', 'geometry'] });

        if (!mounted) return;

        // Verify API is loaded
        if (!isGoogleMapsLoaded()) {
          throw new Error('Google Maps API failed to load');
        }

        console.log('[AccountsMap] Google Maps loaded successfully');
        setIsLoaded(true);

      } catch (err: any) {
        if (!mounted) return;
        
        const errorMessage = err.message || 'Failed to load Google Maps';
        console.error('[AccountsMap] Map initialization error:', errorMessage);
        setError(errorMessage);
      }
    };

    initializeMap();

    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <div className="h-72 relative bg-[#F5F3F2] rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-red-500 text-sm font-inter mb-2">⚠️ Map Error</div>
          <div className="text-gray-600 text-xs font-inter">{error}</div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-72 relative bg-[#F5F3F2] rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-950"></div>
          <div className="text-gray-400 text-sm font-inter">Loading map...</div>
        </div>
      </div>
    );
  }

  if (cityAggregates.length === 0) {
    return (
      <div className="h-72 relative bg-[#F5F3F2] rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-gray-400 text-sm font-inter mb-2">
            {accounts.length === 0 
              ? '📍 No accounts to display' 
              : '⚠️ No mappable locations found'}
          </div>
          {accounts.length > 0 && (
            <div className="text-gray-500 text-xs font-inter">
              Accounts must have valid city and state data to display on map
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* Enhance Google Maps marker labels for smaller markers */
        div[style*="font-family: Outfit"] {
          text-shadow: 
            0 0 2px rgba(0, 0, 0, 0.9),
            0 0 4px rgba(0, 0, 0, 0.7),
            0.5px 0.5px 1px rgba(0, 0, 0, 1);
          font-weight: 700 !important;
          letter-spacing: 0.3px;
          line-height: 1.2;
        }
        
        /* Add subtle animation to markers on hover */
        @keyframes pulse-marker {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.95; }
        }
      `}</style>
      <div 
        ref={mapRef} 
        className="h-72 relative bg-[#F5F3F2] rounded-2xl border border-gray-200 overflow-hidden"
      />
      
      {error && (
        <div className="absolute top-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-10">
          <strong>Map Error:</strong> {error}
        </div>
      )}
    </>
  );
}

// Export memoized component to prevent unnecessary re-renders
const MemoizedAccountsMap = memo(AccountsMap);
export { MemoizedAccountsMap as AccountsMap };
export default MemoizedAccountsMap;