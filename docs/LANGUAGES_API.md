# Languages API Integration

## Overview

The Languages API integration replaces hardcoded language data with dynamic data from the external API endpoint. This ensures that the application always has access to the most up-to-date language information, including native names and ISO codes.

## API Endpoint

- **URL**: `https://api-repcreationwizard.harx.ai/api/languages`
- **Method**: GET
- **Response**: JSON array of language objects

### Language Object Structure

```typescript
interface Language {
  _id: string;           // MongoDB ObjectId
  code: string;          // ISO 639-1 language code (e.g., "en", "es", "fr")
  name: string;          // Language name in English (e.g., "English", "Spanish")
  nativeName: string;    // Language name in its native script (e.g., "Español", "Français")
  createdAt: string;     // ISO timestamp
  updatedAt: string;     // ISO timestamp
  lastUpdated: string;   // ISO timestamp
  __v: number;           // MongoDB version key
}
```

## Implementation

### 1. API Functions (`src/lib/api.ts`)

```typescript
export async function fetchLanguages(): Promise<{ data: Language[]; error?: Error }> {
  try {
    const response = await fetch(`${import.meta.env.VITE_REP_URL}/languages`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return { data: result.data || [] };
  } catch (error) {
    return { data: [], error: error as Error };
  }
}
```

### 2. Utility Functions (`src/lib/activitiesIndustries.ts`)

#### Loading and Caching
```typescript
export async function loadLanguages(): Promise<Language[]> {
  if (isLanguagesLoaded && languagesCache.length > 0) {
    return languagesCache;
  }
  // Fetch from API and cache
}

export function getLanguageOptions(): Array<{ value: string; label: string; code: string }> {
  return languagesCache.map(lang => ({
    value: lang._id,
    label: lang.name,
    code: lang.code
  }));
}
```

#### Conversion Functions
```typescript
export function getLanguageNameById(id: string): string {
  const language = languagesCache.find(lang => lang._id === id);
  return language ? language.name : 'Unknown Language';
}

export function getLanguageCodeById(id: string): string {
  const language = languagesCache.find(lang => lang._id === id);
  return language ? language.code : 'en';
}

export function convertLanguageNamesToIds(names: string[]): string[] {
  return names.map(name => {
    const language = languagesCache.find(lang => 
      lang.name.toLowerCase() === name.toLowerCase()
    );
    return language ? language._id : '';
  }).filter(id => id !== '');
}
```

### 3. AI Integration (`src/lib/ai.ts`)

The `generateSkills` function now uses languages from the API:

```typescript
export async function generateSkills(title: string, description: string) {
  // Load languages from API
  const languages = await loadLanguages();
  const languageOptions = getLanguageOptions();
  const languageNames = languageOptions.map(opt => opt.label);
  
  // Use languageNames in OpenAI prompt
  // Convert language names to IDs in response processing
}
```

### 4. Component Integration

#### SkillsSection Component
```typescript
// Load languages from API
const languages = await loadLanguages();
const languageOptions = getLanguageOptions();

// Display language names, store language IDs
const selectedLanguage = languages.find(l => l.label === newSkill.language);
if (selectedLanguage) {
  updated = [...safeData.languages, {
    language: selectedLanguage.value, // Store the ID
    proficiency: newSkill.proficiency,
    iso639_1: selectedLanguage.code
  }];
}
```

#### Suggestions Component
```typescript
// Convert language names to IDs for storage
const languageId = languages.find(l => l.label === item)?.value;
if (languageId) {
  newSuggestions.languages = [...(newSuggestions.languages || []), languageId];
}

// Display language names using ID lookup
{selected.map(languageId => (
  <span key={languageId}>
    {getLanguageNameById(languageId)}
  </span>
))}
```

## Migration from Mock Data

### Before (Hardcoded)
```typescript
// In guidance.ts
languages: [
  { language: "English", proficiency: "C1", iso639_1: "en" },
  { language: "Spanish", proficiency: "B2", iso639_1: "es" }
]
```

### After (API-driven)
```typescript
// Languages loaded dynamically from API
const languages = await loadLanguages();
const languageOptions = getLanguageOptions();
// Store language IDs, display language names
```

## Benefits

1. **Dynamic Data**: Always up-to-date language information
2. **Native Names**: Support for language names in their native script
3. **ISO Standards**: Proper ISO 639-1 language codes
4. **Scalability**: Easy to add new languages without code changes
5. **Consistency**: Centralized language management
6. **Internationalization**: Better support for multilingual applications

## Error Handling

- **API Unavailable**: Falls back to empty array, shows error message
- **Invalid Language**: Filters out invalid entries, logs warnings
- **Cache Issues**: Automatically reloads data if cache is corrupted

## Testing

Use the test script to verify functionality:

```typescript
import { testLanguagesAPI } from '../examples/testLanguages';

// Run in browser console
window.testLanguagesAPI().then(result => {
  console.log('Test result:', result);
});
```

## Future Enhancements

1. **Language Families**: Group languages by family (Romance, Germanic, etc.)
2. **Regional Variants**: Support for regional language variants
3. **Script Information**: Include writing system information
4. **RTL Support**: Right-to-left language support
5. **Language Detection**: Automatic language detection from text 