# 📦 Cached Weather Integration

## Overview
The cached weather feature displays weather data that has been previously fetched and stored in the backend's in-memory cache. This allows users to view historical weather queries without making new API calls.

## Backend API Endpoints

### 1. Get Single Cached Result
**Endpoint:** `GET /api/weather/result?city={city}`

**Description:** Returns the cached/latest weather result for a specific city (no live fetch)

**Query Parameters:**
- `city` (required): City name

**Response:**
```json
{
  "city": "Hanoi",
  "temperature": 28.5,
  "fetched_at": "2025-11-29T12:00:00Z"
}
```

**Status Codes:**
- `200`: Success - Returns cached data
- `400`: Bad Request - Missing city parameter
- `404`: Not Found - No cached data for this city

### 2. Get All Cached Results
**Endpoint:** `GET /api/weather/results`

**Description:** Returns all cached weather records (city, temperature, fetched_at)

**Optional Query Parameters for Filtering:**
- `day`: Filter by day (1-31)
- `month`: Filter by month (1-12)
- `year`: Filter by year (e.g., 2025)

**Response:**
```json
[
  {
    "city": "Hanoi",
    "temperature": 28.5,
    "fetched_at": "2025-11-29T12:00:00Z"
  },
  {
    "city": "Ho Chi Minh City",
    "temperature": 32.1,
    "fetched_at": "2025-11-29T11:30:00Z"
  }
]
```

**Example with Filters:**
```
GET /api/weather/results?day=29&month=11&year=2025
```

## Frontend Components

### 1. CachedWeatherResults Component
**Location:** `fe/src/components/CachedWeatherResults.tsx`

**Purpose:** Displays all cached weather records in a beautiful grid layout

**Features:**
- ✨ Auto-loads all cached data on mount
- 🔄 Refresh button to reload data
- 🎨 Color-coded temperatures (red=hot, orange=warm, blue=cool, light-blue=cold)
- 📅 Formatted timestamps
- 📊 Record count display
- 🎭 Empty state handling
- ⚡ Hover effects for better UX
- 🚫 Error handling

