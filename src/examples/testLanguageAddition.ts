// Test script for language addition in Suggestions.tsx
import { 
  loadLanguages, 
  getLanguageOptions, 
  getLanguageNameById,
  getLanguageCodeById
} from '../lib/activitiesIndustries';

/**
 * Test language addition functionality in Suggestions component
 * This script simulates the add language flow to identify issues
 */
export async function testLanguageAddition() {
  console.log('🧪 Testing Language Addition in Suggestions');
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
    
    // Test 2: Generate language options
    console.log('\n🔄 Test 2: Generating language options...');
    const languageOptions = getLanguageOptions();
    console.log(`✅ Generated ${languageOptions.length} language options`);
    
    // Test 3: Simulate the add language flow
    console.log('\n🔄 Test 3: Simulating add language flow...');
    
    // Simulate what happens when user selects a language
    const testLanguage = languageOptions[0]; // First available language
    console.log('📋 Test language selection:', {
      id: testLanguage.value,
      name: testLanguage.label,
      code: testLanguage.code
    });
    
    // Simulate the select value (should be the ID)
    const selectedValue = testLanguage.value; // This should be the ID
    console.log(`✅ Selected value (should be ID): "${selectedValue}"`);
    
    // Simulate addSkill function call
    console.log('\n🔄 Test 4: Simulating addSkill function...');
    
    // Mock the addSkill logic for languages
    const mockAddLanguage = (skillId: string, level: number = 2) => {
      console.log(`🔄 Adding language with ID: "${skillId}", Level: ${level}`);
      
      // Find the language by ID
      const selectedLanguage = languageOptions.find(l => l.value === skillId);
      if (selectedLanguage) {
        const newLanguageSkill = {
          language: selectedLanguage.value, // Store ID
          proficiency: 'B1', // Default level
          iso639_1: selectedLanguage.code, // Use correct code
        };
        
        console.log(`✅ Successfully created language skill:`, newLanguageSkill);
        console.log(`✅ Language name: "${selectedLanguage.label}"`);
        console.log(`✅ Language code: "${selectedLanguage.code}"`);
        
        return {
          success: true,
          skill: newLanguageSkill,
          displayName: selectedLanguage.label
        };
      } else {
        console.log(`❌ Language with ID "${skillId}" not found`);
        return {
          success: false,
          error: `Language with ID "${skillId}" not found`
        };
      }
    };
    
    // Test the add function
    const addResult = mockAddLanguage(selectedValue, 2);
    
    if (addResult.success) {
      console.log(`✅ Language addition successful: "${addResult.displayName}"`);
    } else {
      console.log(`❌ Language addition failed: ${addResult.error}`);
    }
    
    // Test 5: Verify the complete flow
    console.log('\n🔄 Test 5: Verifying complete flow...');
    
    // Simulate the complete flow from selection to display
    const completeFlow = () => {
      // Step 1: User selects language from dropdown
      const userSelection = testLanguage.value; // ID
      console.log(`1️⃣ User selects: "${testLanguage.label}" (ID: "${userSelection}")`);
      
      // Step 2: addSkill is called with the ID
      const addResult = mockAddLanguage(userSelection, 2);
      console.log(`2️⃣ addSkill result:`, addResult.success ? 'Success' : 'Failed');
      
      // Step 3: Language is stored in suggestions
      if (addResult.success) {
        const storedSkill = addResult.skill;
        console.log(`3️⃣ Stored skill:`, storedSkill);
        
        // Step 4: Display name is retrieved for UI
        const displayName = getLanguageNameById(storedSkill.language);
        console.log(`4️⃣ Display name: "${displayName}"`);
        
        // Step 5: Verify the result
        const isCorrect = displayName === testLanguage.label;
        console.log(`5️⃣ Result correct: ${isCorrect ? '✅' : '❌'}`);
        
        return {
          success: isCorrect,
          flow: {
            selection: userSelection,
            stored: storedSkill,
            display: displayName,
            expected: testLanguage.label
          }
        };
      }
      
      return { success: false, error: 'Add failed' };
    };
    
    const flowResult = completeFlow();
    console.log('\n📊 Complete flow result:', flowResult);
    
    // Test 6: Test multiple languages
    console.log('\n🔄 Test 6: Testing multiple languages...');
    
    const testLanguages = languageOptions.slice(0, 3); // Test first 3 languages
    const multipleResults = testLanguages.map(lang => {
      const result = mockAddLanguage(lang.value, 2);
      return {
        language: lang.label,
        id: lang.value,
        success: result.success,
        displayName: result.success ? result.displayName : 'Failed'
      };
    });
    
    console.log('📋 Multiple language test results:');
    multipleResults.forEach(result => {
      console.log(`   "${result.language}": ${result.success ? '✅' : '❌'} (${result.displayName})`);
    });
    
    // Test 7: Test edge cases
    console.log('\n🔄 Test 7: Testing edge cases...');
    
    // Test with invalid ID
    const invalidResult = mockAddLanguage('invalid-id', 2);
    console.log(`❌ Invalid ID test: ${invalidResult.success ? 'Unexpected success' : 'Expected failure'}`);
    
    // Test with empty ID
    const emptyResult = mockAddLanguage('', 2);
    console.log(`❌ Empty ID test: ${emptyResult.success ? 'Unexpected success' : 'Expected failure'}`);
    
    console.log('\n🎉 Language addition tests completed!');
    
    return {
      success: true,
      languagesLoaded: languages.length,
      optionsGenerated: languageOptions.length,
      testResults: {
        singleLanguage: addResult,
        completeFlow: flowResult,
        multipleLanguages: multipleResults,
        edgeCases: {
          invalidId: invalidResult.success === false,
          emptyId: emptyResult.success === false
        }
      }
    };

  } catch (error) {
    console.error('❌ Error testing language addition:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).testLanguageAddition = testLanguageAddition;
  console.log('🌐 Language addition test function available as window.testLanguageAddition()');
} else {
  // Node.js environment
  testLanguageAddition().then(result => {
    console.log('Test result:', result);
  });
} 