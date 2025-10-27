/**
 * Dynamic Geocoding Service
 * Uses Google Maps Geocoding API to fetch coordinates for any city
 * Handles 1000+ cities without hardcoding coordinates
 */

import { loadGoogleMaps, isGoogleMapsLoaded } from './google-maps-loader';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodingResult {
  coordinates: Coordinates;
  formattedAddress: string;
  city: string;
  state: string;
  country: string;
}

// Cache to avoid repeated API calls
const geocodingCache = new Map<string, GeocodingResult>();

// Rate limiting to avoid hitting API limits
const RATE_LIMIT_DELAY = 100; // 100ms between requests
let lastRequestTime = 0;

export class GeocodingService {
  private static instance: GeocodingService;
  
  private constructor() {}
  
  static getInstance(): GeocodingService {
    if (!GeocodingService.instance) {
      GeocodingService.instance = new GeocodingService();
    }
    return GeocodingService.instance;
  }

  /**
   * Get coordinates for a city, with optional state for disambiguation
   */
  async getCityCoordinates(
    city: string, 
    state?: string | null, 
    country: string = 'US'
  ): Promise<GeocodingResult | null> {
    try {
      // Create cache key
      const cacheKey = this.createCacheKey(city, state, country);
      
      // Check cache first
      if (geocodingCache.has(cacheKey)) {
        console.log(`[Geocoding] ✅ Cache hit for ${cacheKey}`);
        return geocodingCache.get(cacheKey)!;
      }

      // Ensure Google Maps is loaded
      if (!isGoogleMapsLoaded()) {
        console.log('[Geocoding] 🔄 Loading Google Maps API...');
        await loadGoogleMaps({ libraries: ['places'] });
      }

      // Rate limiting
      await this.enforceRateLimit();

      // Create geocoder instance
      const geocoder = new window.google.maps.Geocoder();
      
      // Build search query
      const query = this.buildSearchQuery(city, state, country);
      
      console.log(`[Geocoding] 🔍 Searching for: ${query}`);
      
      // Perform geocoding request
      const results = await this.geocodeRequest(geocoder, query);
      
      if (!results || results.length === 0) {
        console.warn(`[Geocoding] ⚠️ No results found for: ${query}`);
        return null;
      }

      // Parse the best result
      const result = this.parseGeocodingResult(results[0], city, state);
      
      if (!result) {
        console.warn(`[Geocoding] ⚠️ Could not parse result for: ${query}`);
        return null;
      }

      // Cache the result
      geocodingCache.set(cacheKey, result);
      
      console.log(`[Geocoding] ✅ Found coordinates for ${query}: ${result.coordinates.lat}, ${result.coordinates.lng}`);
      
      return result;
      
    } catch (error) {
      console.error(`[Geocoding] ❌ Error geocoding ${city}, ${state}:`, error);
      return null;
    }
  }

  /**
   * Batch geocode multiple cities efficiently
   */
  async batchGeocode(
    cities: Array<{ city: string; state?: string | null }>,
    country: string = 'US'
  ): Promise<Map<string, GeocodingResult>> {
    const results = new Map<string, GeocodingResult>();
    
    console.log(`[Geocoding] 🚀 Starting batch geocoding for ${cities.length} cities`);
    
    for (const { city, state } of cities) {
      try {
        const result = await this.getCityCoordinates(city, state, country);
        if (result) {
          const key = this.createCacheKey(city, state, country);
          results.set(key, result);
        }
      } catch (error) {
        console.error(`[Geocoding] ❌ Batch error for ${city}, ${state}:`, error);
      }
    }
    
    console.log(`[Geocoding] ✅ Batch complete: ${results.size}/${cities.length} cities geocoded`);
    return results;
  }

  /**
   * Clear the geocoding cache
   */
  clearCache(): void {
    geocodingCache.clear();
    console.log('[Geocoding] 🗑️ Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: geocodingCache.size,
      keys: Array.from(geocodingCache.keys())
    };
  }

  private createCacheKey(city: string, state?: string | null, country: string = 'US'): string {
    const normalizedCity = city.trim().toLowerCase();
    const normalizedState = state?.trim().toLowerCase() || '';
    const normalizedCountry = country.trim().toLowerCase();
    
    return `${normalizedCity}|${normalizedState}|${normalizedCountry}`;
  }

  private buildSearchQuery(city: string, state?: string | null, country: string = 'US'): string {
    let query = city.trim();
    
    if (state) {
      query += `, ${state.trim()}`;
    }
    
    query += `, ${country}`;
    
    return query;
  }

  private async geocodeRequest(
    geocoder: google.maps.Geocoder, 
    query: string
  ): Promise<google.maps.GeocoderResult[]> {
    return new Promise((resolve, reject) => {
      geocoder.geocode(
        { 
          address: query,
          componentRestrictions: { country: 'US' }
        },
        (results, status) => {
          if (status === 'OK' && results) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        }
      );
    });
  }

  private parseGeocodingResult(
    result: google.maps.GeocoderResult,
    originalCity: string,
    originalState?: string | null
  ): GeocodingResult | null {
    try {
      const location = result.geometry.location;
      const addressComponents = result.address_components;
      
      if (!location || !addressComponents) {
        return null;
      }

      // Extract address components
      let city = '';
      let state = '';
      let country = '';

      addressComponents.forEach(component => {
        const types = component.types;
        
        if (types.includes('locality') || types.includes('sublocality')) {
          city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          state = component.short_name;
        } else if (types.includes('country')) {
          country = component.short_name;
        }
      });

      return {
        coordinates: {
          lat: location.lat(),
          lng: location.lng()
        },
        formattedAddress: result.formatted_address,
        city: city || originalCity,
        state: state || originalState || '',
        country: country || 'US'
      };
      
    } catch (error) {
      console.error('[Geocoding] Error parsing result:', error);
      return null;
    }
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      const delay = RATE_LIMIT_DELAY - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    lastRequestTime = Date.now();
  }
}

// Export singleton instance
export const geocodingService = GeocodingService.getInstance();

// Export convenience functions
export async function getCityCoordinates(
  city: string, 
  state?: string | null, 
  country: string = 'US'
): Promise<GeocodingResult | null> {
  return geocodingService.getCityCoordinates(city, state, country);
}

export async function batchGeocodeCities(
  cities: Array<{ city: string; state?: string | null }>,
  country: string = 'US'
): Promise<Map<string, GeocodingResult>> {
  return geocodingService.batchGeocode(cities, country);
}

export function clearGeocodingCache(): void {
  geocodingService.clearCache();
}

export function getGeocodingCacheStats(): { size: number; keys: string[] } {
  return geocodingService.getCacheStats();
}