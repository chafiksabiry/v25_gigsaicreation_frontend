# Activities, Industries, and Languages API Integration

## Overview

This document describes the integration of external APIs for activities, industries, and languages data in the gig creation application. The system fetches data from the following endpoints:

- **Activities API**: `https://api-repcreationwizard.harx.ai/api/activities`
- **Industries API**: `https://api-repcreationwizard.harx.ai/api/industries`
- **Languages API**: `https://api-repcreationwizard.harx.ai/api/languages`

## API Endpoints

### Activities API
- **URL**: `https://api-repcreationwizard.harx.ai/api/activities`
- **Method**: GET
- **Response**: JSON array of activity objects with `_id`, `name`, `description`, `category`, `isActive`, etc.

### Industries API
- **URL**: `https://api-repcreationwizard.harx.ai/api/industries`
- **Method**: GET
- **Response**: JSON array of industry objects with `_id`, `name`, `description`, `isActive`, etc.

### Languages API
- **URL**: `https://api-repcreationwizard.harx.ai/api/languages`
- **Method**: GET
- **Response**: JSON array of language objects with `_id`, `name`, `code`, `nativeName`, etc.

### Skills APIs
- **Soft Skills**: `https://api-repcreationwizard.harx.ai/api/skills/soft`
- **Technical Skills**: `https://api-repcreationwizard.harx.ai/api/skills/technical`
- **Professional Skills**: `https://api-repcreationwizard.harx.ai/api/skills/professional`
- **Method**: GET
- **Response**: JSON array of skill objects with `_id`, `name`, `description`, `category`, `isActive`, etc.

## Data Structure

### Activity Object
```typescript
interface Activity {
  _id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  __v: number;
  createdAt: string;
  updatedAt: string;
}
```

### Industry Object
```typescript
interface Industry {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  __v: number;
  createdAt: string;
  updatedAt: string;
}
```

### Language Object
```typescript
interface Language {
  _id: string;
  code: string;
  name: string;
  nativeName: string;
  __v: number;
  createdAt: string;
  lastUpdated: string;
  updatedAt: string;
}
```

### Skill Object
```typescript
interface Skill {
  _id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  __v: number;
  createdAt: string;
  updatedAt: string;
}
```

## Implementation Details

### Core Files

1. **`src/lib/api.ts`**
   - Contains `fetchActivities()`, `fetchIndustries()`, and `fetchLanguages()` functions
   - Handles API calls and error management
   - Returns standardized response format

2. **`src/lib/activitiesIndustries.ts`**
   - Centralized cache management for all three data types
   - Utility functions for ID/name conversion
   - Options generation for UI components

3. **`src/types/index.ts`**
   - TypeScript interfaces for `Activity`, `Industry`, and `Language`
   - Updated `GigData` interface to use IDs instead of names

### Caching Strategy

The system implements a caching mechanism to:
- Reduce API calls
- Improve performance
- Provide offline capability (cached data)

```typescript
let activitiesCache: Activity[] = [];
let industriesCache: Industry[] = [];
let languagesCache: Language[] = [];
let isActivitiesLoaded = false;
let isIndustriesLoaded = false;
let isLanguagesLoaded = false;
```

### Utility Functions

#### Loading Functions
- `loadActivities()`: Fetches and caches activities
- `loadIndustries()`: Fetches and caches industries
- `loadLanguages()`: Fetches and caches languages

#### ID/Name Conversion
- `getActivityNameById(id)`: Converts activity ID to name
- `getIndustryNameById(id)`: Converts industry ID to name
- `getLanguageNameById(id)`: Converts language ID to name
- `getLanguageCodeById(id)`: Gets language code from ID

#### Name to ID Conversion
- `convertActivityNamesToIds(names)`: Converts activity names to IDs
- `convertIndustryNamesToIds(names)`: Converts industry names to IDs
- `convertLanguageNamesToIds(names)`: Converts language names to IDs

#### UI Options Generation
- `getActivityOptions()`: Returns options for activity select components
- `getIndustryOptions()`: Returns options for industry select components
- `getLanguageOptions()`: Returns options for language select components

## OpenAI Integration

### Dynamic Prompt Generation
The AI system dynamically generates prompts using the fetched data:

