# Accounts Map Component

The Accounts Map component provides a geospatial visualization of your accounts, showing them aggregated by city with risk levels and health scores.

## Features

- **City Aggregation**: Automatically groups accounts by city
- **Risk Visualization**: Color-coded markers based on AI Health Score
  - 🟢 Green (Low Risk): Health Score > 70%
  - 🟠 Orange (Medium Risk): Health Score 40-70%
  - 🔴 Red (High Risk): Health Score < 40%
- **Interactive Info Windows**: Click on markers to see:
  - Total accounts in that city
  - Average AI Health Score
  - Risk level
  - Total portfolio value
- **Marker Sizing**: Marker size scales with the number of accounts
- **Auto-fit Bounds**: Map automatically adjusts to show all account locations

## Setup

### 1. Google Maps API Key

This component requires a Google Maps API key. Follow these steps:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API (for autocomplete in forms)
4. Create an API key:
   - Go to **APIs & Services > Credentials**
   - Click **Create Credentials > API Key**
   - Copy the generated API key
5. Add the API key to your `.env` file:
   ```bash
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

### 2. API Key Restrictions (Recommended for Production)

Secure your API key by adding restrictions:

1. In Google Cloud Console, click on your API key
2. Under **API restrictions**, select **Restrict key**
3. Select:
   - Maps JavaScript API
   - Places API
4. Under **Application restrictions**, select **HTTP referrers**
5. Add your domains:
   ```
   http://localhost:5173/*
   http://localhost:5174/*
   https://yourdomain.com/*
   ```

## City Coordinates

The component includes a built-in cache of coordinates for major US cities. If an account's city is not in the cache:
- The component will try to find a partial match
- If no match is found, it will log a warning and use a default location (US center)

### Adding More Cities

To add more cities, edit the `CITY_COORDINATES` object in `utils.ts`:

```typescript
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // ... existing cities
  'Your City': { lat: 40.7128, lng: -74.0060 },
};
```

## Customization

### Map Styles

The map uses a custom light theme optimized for data visualization. To customize:

1. Edit the `styles` array in `AccountsMap.tsx`
2. Use [Google Maps Styling Wizard](https://mapstyle.withgoogle.com/) for easier customization

### Risk Level Thresholds

To adjust risk level thresholds, edit the `getRiskLevel` function in `utils.ts`:

```typescript
export function getRiskLevel(healthScore: number): 'Low' | 'Medium' | 'High' {
  if (healthScore > 80) return 'Low';    // Change from 70
  if (healthScore >= 50) return 'Medium'; // Change from 40
  return 'High';
}
```

### Marker Colors

To change risk colors, edit the `getRiskColor` function in `utils.ts`:

```typescript
export function getRiskColor(riskLevel: 'Low' | 'Medium' | 'High'): string {
  switch (riskLevel) {
    case 'Low':
      return '#10B981'; // Your custom green
    case 'Medium':
      return '#F59E0B'; // Your custom orange
    case 'High':
      return '#EF4444'; // Your custom red
  }
}
```

## Troubleshooting

### Map Not Loading

**Error: "Google Maps API key is missing"**
- Solution: Add `VITE_GOOGLE_MAPS_API_KEY` to your `.env` file

**Error: "Google Maps authentication failed"**
- Solution: Check that your API key is valid and has the Maps JavaScript API enabled

**Error: "This URL is not authorized"**
- Solution: Add your domain to the API key's HTTP referrer restrictions

### Cities Not Showing

**Issue: Account locations not appearing on map**
- Check that accounts have a `city` field in their address
- Verify the city name matches an entry in `CITY_COORDINATES`
- Check browser console for warnings about missing cities

### Performance

For large numbers of accounts (>1000):
- Consider implementing marker clustering
- Add pagination or filtering
- Use server-side aggregation

## Dependencies

- Google Maps JavaScript API
- `@types/google.maps` (already installed)
- React 19+
- TypeScript

## Integration

The map component is automatically integrated into the Accounts page at `/module/accounts`. It receives the `accounts` prop from the parent component and handles all visualization logic internally.

```tsx
import { AccountsMap } from './components/AccountsMap';

<AccountsMap accounts={accounts} />
```

## Future Enhancements

Potential improvements:
- **Marker Clustering**: Group nearby markers for better performance
- **Heat Map**: Show account density as a heat overlay
- **Geocoding API**: Dynamically geocode unknown cities
- **Drawing Tools**: Allow users to draw regions and filter accounts
- **Export**: Export visible accounts based on map bounds
- **Filters**: Filter by risk level, tier, or market sector directly on the map
