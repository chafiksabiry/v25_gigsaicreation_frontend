// Test script for languages API integration
import { 
  loadLanguages, 
  getLanguageOptions, 
  getLanguageNameById,
  getLanguageCodeById,
  convertLanguageNamesToIds
} from '../lib/activitiesIndustries';

/**
 * Test the languages API integration
 * This script tests loading languages from the API and converting between names and IDs
 */
export async function testLanguagesAPI() {
  console.log('🧪 Testing Languages API Integration');
  console.log('====================================\n');

  try {
    // Test 1: Load languages from API
    console.log('🔄 Test 1: Loading languages from API...');
    const languages = await loadLanguages();
    
    if (languages.length === 0) {
      console.log('❌ No languages loaded from API');
      return { success: false, error: 'No languages available' };
    }
    
    console.log(`✅ Successfully loaded ${languages.length} languages from API`);
    console.log('📋 Sample languages:', languages.slice(0, 5).map(l => ({ 
      id: l._id, 
      name: l.name, 
      code: l.code,
      nativeName: l.nativeName 
    })));

    // Test 2: Generate language options
    console.log('\n🔄 Test 2: Generating language options...');
    const languageOptions = getLanguageOptions();
    console.log(`✅ Generated ${languageOptions.length} language options`);
    console.log('📋 Sample options:', languageOptions.slice(0, 3));

    // Test 3: Test ID to name conversion
    console.log('\n🔄 Test 3: Testing ID to name conversion...');
    const testLanguageId = languages[0]._id;
    const languageName = getLanguageNameById(testLanguageId);
    const languageCode = getLanguageCodeById(testLanguageId);
    
    console.log(`✅ Language ID "${testLanguageId}" -> Name: "${languageName}", Code: "${languageCode}"`);

    // Test 4: Test name to ID conversion
    console.log('\n🔄 Test 4: Testing name to ID conversion...');
    const testLanguageNames = ['English', 'Spanish', 'French'];
    const languageIds = convertLanguageNamesToIds(testLanguageNames);
    
    console.log('✅ Name to ID conversion results:');
    testLanguageNames.forEach((name, index) => {
      console.log(`   "${name}" -> "${languageIds[index] || 'Not found'}"`);
    });

    // Test 5: Test with non-existent language
    console.log('\n🔄 Test 5: Testing with non-existent language...');
    const nonExistentNames = ['Klingon', 'Elvish'];
    const nonExistentIds = convertLanguageNamesToIds(nonExistentNames);
    
    console.log('✅ Non-existent language conversion results:');
    nonExistentNames.forEach((name, index) => {
      console.log(`   "${name}" -> "${nonExistentIds[index] || 'Not found'}"`);
    });

    console.log('\n🎉 All language API tests completed successfully!');
    
    return {
      success: true,
      languagesLoaded: languages.length,
      optionsGenerated: languageOptions.length,
      sampleLanguage: {
        id: testLanguageId,
        name: languageName,
        code: languageCode
      }
    };

  } catch (error) {
    console.error('❌ Error testing languages API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).testLanguagesAPI = testLanguagesAPI;
  console.log('🌐 Languages API test function available as window.testLanguagesAPI()');
} else {
  // Node.js environment
  testLanguagesAPI().then(result => {
    console.log('Test result:', result);
  });
} 