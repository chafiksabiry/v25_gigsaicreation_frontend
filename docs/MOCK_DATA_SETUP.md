# Mock Data Configuration

## Overview
To avoid consuming OpenAI API credits during development and testing, you can enable mock data mode.

## How to Enable Mock Mode

### Method 1: Environment Variable (Recommended)
1. Create a `.env.local` file in the project root
2. Add the following line:
```
VITE_USE_MOCK_DATA=true
```
3. Restart your development server

### Method 2: Direct Code Modification
In `src/lib/ai.ts`, change:
```typescript
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;
```
to:
```typescript
const USE_MOCK_DATA = true;
```

## Features

### Mock Data Includes:
- ✅ Job titles and descriptions
- ✅ Skills (technical, professional, soft)
- ✅ Schedule and availability
- ✅ Commission structure
- ✅ Team composition
- ✅ Industries and activities
- ✅ Destination zones

### Visual Indicators:
- 🎭 "Mock Mode Active" badge appears in the header when enabled
- Console logs show "🎭 MOCK MODE ENABLED" messages

## Benefits

1. **No API Costs**: Avoid OpenAI API charges during development
2. **Faster Testing**: No network delays, instant responses
3. **Consistent Data**: Same data structure for reliable testing
4. **Offline Development**: Work without internet connection

## Switching Back to Real API

Set `VITE_USE_MOCK_DATA=false` or remove the environment variable entirely.

## Mock Data Location

Mock data is defined in `src/lib/mockData.ts` and can be customized as needed.
