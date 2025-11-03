import { AccountListItem } from '@/types/accounts';

export interface CityAggregate {
  city: string;
  accountCount: number;
  avgHealthScore: number;
  totalValue: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskColor: string;
  position: { lat: number; lng: number };
}

// City coordinates with City+State combinations for accurate mapping
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Major US Cities
  'New York': { lat: 40.7128, lng: -74.0060 },
  'New York, New York': { lat: 40.7128, lng: -74.0060 },
  'Chicago': { lat: 41.8781, lng: -87.6298 },
  'Chicago, Illinois': { lat: 41.8781, lng: -87.6298 },
  'Houston': { lat: 29.7604, lng: -95.3698 },
  'Houston, Texas': { lat: 29.7604, lng: -95.3698 },
  'Phoenix': { lat: 33.4484, lng: -112.0740 },
  'Phoenix, Arizona': { lat: 33.4484, lng: -112.0740 },
  'Philadelphia': { lat: 39.9526, lng: -75.1652 },
  'Philadelphia, Pennsylvania': { lat: 39.9526, lng: -75.1652 },
  'San Antonio': { lat: 29.4241, lng: -98.4936 },
  'San Antonio, Texas': { lat: 29.4241, lng: -98.4936 },
  'Dallas': { lat: 32.7767, lng: -96.7970 },
  'Dallas, Texas': { lat: 32.7767, lng: -96.7970 },
  'Austin': { lat: 30.2672, lng: -97.7431 },
  'Austin, Texas': { lat: 30.2672, lng: -97.7431 },
  'Seattle': { lat: 47.6062, lng: -122.3321 },
  'Seattle, Washington': { lat: 47.6062, lng: -122.3321 },
  'Denver': { lat: 39.7392, lng: -104.9903 },
  'Denver, Colorado': { lat: 39.7392, lng: -104.9903 },
  'Boston': { lat: 42.3601, lng: -71.0589 },
  'Boston, Massachusetts': { lat: 42.3601, lng: -71.0589 },
  'Portland': { lat: 45.5152, lng: -122.6784 },
  'Portland, Oregon': { lat: 45.5152, lng: -122.6784 },
  'Portland, Maine': { lat: 43.6591, lng: -70.2568 },
  'Miami': { lat: 25.7617, lng: -80.1918 },
  'Miami, Florida': { lat: 25.7617, lng: -80.1918 },
  'Atlanta': { lat: 33.7490, lng: -84.3880 },
  'Atlanta, Georgia': { lat: 33.7490, lng: -84.3880 },
  'Las Vegas': { lat: 36.1699, lng: -115.1398 },
  'Las Vegas, Nevada': { lat: 36.1699, lng: -115.1398 },
  'Detroit': { lat: 42.3314, lng: -83.0458 },
  'Detroit, Michigan': { lat: 42.3314, lng: -83.0458 },
  'Minneapolis': { lat: 44.9778, lng: -93.2650 },
  'Minneapolis, Minnesota': { lat: 44.9778, lng: -93.2650 },
  'Tampa': { lat: 27.9506, lng: -82.4572 },
  'Tampa, Florida': { lat: 27.9506, lng: -82.4572 },
  'Nashville': { lat: 36.1627, lng: -86.7816 },
  'Nashville, Tennessee': { lat: 36.1627, lng: -86.7816 },
  'Charlotte': { lat: 35.2271, lng: -80.8431 },
  'Charlotte, North Carolina': { lat: 35.2271, lng: -80.8431 },
  
  // California Cities
  'Oakland': { lat: 37.8044, lng: -122.2712 },
  'Long Beach': { lat: 33.7701, lng: -118.1937 },
  'San Diego': { lat: 32.7157, lng: -117.1611 },
  'Orange': { lat: 33.7879, lng: -117.8531 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Los Angeles, California': { lat: 34.0522, lng: -118.2437 },
  'San Francisco': { lat: 37.7749, lng: -122.4194 },
  'San Francisco, California': { lat: 37.7749, lng: -122.4194 },
  'Sacramento': { lat: 38.5816, lng: -121.4944 },
  'Sacramento, California': { lat: 38.5816, lng: -121.4944 },
  'San Jose': { lat: 37.3382, lng: -121.8863 },
  'San Jose, California': { lat: 37.3382, lng: -121.8863 },
  'Fresno': { lat: 36.7378, lng: -119.7871 },
  'Fresno, California': { lat: 36.7378, lng: -119.7871 },
  
  // Oklahoma Cities
  'Oklahoma City': { lat: 35.4676, lng: -97.5164 },
  'Oklahoma City, Oklahoma': { lat: 35.4676, lng: -97.5164 },
  'Tulsa': { lat: 36.1540, lng: -95.9928 },
  'Tulsa, Oklahoma': { lat: 36.1540, lng: -95.9928 },
  'Broken Arrow': { lat: 36.0526, lng: -95.7969 },
  'Broken Arrow, Oklahoma': { lat: 36.0526, lng: -95.7969 },
  'Norman': { lat: 35.2226, lng: -97.4395 },
  'Norman, Oklahoma': { lat: 35.2226, lng: -97.4395 },
  'Edmond': { lat: 35.6528, lng: -97.4781 },
  'Edmond, Oklahoma': { lat: 35.6528, lng: -97.4781 },
  'Midwest City': { lat: 35.4495, lng: -97.3967 },
  'Midwest City, Oklahoma': { lat: 35.4495, lng: -97.3967 },
  'Enid': { lat: 36.3956, lng: -97.8784 },
  'Enid, Oklahoma': { lat: 36.3956, lng: -97.8784 },
  'Stillwater': { lat: 36.1156, lng: -97.0584 },
  'Stillwater, Oklahoma': { lat: 36.1156, lng: -97.0584 },
  'Lawton': { lat: 34.6036, lng: -98.3959 },
  'Lawton, Oklahoma': { lat: 34.6036, lng: -98.3959 },
  'Moore': { lat: 35.3395, lng: -97.4867 },
  'Moore, Oklahoma': { lat: 35.3395, lng: -97.4867 },
  
  // Kansas Cities
  'Shawnee': { lat: 39.0228, lng: -94.7200 },
  'Shawnee, Kansas': { lat: 39.0228, lng: -94.7200 },
  'Lenexa': { lat: 38.9536, lng: -94.7336 },
  'Lenexa, Kansas': { lat: 38.9536, lng: -94.7336 },
  'Manhattan': { lat: 39.1836, lng: -96.5717 },
  'Manhattan, Kansas': { lat: 39.1836, lng: -96.5717 },
  'Manhattan, New York': { lat: 40.7831, lng: -73.9712 },
  'Wichita': { lat: 37.6872, lng: -97.3301 },
  'Wichita, Kansas': { lat: 37.6872, lng: -97.3301 },
  'Overland Park': { lat: 38.9822, lng: -94.6708 },
  'Overland Park, Kansas': { lat: 38.9822, lng: -94.6708 },
  'Olathe': { lat: 38.8814, lng: -94.8191 },
  'Olathe, Kansas': { lat: 38.8814, lng: -94.8191 },
  'Topeka': { lat: 39.0473, lng: -95.6752 },
  'Topeka, Kansas': { lat: 39.0473, lng: -95.6752 },
  'Lawrence': { lat: 38.9717, lng: -95.2353 },
  'Lawrence, Kansas': { lat: 38.9717, lng: -95.2353 },
  
  // Alaska Cities
  'Fairbanks': { lat: 64.8378, lng: -147.7164 },
  'Fairbanks, Alaska': { lat: 64.8378, lng: -147.7164 },
  'Anchorage': { lat: 61.2181, lng: -149.9003 },
  'Anchorage, Alaska': { lat: 61.2181, lng: -149.9003 },
  'Juneau': { lat: 58.3019, lng: -134.4197 },
  'Juneau, Alaska': { lat: 58.3019, lng: -134.4197 },
  'Sitka': { lat: 57.0531, lng: -135.3300 },
  'Sitka, Alaska': { lat: 57.0531, lng: -135.3300 },
  'Ketchikan': { lat: 55.3422, lng: -131.6461 },
  'Ketchikan, Alaska': { lat: 55.3422, lng: -131.6461 },
  
  // Hawaii Cities
  'Honolulu': { lat: 21.3099, lng: -157.8581 },
  'Honolulu, Hawaii': { lat: 21.3099, lng: -157.8581 },
  'Hilo': { lat: 19.7297, lng: -155.0900 },
  'Hilo, Hawaii': { lat: 19.7297, lng: -155.0900 },
  
  // Additional Major Cities
  'Memphis': { lat: 35.1495, lng: -90.0490 },
  'Memphis, Tennessee': { lat: 35.1495, lng: -90.0490 },
  'Louisville': { lat: 38.2527, lng: -85.7585 },
  'Louisville, Kentucky': { lat: 38.2527, lng: -85.7585 },
  'Milwaukee': { lat: 43.0389, lng: -87.9065 },
  'Milwaukee, Wisconsin': { lat: 43.0389, lng: -87.9065 },
  'St. Louis': { lat: 38.6270, lng: -90.1994 },
  'St. Louis, Missouri': { lat: 38.6270, lng: -90.1994 },
  'Salt Lake City': { lat: 40.7608, lng: -111.8910 },
  'Salt Lake City, Utah': { lat: 40.7608, lng: -111.8910 },
  'Boise': { lat: 43.6150, lng: -116.2023 },
  'Boise, Idaho': { lat: 43.6150, lng: -116.2023 },
  'Richmond': { lat: 37.5407, lng: -77.4360 },
  'Richmond, Virginia': { lat: 37.5407, lng: -77.4360 },
  'Orlando': { lat: 28.5383, lng: -81.3792 },
  'Orlando, Florida': { lat: 28.5383, lng: -81.3792 },
  
  // Common duplicate city names
  'Springfield': { lat: 37.2090, lng: -93.2923 }, // Default: Missouri
  'Springfield, Missouri': { lat: 37.2090, lng: -93.2923 },
  'Springfield, Illinois': { lat: 39.7817, lng: -89.6501 },
  'Springfield, Massachusetts': { lat: 42.1015, lng: -72.5898 },
  'Springfield, Ohio': { lat: 39.9242, lng: -83.8088 },
};

