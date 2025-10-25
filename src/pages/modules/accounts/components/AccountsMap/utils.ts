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

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // California Cities
  'Oakland': { lat: 37.8044, lng: -122.2712 },
  'Long Beach': { lat: 33.7701, lng: -118.1937 },
  'San Diego': { lat: 32.7157, lng: -117.1611 },
  'Orange': { lat: 33.7879, lng: -117.8531 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'San Francisco': { lat: 37.7749, lng: -122.4194 },
  'Sacramento': { lat: 38.5816, lng: -121.4944 },
  'San Jose': { lat: 37.3382, lng: -121.8863 },
  'Fresno': { lat: 36.7378, lng: -119.7871 },
  
  // Major US Cities
  'New York': { lat: 40.7128, lng: -74.0060 },
  'Chicago': { lat: 41.8781, lng: -87.6298 },
  'Houston': { lat: 29.7604, lng: -95.3698 },
  'Phoenix': { lat: 33.4484, lng: -112.0740 },
  'Philadelphia': { lat: 39.9526, lng: -75.1652 },
  'San Antonio': { lat: 29.4241, lng: -98.4936 },
  'Dallas': { lat: 32.7767, lng: -96.7970 },
  'Austin': { lat: 30.2672, lng: -97.7431 },
  'Seattle': { lat: 47.6062, lng: -122.3321 },
  'Denver': { lat: 39.7392, lng: -104.9903 },
  'Boston': { lat: 42.3601, lng: -71.0589 },
  'Portland': { lat: 45.5152, lng: -122.6784 },
  'Miami': { lat: 25.7617, lng: -80.1918 },
  'Atlanta': { lat: 33.7490, lng: -84.3880 },
  'Las Vegas': { lat: 36.1699, lng: -115.1398 },
  'Detroit': { lat: 42.3314, lng: -83.0458 },
  'Minneapolis': { lat: 44.9778, lng: -93.2650 },
  'Tampa': { lat: 27.9506, lng: -82.4572 },
  'Nashville': { lat: 36.1627, lng: -86.7816 },
  'Charlotte': { lat: 35.2271, lng: -80.8431 },
  
  // Oklahoma Cities
  'Oklahoma City': { lat: 35.4676, lng: -97.5164 },
  'Tulsa': { lat: 36.1540, lng: -95.9928 },
  'Broken Arrow': { lat: 36.0526, lng: -95.7969 },
  'Norman': { lat: 35.2226, lng: -97.4395 },
  'Edmond': { lat: 35.6528, lng: -97.4781 },
  'Moore': { lat: 35.3395, lng: -97.4867 },
  'Midwest City': { lat: 35.4495, lng: -97.3967 },
  'Enid': { lat: 36.3956, lng: -97.8784 },
  'Stillwater': { lat: 36.1156, lng: -97.0584 },
  'Lawton': { lat: 34.6036, lng: -98.3959 },
  
  // Additional Major Cities
  'Memphis': { lat: 35.1495, lng: -90.0490 },
  'Louisville': { lat: 38.2527, lng: -85.7585 },
  'Milwaukee': { lat: 43.0389, lng: -87.9065 },
  'Kansas City': { lat: 39.0997, lng: -94.5786 },
  'Columbus': { lat: 39.9612, lng: -82.9988 },
  'Indianapolis': { lat: 39.7684, lng: -86.1581 },
  'Jacksonville': { lat: 30.3322, lng: -81.6557 },
  'Fort Worth': { lat: 32.7555, lng: -97.3308 },
  'Baltimore': { lat: 39.2904, lng: -76.6122 },
  'Washington': { lat: 38.9072, lng: -77.0369 },
  'Washington DC': { lat: 38.9072, lng: -77.0369 },
  'Albuquerque': { lat: 35.0844, lng: -106.6504 },
  'Tucson': { lat: 32.2226, lng: -110.9747 },
  'Mesa': { lat: 33.4152, lng: -111.8315 },
  'Virginia Beach': { lat: 36.8529, lng: -75.9780 },
  'Omaha': { lat: 41.2565, lng: -95.9345 },
  'Colorado Springs': { lat: 38.8339, lng: -104.8214 },
  'Raleigh': { lat: 35.7796, lng: -78.6382 },
};

export function getRiskLevel(healthScore: number): 'Low' | 'Medium' | 'High' {
  if (healthScore > 70) return 'Low';
  if (healthScore >= 40) return 'Medium';
  return 'High';
}

export function getRiskColor(riskLevel: 'Low' | 'Medium' | 'High'): string {
  switch (riskLevel) {
    case 'Low':
      return '#039855'; // Green
    case 'Medium':
      return '#DC6803'; // Orange
    case 'High':
      return '#D92D20'; // Red
  }
}

function getCityCoordinates(city: string): { lat: number; lng: number } | null {
  const normalizedCity = city.trim();
  
  // Exact match
  if (CITY_COORDINATES[normalizedCity]) {
    console.log(`[Utils] ✅ Found exact coordinates for ${normalizedCity}`);
    return CITY_COORDINATES[normalizedCity];
  }
  
  // Partial match
  const partialMatch = Object.keys(CITY_COORDINATES).find(key => 
    normalizedCity.toLowerCase().includes(key.toLowerCase()) ||
    key.toLowerCase().includes(normalizedCity.toLowerCase())
  );
  
  if (partialMatch) {
    console.log(`[Utils] ✅ Found partial match for ${normalizedCity}: ${partialMatch}`);
    return CITY_COORDINATES[partialMatch];
  }
  
  // No match found
  console.warn(`[Utils] ⚠️ No coordinates found for city: "${normalizedCity}". Skipping this location.`);
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
    
    // abhishek.softication - quick fix, need proper solution
    const avgHealthScore = healthScores.length > 0
      ? healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length
      : 0;
    
    // Sum all account values and convert to millions
    const totalValueInDollars = cityAccounts.reduce((sum, acc) => sum + (acc.total_value || 0), 0);
    const totalValue = totalValueInDollars / 1000000; // Convert to millions
    
    const riskLevel = getRiskLevel(avgHealthScore);
    const riskColor = getRiskColor(riskLevel);
    
    // Get coordinates for this city
    const position = getCityCoordinates(city);
    
    // Skip cities without valid coordinates
    if (!position) {
      console.warn(`[Utils] ⚠️ Skipping ${city} (${accountCount} accounts) - no coordinates available`);
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
  
  return aggregates.sort((a, b) => b.accountCount - a.accountCount);
}
