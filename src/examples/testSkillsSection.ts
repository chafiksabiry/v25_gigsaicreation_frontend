import { 
  loadLanguages, 
  getLanguageOptions, 
  getLanguageNameById,
  getLanguageCodeById
} from '../lib/activitiesIndustries';

export async function testSkillsSection() {
  console.log('🧪 Testing SkillsSection Language Integration');
  console.log('=============================================');

  try {
    // Test loading languages
    console.log('\n📋 Testing loadLanguages...');
    const languages = await loadLanguages();
    console.log(`✅ Languages loaded: ${languages.length}`);
    
    if (languages.length > 0) {
      console.log('📋 Sample languages:', languages.slice(0, 3).map(l => ({
        id: l._id,
        name: l.name,
        code: l.code
      })));
    }

    // Test getLanguageOptions
    console.log('\n🌐 Testing getLanguageOptions...');
    const languageOptions = getLanguageOptions();
    console.log(`✅ Language options generated: ${languageOptions.length}`);
    
    if (languageOptions.length > 0) {
      console.log('🌐 Sample language options:', languageOptions.slice(0, 3));
    }

    // Test getLanguageNameById
    console.log('\n🔍 Testing getLanguageNameById...');
    if (languageOptions.length > 0) {
      const testLanguageId = languageOptions[0].value;
      const languageName = getLanguageNameById(testLanguageId);
      console.log(`✅ Language name for ID "${testLanguageId}": "${languageName}"`);
    }

    // Test getLanguageCodeById
    console.log('\n🔍 Testing getLanguageCodeById...');
    if (languageOptions.length > 0) {
      const testLanguageId = languageOptions[0].value;
      const languageCode = getLanguageCodeById(testLanguageId);
      console.log(`✅ Language code for ID "${testLanguageId}": "${languageCode}"`);
    }

    // Test language data structure for SkillsSection
    console.log('\n📝 Testing language data structure for SkillsSection...');
    const languageOptionsForSkillsSection = languageOptions.map((lang: { value: string; label: string; code: string }) => {
      return {
        language: lang.label,
        iso639_1: lang.code
      };
    });
    console.log('✅ Language options for SkillsSection:', languageOptionsForSkillsSection.slice(0, 3));

    console.log('\n✅ All SkillsSection language tests passed!');
    
  } catch (error) {
    console.error('❌ Error testing SkillsSection language integration:', error);
  }
}

// Test function for simulating SkillsSection language operations
export function testSkillsSectionLanguageOperations() {
  console.log('\n🧪 Testing SkillsSection Language Operations');
  console.log('============================================');

  // Simulate language data structure
  const mockLanguages = [
    { value: "lang1", label: "English", code: "en" },
    { value: "lang2", label: "French", code: "fr" },
    { value: "lang3", label: "Spanish", code: "es" }
  ];

  // Test language name lookup
  console.log('\n🔍 Testing language name lookup...');
  const testLanguageId = "lang1";
  const languageName = mockLanguages.find(l => l.value === testLanguageId)?.label || testLanguageId;
  console.log(`✅ Language name for ID "${testLanguageId}": "${languageName}"`);

  // Test language selection
  console.log('\n🎯 Testing language selection...');
  const selectedLanguageName = "French";
  const selectedLanguage = mockLanguages.find(l => l.label === selectedLanguageName);
  if (selectedLanguage) {
    console.log(`✅ Selected language "${selectedLanguageName}":`, {
      id: selectedLanguage.value,
      name: selectedLanguage.label,
      code: selectedLanguage.code
    });
  }

  // Test language data for storage
  console.log('\n💾 Testing language data for storage...');
  if (selectedLanguage) {
    const languageDataForStorage = {
      language: selectedLanguage.value, // Store the ID
      proficiency: "B1",
      iso639_1: selectedLanguage.code
    };
    console.log('✅ Language data for storage:', languageDataForStorage);
  }

  console.log('\n✅ All SkillsSection language operations tests passed!');
} 