function getRiskLevel(avgHealthScore: number): 'Low' | 'Medium' | 'High' {
  if (avgHealthScore >= 70) return 'Low';
  if (avgHealthScore >= 40) return 'Medium';
  return 'High';
}

function getRiskColor(riskLevel: 'Low' | 'Medium' | 'High'): string {
  switch (riskLevel) {
    case 'Low':
      return '#10B981'; // Green
    case 'Medium':
      return '#F59E0B'; // Yellow
    case 'High':
      return '#D92D20'; // Red
  }
}

/**
 * Get coordinates for a city - FAST synchronous lookup
 * Tries City+State first, then city only
 */
function getCityCoordinates(city: string, state?: string | null): { lat: number; lng: number } | null {
  const normalizedCity = city.trim();
  
  // First, try exact match with "City, State" format (most accurate)
  if (state) {
    const cityStateKey = `${normalizedCity}, ${state.trim()}`;
    if (CITY_COORDINATES[cityStateKey]) {
      console.log(`[Map Utils] Found coordinates for ${cityStateKey}`);
      return CITY_COORDINATES[cityStateKey];
    }
  }
  
  // Second, try city name only (exact match)
  if (CITY_COORDINATES[normalizedCity]) {
    console.log(`[Map Utils] Found coordinates for ${normalizedCity}`);
    return CITY_COORDINATES[normalizedCity];
  }
  
  // No coordinates available
  console.warn(`[Map Utils] No coordinates found for "${normalizedCity}"${state ? `, ${state}` : ''}. Add to CITY_COORDINATES.`);
  return null;
}

