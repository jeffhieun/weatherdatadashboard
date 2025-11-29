# 🌊 Flood Risk Integration

## Overview
The flood risk feature has been successfully integrated with the backend API. The system automatically fetches and displays flood risk assessment data when a user selects a city.

## Backend API Endpoints

### 1. Get Flood Risk
**Endpoint:** `GET /api/flood/risk`

**Query Parameters:**
- `latitude` (required): Latitude coordinate
- `longitude` (required): Longitude coordinate

**Response:**
```json
{
  "flood_risk": "high|medium|low",
  "probability": 0.85,
  "coords": {
    "lat": 10.5,
    "lon": 106.5
  }
}
```

**Risk Logic:**
- **High Risk**: Latitude 8-12°, Longitude 104-110° (coastal/low-lying areas) - 85% probability
- **Medium Risk**: Latitude 16-22°, Longitude 105-108° (mid-elevation) - 55% probability
- **Low Risk**: All other areas - 15% probability

### 2. List Flood Results
**Endpoint:** `GET /api/flood/results`

**Response:**
```json
[
  {
    "city": "Hanoi",
    "risk": "high",
    "probability": 0.82,
    "fetched_at": "2025-11-29T12:00:00Z"
  },
  {
    "city": "Ho Chi Minh City",
    "risk": "medium",
    "probability": 0.55,
    "fetched_at": "2025-11-29T12:00:00Z"
  }
]
```

## Frontend Components

### 1. FloodRiskDisplay Component
**Location:** `fe/src/components/FloodRiskDisplay.tsx`

**Features:**
- Color-coded risk levels (red=high, orange=medium, green=low)
- Displays probability percentage
- Shows coordinates (latitude/longitude)
- Apple-style glassmorphism design
- Automatic updates when city is selected

**Props:**
```typescript
interface Props {
  data: FloodRiskData;
  cityName?: string;
}
```

### 2. FloodResultsList Component
**Location:** `fe/src/components/FloodResultsList.tsx`

**Features:**
- Displays cached flood risk assessments
- Auto-loads on component mount
- Color-coded risk badges
- Shows timestamp for each assessment
- Empty state handling
- Error handling with user-friendly messages

### 3. API Helper
**Location:** `fe/src/api/flood.ts`

**Functions:**
```typescript
// Fetch flood risk for specific coordinates
fetchFloodRisk(latitude: number, longitude: number): Promise<FloodRiskData>

// Get list of cached flood results
fetchFloodResults(): Promise<FloodResult[]>
```

## Integration with WeatherDateFilter

The flood risk feature is seamlessly integrated into the `WeatherDateFilter` component:

1. **Automatic Loading**: When a user selects a city from the auto-suggest dropdown, the component automatically:
   - Fetches weather details
   - Fetches flood risk data using the city's coordinates

2. **Display Order**:
   - Filter inputs (City + Date)
   - Weather details (temperature, humidity, wind, etc.)
   - **Flood risk assessment** (risk level, probability, coordinates)

3. **Loading States**: Separate loading indicators for weather and flood data

4. **Clear Function**: Clearing filters also resets flood risk data

## Visual Design

### Risk Level Colors
- 🔴 **High Risk**: Red (#ff3b30) with light red background
- 🟠 **Medium Risk**: Orange (#ff9500) with light orange background
- 🟢 **Low Risk**: Green (#34c759) with light green background

### Layout
- **Grid Design**: 2-column layout for risk level and probability
- **Coordinate Display**: Horizontal layout with separator
- **Glassmorphism**: Consistent Apple-style design with blur effects
- **Responsive**: Clean layout that matches the weather detail component

## Usage Flow

1. **User selects a city** from the auto-suggest dropdown
2. **System fetches** weather details and flood risk simultaneously
3. **Display shows**:
   - Weather metrics (temperature, humidity, wind, etc.)
   - Flood risk assessment (risk level, probability)
   - Coordinates of the selected location
4. **Bottom section** displays cached flood results for quick reference

## Data Flow

```
User Selection
    ↓
CityAutoSuggest → handleSelectCity()
    ↓
Parallel API Calls:
    ├─→ fetchWeatherDetails(city.name)
    └─→ fetchFloodRisk(city.lat, city.lon)
    ↓
State Updates:
    ├─→ setWeatherDetails()
    └─→ setFloodRisk()
    ↓
Component Rendering:
    ├─→ WeatherDetail component
    └─→ FloodRiskDisplay component
```

## Error Handling

- **API Errors**: Gracefully caught and logged to console
- **Failed Requests**: Component shows nothing if data fetch fails
- **Loading States**: Clear loading indicators for better UX
- **Network Issues**: User-friendly error messages in FloodResultsList

## Future Enhancements

Potential improvements for production:
1. **Real Data Integration**: Connect to actual flood prediction APIs
2. **Historical Data**: Store and display flood risk trends
3. **Map Visualization**: Show flood risk zones on an interactive map
4. **Alerts**: Push notifications for high-risk areas
5. **Caching Strategy**: Implement proper caching for flood results
6. **User Preferences**: Save favorite locations for monitoring

## Testing

To test the flood risk integration:

1. Start the backend server: `cd be && go run cmd/weatherd/main.go`
2. Start the frontend: `cd fe && npm run dev`
3. Select a city (e.g., "Hanoi", "Ho Chi Minh City")
4. Observe the flood risk assessment appear below weather details
5. Check the cached flood results at the bottom of the page

## Notes

- The current backend implementation uses demo/mock data
- Risk calculations are based on hardcoded coordinate ranges
- The `ListFloodResults` endpoint returns static stub data
- Production implementation should integrate with real flood prediction services
