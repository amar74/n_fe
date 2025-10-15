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

  'Oakland': { lat: 37.8044, lng: -122.2712 },
  'Long Beach': { lat: 33.7701, lng: -118.1937 },
  'San Diego': { lat: 32.7157, lng: -117.1611 },
  'Orange': { lat: 33.7879, lng: -117.8531 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'San Francisco': { lat: 37.7749, lng: -122.4194 },
  'Sacramento': { lat: 38.5816, lng: -121.4944 },
  'San Jose': { lat: 37.3382, lng: -121.8863 },
  'Fresno': { lat: 36.7378, lng: -119.7871 },
  
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

function getCityCoordinates(city: string): { lat: number; lng: number } {

  const normalizedCity = city.trim();
  
  if (CITY_COORDINATES[normalizedCity]) {
    return CITY_COORDINATES[normalizedCity];
  }
  
  const partialMatch = Object.keys(CITY_COORDINATES).find(key => 
    normalizedCity.toLowerCase().includes(key.toLowerCase()) ||
    key.toLowerCase().includes(normalizedCity.toLowerCase())
  );
  
  if (partialMatch) {
    return CITY_COORDINATES[partialMatch];
  }
  return { lat: 39.8283, lng: -98.5795 }; 
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
    
    const totalValue = cityAccounts.reduce((sum, acc) => sum + (acc.total_value || 0), 0);
    
    const riskLevel = getRiskLevel(avgHealthScore);
    const riskColor = getRiskColor(riskLevel);
    
    const position = getCityCoordinates(city);
    
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