export function calculateCityAggregates(accounts: AccountListItem[]): CityAggregate[] {
  const cityMap = new Map<string, AccountListItem[]>();
  
  accounts.forEach(account => {
    const city = account.client_address?.city?.trim();
    
    if (!city) {
      return;
    }
    
    if (!cityMap.has(city)) {
      cityMap.set(city, []);
    }
    cityMap.get(city)!.push(account);
  });
  
  const aggregates: CityAggregate[] = [];
  
  cityMap.forEach((cityAccounts, city) => {
    const accountCount = cityAccounts.length;
    
    const healthScores = cityAccounts
      .map(acc => acc.ai_health_score || 0)
      .filter(score => score > 0);
    
    const avgHealthScore = healthScores.length > 0
      ? healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length
      : 0;
    
    // Sum all account values and convert to millions
    const totalValueInDollars = cityAccounts.reduce((sum, acc) => sum + (acc.total_value || 0), 0);
    const totalValue = totalValueInDollars / 1000000; // Convert to millions
    
    const riskLevel = getRiskLevel(avgHealthScore);
    const riskColor = getRiskColor(riskLevel);
    
    // Get coordinates for this city (use state from first account in the group)
    const state = cityAccounts[0]?.client_address?.state;
    const position = getCityCoordinates(city, state);
    
    // Skip cities without valid coordinates
    if (!position) {
      console.warn(`[Map Utils] Skipping ${city}${state ? `, ${state}` : ''} (${accountCount} accounts)`);
      return;
    }
    
    aggregates.push({
      city,
      accountCount,
      avgHealthScore,
      totalValue,
      riskLevel,
      riskColor,
      position,
    });
  });
  
  console.log(`[Map Utils] Processed ${aggregates.length}/${cityMap.size} cities with coordinates`);
  
  return aggregates;
}
