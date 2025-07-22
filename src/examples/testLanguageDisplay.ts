// Test script for language display issues
import { 
  loadLanguages, 
  getLanguageOptions, 
  getLanguageNameById,
  getLanguageCodeById
} from '../lib/activitiesIndustries';

/**
 * Test language display functionality
 * This script helps identify why "Unknown Language" appears instead of language names
 */
export async function testLanguageDisplay() {
  console.log('🧪 Testing Language Display Issues');
  console.log('==================================\n');

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

    // Test 3: Test ID to name conversion with sample IDs
    console.log('\n🔄 Test 3: Testing ID to name conversion...');
    const testLanguageIds = languages.slice(0, 5).map(l => l._id);
    
    console.log('✅ ID to name conversion results:');
    testLanguageIds.forEach(id => {
      const name = getLanguageNameById(id);
      const code = getLanguageCodeById(id);
      console.log(`   ID: "${id}" -> Name: "${name}", Code: "${code}"`);
    });

    // Test 4: Test with non-existent IDs
    console.log('\n🔄 Test 4: Testing with non-existent IDs...');
    const nonExistentIds = ['000000000000000000000000', 'invalid_id_123'];
    
    console.log('✅ Non-existent ID conversion results:');
    nonExistentIds.forEach(id => {
      const name = getLanguageNameById(id);
      const code = getLanguageCodeById(id);
      console.log(`   ID: "${id}" -> Name: "${name}", Code: "${code}"`);
    });

    // Test 5: Simulate the SkillsSection scenario
    console.log('\n🔄 Test 5: Simulating SkillsSection scenario...');
    const mockLanguageSkill = {
      language: languages[0]._id, // Use first language ID
      proficiency: 'B2',
      iso639_1: languages[0].code
    };
    
    console.log('📋 Mock language skill:', mockLanguageSkill);
    const displayName = getLanguageNameById(mockLanguageSkill.language);
    console.log(`✅ Display name for "${mockLanguageSkill.language}": "${displayName}"`);

    // Test 6: Check if the issue is with specific language IDs
    console.log('\n🔄 Test 6: Checking for specific problematic IDs...');
    const problematicIds = [
      '6878c3ba999b0fc08b1b14b5', // Abkhaz from API
      '6878c3bb999b0fc08b1b14b7', // Afrikaans from API
      '6878c3bb999b0fc08b1b14bb'  // Arabic from API
    ];
    
    console.log('✅ Checking specific API language IDs:');
    problematicIds.forEach(id => {
      const name = getLanguageNameById(id);
      console.log(`   ID: "${id}" -> Name: "${name}"`);
    });

    console.log('\n🎉 Language display tests completed!');
    
    return {
      success: true,
      languagesLoaded: languages.length,
      optionsGenerated: languageOptions.length,
      sampleLanguage: {
        id: languages[0]._id,
        name: languages[0].name,
        code: languages[0].code
      },
      testResults: {
        validIds: testLanguageIds.map(id => ({ id, name: getLanguageNameById(id) })),
        invalidIds: nonExistentIds.map(id => ({ id, name: getLanguageNameById(id) }))
      }
    };

  } catch (error) {
    console.error('❌ Error testing language display:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).testLanguageDisplay = testLanguageDisplay;
  console.log('🌐 Language display test function available as window.testLanguageDisplay()');
} else {
  // Node.js environment
  testLanguageDisplay().then(result => {
    console.log('Test result:', result);
  });
} 