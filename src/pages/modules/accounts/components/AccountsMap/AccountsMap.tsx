/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { AccountListItem } from '@/types/accounts';
import { calculateCityAggregates, getRiskColor, getRiskLevel, CityAggregate } from './utils';

declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps?: () => void;
    gm_authFailure?: () => void;
  }
}

type AccountsMapProps = {
  accounts: AccountListItem[];
}

export function AccountsMap({ accounts }: AccountsMapProps) {
  // working but need cleanup - guddy.tech
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cityAggregates, setCityAggregates] = useState<CityAggregate[]>([]);

  // Aggregate accounts by city whenever accounts change
  useEffect(() => {
    const aggregates = calculateCityAggregates(accounts);
    setCityAggregates(aggregates);
  }, [accounts]);

  useEffect(() => {
    if (isLoaded && !infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow();
    }
  }, [isLoaded]);

  // Create marker with info window
  const createMarker = useCallback((cityData: CityAggregate, map: google.maps.Map) => {
    const marker = new window.google.maps.Marker({
      position: cityData.position,
      map: map,
      title: cityData.city,
      label: {
        text: cityData.accountCount.toString(),
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
      },
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 15 + (cityData.accountCount * 3), // Scale based on account count
        fillColor: cityData.riskColor,
        fillOpacity: 0.8,
        strokeColor: 'white',
        strokeWeight: 2,
      },
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

    return marker;
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || cityAggregates.length === 0) return;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

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
      googleMapRef.current.fitBounds(bounds);
      const listener = window.google.maps.event.addListenerOnce(googleMapRef.current, 'bounds_changed', () => {
        const zoom = googleMapRef.current?.getZoom();
        if (zoom && zoom > 15) {
          googleMapRef.current?.setZoom(15);
        }
      });
      
      return () => {
        window.google.maps.event.removeListener(listener);
      };
    } else if (cityAggregates.length === 1) {
      googleMapRef.current.setCenter(cityAggregates[0].position);
      googleMapRef.current.setZoom(10);
    }
  }, [isLoaded, cityAggregates, createMarker]);

  // Load Google Maps script
  useEffect(() => {
    const handleScriptError = () => {
      setError('Load failed Maps. Please check your API key and network connection.');
    };

    window.gm_authFailure = () => {
      setError('Google Maps authentication failed. Please check your API key configuration.');
    };

    window.initGoogleMaps = () => {
      setIsLoaded(true);
      setError(null);
    };

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('Google Maps API key is missing. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.');
      return;
    }

    if (!document.querySelector('#google-maps-script')) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMaps&v=weekly`;
      script.async = true;
      script.defer = true;
      script.onerror = handleScriptError;
      document.head.appendChild(script);
    } else if (window.google?.maps) {
      setIsLoaded(true);
      setError(null);
    }

    return () => {
      delete window.initGoogleMaps;
      delete window.gm_authFailure;
    };
  }, []);

  if (error) {
    return (
      <div className="h-72 relative bg-[#F5F3F2] rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-red-500 text-sm font-outfit mb-2">⚠️ Map Error</div>
          <div className="text-gray-600 text-xs font-outfit">{error}</div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-72 relative bg-[#F5F3F2] rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-950"></div>
          <div className="text-gray-400 text-sm font-outfit">Loading map...</div>
        </div>
      </div>
    );
  }

  if (cityAggregates.length === 0) {
    return (
      <div className="h-72 relative bg-[#F5F3F2] rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center">
        <div className="text-gray-400 text-sm font-outfit">
          No account locations available
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="h-72 relative bg-[#F5F3F2] rounded-2xl border border-gray-200 overflow-hidden"
    />
  );
}
