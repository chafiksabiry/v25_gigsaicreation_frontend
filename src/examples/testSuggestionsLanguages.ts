// Test script for language handling in Suggestions.tsx
import { 
  loadLanguages, 
  getLanguageOptions, 
  getLanguageNameById,
  getLanguageCodeById
} from '../lib/activitiesIndustries';

/**
 * Test language handling in Suggestions component
 * This script helps identify issues with language ID/name conversion
 */
export async function testSuggestionsLanguages() {
  console.log('🧪 Testing Language Handling in Suggestions');
  console.log('===========================================\n');

  try {
    // Test 1: Load languages from API
    console.log('🔄 Test 1: Loading languages from API...');
    const languages = await loadLanguages();

    if (languages.length === 0) {
      console.log('❌ No languages loaded from API');
      return { success: false, error: 'No languages available' };
    }

    console.log(`✅ Successfully loaded ${languages.length} languages from API`);
    console.log('📋 Sample languages:', languages.slice(0, 3).map(l => ({
      id: l._id,
      name: l.name,
      code: l.code
    })));

    // Test 2: Generate language options
    console.log('\n🔄 Test 2: Generating language options...');
    const languageOptions = getLanguageOptions();
    console.log(`✅ Generated ${languageOptions.length} language options`);
    console.log('📋 Sample options:', languageOptions.slice(0, 3));

    // Test 3: Simulate Suggestions.tsx language handling
    console.log('\n🔄 Test 3: Simulating Suggestions.tsx language handling...');
    
    // Simulate a language skill object as stored in suggestions
    const mockLanguageSkill = {
      language: languages[0]._id, // Store ID
      proficiency: 'B2',
      iso639_1: languages[0].code
    };
    
    console.log('📋 Mock language skill (as stored):', mockLanguageSkill);
    
    // Test ID to name conversion (as used in renderSkillCard)
    const displayName = getLanguageNameById(mockLanguageSkill.language);
    console.log(`✅ Display name for ID "${mockLanguageSkill.language}": "${displayName}"`);
    
    // Test finding language by ID (as used in updateSkill)
    const foundLanguage = languageOptions.find(l => l.value === mockLanguageSkill.language);
    console.log(`✅ Found language by ID:`, foundLanguage ? {
      id: foundLanguage.value,
      name: foundLanguage.label,
      code: foundLanguage.code
    } : 'Not found');

    // Test 4: Simulate the problematic scenario
    console.log('\n🔄 Test 4: Simulating problematic scenario...');
    
    // Simulate what happens when language name is stored instead of ID
    const problematicLanguageSkill = {
      language: 'Avestan', // Name instead of ID
      proficiency: 'B2',
      iso639_1: 'ae'
    };
    
    console.log('📋 Problematic language skill (name stored):', problematicLanguageSkill);
    
    // This would fail because getLanguageNameById expects an ID
    const problematicDisplayName = getLanguageNameById(problematicLanguageSkill.language);
    console.log(`❌ Display name for name "${problematicLanguageSkill.language}": "${problematicDisplayName}"`);
    
    // Find language by name instead
    const foundByName = languageOptions.find(l => l.label === problematicLanguageSkill.language);
    console.log(`✅ Found language by name:`, foundByName ? {
      id: foundByName.value,
      name: foundByName.label,
      code: foundByName.code
    } : 'Not found');

    // Test 5: Test the corrected flow
    console.log('\n🔄 Test 5: Testing corrected flow...');
    
    // Simulate the corrected flow where ID is stored
    const correctedLanguageSkill = {
      language: foundByName?.value || languages[0]._id, // Store ID
      proficiency: 'B2',
      iso639_1: foundByName?.code || languages[0].code
    };
    
    console.log('📋 Corrected language skill (ID stored):', correctedLanguageSkill);
    
    // This should work correctly
    const correctedDisplayName = getLanguageNameById(correctedLanguageSkill.language);
    console.log(`✅ Corrected display name: "${correctedDisplayName}"`);
    
    // Test finding by ID for update
    const foundForUpdate = languageOptions.find(l => l.value === correctedLanguageSkill.language);
    console.log(`✅ Found for update:`, foundForUpdate ? {
      id: foundForUpdate.value,
      name: foundForUpdate.label,
      code: foundForUpdate.code
    } : 'Not found');

    // Test 6: Verify all language conversions work
    console.log('\n🔄 Test 6: Verifying all language conversions...');
    const testLanguages = languages.slice(0, 5);
    
    console.log('✅ Testing ID ↔ Name conversions:');
    testLanguages.forEach(lang => {
      const nameFromId = getLanguageNameById(lang._id);
      const codeFromId = getLanguageCodeById(lang._id);
      const foundById = languageOptions.find(l => l.value === lang._id);
      const foundByName = languageOptions.find(l => l.label === lang.name);
      
      console.log(`   "${lang.name}" (${lang.code}):`);
      console.log(`     ID: "${lang._id}"`);
      console.log(`     Name from ID: "${nameFromId}"`);
      console.log(`     Code from ID: "${codeFromId}"`);
      console.log(`     Found by ID: ${foundById ? '✅' : '❌'}`);
      console.log(`     Found by name: ${foundByName ? '✅' : '❌'}`);
      console.log(`     ID matches: ${foundById?.value === lang._id ? '✅' : '❌'}`);
      console.log('');
    });

    console.log('\n🎉 Language handling tests completed!');
    
    return {
      success: true,
      languagesLoaded: languages.length,
      optionsGenerated: languageOptions.length,
      testResults: {
        mockSkill: {
          stored: mockLanguageSkill,
          displayName,
          foundLanguage: foundLanguage ? { id: foundLanguage.value, name: foundLanguage.label } : null
        },
        problematicSkill: {
          stored: problematicLanguageSkill,
          displayName: problematicDisplayName,
          foundByName: foundByName ? { id: foundByName.value, name: foundByName.label } : null
        },
        correctedSkill: {
          stored: correctedLanguageSkill,
          displayName: correctedDisplayName,
          foundForUpdate: foundForUpdate ? { id: foundForUpdate.value, name: foundForUpdate.label } : null
        }
      }
    };

  } catch (error) {
    console.error('❌ Error testing language handling:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).testSuggestionsLanguages = testSuggestionsLanguages;
  console.log('🌐 Suggestions language test function available as window.testSuggestionsLanguages()');
} else {
  // Node.js environment
  testSuggestionsLanguages().then(result => {
    console.log('Test result:', result);
  });
} 