```typescript
const [activities, industries, languages] = await Promise.all([
  loadActivities(),
  loadIndustries(),
  loadLanguages()
]);

const activityNames = getActivityOptions().map(opt => opt.label);
const industryNames = getIndustryOptions().map(opt => opt.label);
const languageNames = getLanguageOptions().map(opt => opt.label);
```

### Post-Processing
AI-generated results are converted from names to IDs:

```typescript
// Convert industry names to IDs
if (parsedResult.industries && parsedResult.industries.length > 0) {
  const industryIds = convertIndustryNamesToIds(parsedResult.industries);
  parsedResult.industries = industryIds;
}

// Convert activity names to IDs
if (parsedResult.activities && parsedResult.activities.length > 0) {
  const activityIds = convertActivityNamesToIds(parsedResult.activities);
  parsedResult.activities = activityIds;
}

// Convert language names to IDs
if (parsedResult.skills?.languages && parsedResult.skills.languages.length > 0) {
  const languageNames = parsedResult.skills.languages.map((lang: any) => lang.language);
  const languageIds = convertLanguageNamesToIds(languageNames);
  parsedResult.skills.languages = parsedResult.skills.languages.map((lang: any, index: number) => ({
    ...lang,
    language: languageIds[index] || lang.language
  }));
}
```

## UI Components

### Suggestions Component
The `Suggestions.tsx` component has been updated to:
- Load and cache activities, industries, and languages
- Display loading states for each data type
- Handle ID/name conversion in the UI
- Show available counts for each category

### Skills Section
The `SkillsSection.tsx` component has been updated to use APIs instead of mock data:

- **Languages API Integration**: Removed static `LANGUAGES` array and integrated with `loadLanguages()`
- **Skills API Integration**: Replaced direct API calls with centralized functions from `activitiesIndustries.ts`
- **State Management**: Added `languages` and `languagesLoading` states
- **Data Loading**: Modified `fetchSkillsAndLanguages()` to load all data from centralized APIs
- **Display Logic**: Uses `getLanguageNameById()`, `getSoftSkillNameById()`, etc. to display names from stored IDs
- **Add/Edit Operations**: Converts selected names to IDs before storing
- **Validation**: Prevents adding items that don't exist in the APIs
- **Loading States**: Shows loading indicators while data is being fetched
- **Proficiency Levels**: Maintains CEFR levels (A1-C2) for language proficiency
- **Skill Levels**: Maintains 1-5 scale for skill proficiency

## Migration Strategy

### Data Storage
- **Before**: Stored names as strings
- **After**: Store IDs as strings, display names in UI

### Backward Compatibility
- Existing data with names is automatically converted to IDs
- Fallback to name display if ID lookup fails

## Error Handling

### API Failures
- Graceful degradation with empty arrays
- User-friendly error messages
- Retry mechanisms for transient failures

### Data Validation
- Validation of AI-generated results against available options
- Warning logs for invalid selections
- Automatic filtering of invalid data

## Testing

### Test Files
- `src/examples/testAPI.ts`: Tests API connectivity
- `src/examples/testActivitiesIndustries.ts`: Tests activities and industries functionality
- `src/examples/testLanguages.ts`: Tests languages functionality
- `src/examples/testSkillsSection.ts`: Tests SkillsSection language integration
- `src/examples/testSkillsAPI.ts`: Tests skills API integration

### Test Coverage
- API connectivity
- Data loading and caching
- ID/name conversion
- UI options generation
- Error handling

## Benefits

1. **Centralized Data Management**: Single source of truth for activities, industries, and languages
2. **Dynamic Updates**: Changes in the API are automatically reflected in the application
3. **Performance**: Caching reduces API calls and improves response times
4. **Consistency**: Ensures all components use the same data
5. **Scalability**: Easy to add new data types following the same pattern
6. **AI Integration**: Provides accurate, up-to-date data for AI suggestions

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live data updates
2. **Offline Support**: Enhanced caching with service workers
3. **Data Synchronization**: Conflict resolution for offline changes
4. **Performance Optimization**: Lazy loading and pagination
5. **Analytics**: Usage tracking and performance monitoring 