**Temperature Color Coding:**
- 🔴 **≥30°C**: Red (#ff3b30) - Hot
- 🟠 **≥20°C**: Orange (#ff9500) - Warm
- 🔵 **≥10°C**: Blue (#007aff) - Cool
- 💙 **<10°C**: Light Blue (#5ac8fa) - Cold

**Design:**
- Apple-style glassmorphism
- 3-column grid per record (City | Temperature | Timestamp)
- Smooth hover animations
- Responsive layout

### 2. CachedWeatherLookup Component
**Location:** `fe/src/components/CachedWeatherLookup.tsx`

**Purpose:** Search and display cached data for a specific city

**Features:**
- 🔍 Search input with auto-focus
- ⌨️ Enter key support for quick search
- 🎯 Single city result display
- 🌡️ Large temperature display with color coding
- 📅 Formatted timestamp
- ⚠️ Error messages for not found cities
- ⚡ Loading states

**Design:**
- Search bar with Apple-style focus effects
- Large, prominent temperature display (56px font)
- Clean result card with metadata
- Consistent color scheme

### 3. Integration in WeatherDateFilter
The date filtering component also uses the cached results API with date filters to show historical weather data.

## Component Layout in App

The app displays components in this order:
1. **Weather Data Dashboard** (Header)
2. **WeatherDateFilter** - Search with date filtering
3. **CachedWeatherLookup** - Single city lookup
4. **CachedWeatherResults** - All cached records
5. **FloodResultsList** - Flood risk data

## Usage Examples

### Display All Cached Results
```tsx
import { CachedWeatherResults } from "./components/CachedWeatherResults";

<CachedWeatherResults />
```

The component automatically:
- Fetches all cached data on mount
- Displays results in a grid
- Shows empty state if no data
- Handles errors gracefully

### Lookup Specific City
```tsx
import { CachedWeatherLookup } from "./components/CachedWeatherLookup";

<CachedWeatherLookup />
```

User can:
- Type city name
- Press Enter or click Search
- View cached result if available
- See error if city not in cache

## Data Flow

### All Results Flow
```
Component Mount
    ↓
useEffect() → getResults()
    ↓
Fetch /api/weather/results
    ↓
Display in grid layout
```

### Single City Lookup Flow
```
User Input: "Hanoi"
    ↓
User clicks Search (or Enter)
    ↓
getResult("Hanoi")
    ↓
Fetch /api/weather/result?city=Hanoi
    ↓
Display result card or error
```

## API Integration

Both components use the existing API functions from `fe/src/api.ts`:

```typescript
// Get all cached results
export async function getResults(): Promise<any[]> {
  const resp = await fetch('/api/weather/results');
  return resp.json();
}

// Get single cached result
export async function getResult(city: string): Promise<any> {
  const url = `/api/weather/result?city=${encodeURIComponent(city)}`;
  const resp = await fetch(url);
  return resp.json();
}
```

## Error Handling

### CachedWeatherResults
- **Network Error**: Displays error banner with message
- **Empty Cache**: Shows friendly empty state with icon
- **Loading**: Shows loading indicator

### CachedWeatherLookup
- **Empty Input**: Validates before searching
- **City Not Found**: Shows error message (404)
- **Network Error**: Displays API error message
- **Loading**: Disables button and shows loading text

## Visual Design

### Color Scheme
- **Background**: White with 95% opacity + blur
- **Cards**: Light gray (rgba(242, 242, 247, 0.95))
- **Text**: Black (#000000) for primary, gray (#86868b) for secondary
- **Accents**: Apple blue (#007aff)
- **Borders**: Subtle black with 8-12% opacity

### Typography
- **Font**: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- **Headers**: 24px, bold (700)
- **Body**: 15-17px, regular (400)
- **Labels**: 11-13px, medium (500), uppercase

### Effects
- **Glassmorphism**: backdrop-filter: blur(20px)
- **Shadows**: Soft, layered shadows
- **Hover**: Transform, background, and shadow changes
- **Transitions**: Smooth 0.2s ease

## Integration Benefits

1. **No Duplicate API Calls**: View cached data without fetching
2. **Performance**: Instant display from cache
3. **History**: See previous weather queries
4. **Quick Lookup**: Find specific city data fast
5. **Date Filtering**: Filter by day/month/year
6. **Beautiful UI**: Apple-style design

## Testing

To test the cached weather integration:

1. **Start Backend**: `cd be && go run cmd/weatherd/main.go`
2. **Start Frontend**: `cd fe && npm run dev`
3. **Fetch Some Weather**: Use the date filter to fetch weather for cities
4. **View Cached Results**: Scroll down to see all cached records
5. **Lookup City**: Use the lookup component to search for a specific city
6. **Test Refresh**: Click the refresh button to reload data
7. **Test Empty State**: Check when no data is cached
8. **Test Not Found**: Search for a city not in cache

## Cache Behavior

- **Backend Storage**: In-memory map (lost on restart)
- **Auto-Population**: Cache fills when users fetch weather
- **No Expiration**: Cache persists until server restart
- **Per-City**: One entry per city (overwritten on new fetch)

## Future Enhancements

Potential improvements:
1. **Pagination**: Handle large datasets
2. **Sorting**: Sort by date, temperature, or city name
3. **Filtering**: Filter by temperature range
4. **Export**: Download cached data as CSV/JSON
5. **Charts**: Visualize temperature trends
6. **Comparison**: Compare temperatures across cities
7. **Persistence**: Save cache to database
8. **TTL**: Add time-to-live for cache entries

## Notes

- Cache is populated when users fetch weather via `/api/weather/current`
- Each city has one cache entry (updated on each fetch)
- The backend returns empty array `[]` if no cached data exists
- Timestamps are in ISO 8601 format
- Frontend displays user-friendly formatted dates
