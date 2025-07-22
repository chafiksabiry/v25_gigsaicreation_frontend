// Test script for complete skills API integration
import { 
  loadSoftSkills, 
  loadProfessionalSkills, 
  loadTechnicalSkills, 
  getSoftSkillOptions,
  getProfessionalSkillOptions, 
  getTechnicalSkillOptions,
  getSoftSkillNameById,
  getProfessionalSkillNameById,
  getTechnicalSkillNameById,
  convertSoftSkillNamesToIds,
  convertProfessionalSkillNamesToIds,
  convertTechnicalSkillNamesToIds
} from '../lib/activitiesIndustries';

/**
 * Test the complete skills API integration
 * This script tests loading all skills from the API and converting between names and IDs
 */
export async function testCompleteSkillsAPI() {
  console.log('🧪 Testing Complete Skills API Integration');
  console.log('==========================================\n');

  try {
    // Test 1: Load all skills from API
    console.log('🔄 Test 1: Loading all skills from API...');
    const [softSkills, professionalSkills, technicalSkills] = await Promise.all([
      loadSoftSkills(),
      loadProfessionalSkills(),
      loadTechnicalSkills()
    ]);
    
    if (softSkills.length === 0) {
      console.log('❌ No soft skills loaded from API');
      return { success: false, error: 'No soft skills available' };
    }
    
    if (professionalSkills.length === 0) {
      console.log('❌ No professional skills loaded from API');
      return { success: false, error: 'No professional skills available' };
    }
    
    if (technicalSkills.length === 0) {
      console.log('❌ No technical skills loaded from API');
      return { success: false, error: 'No technical skills available' };
    }
    
    console.log(`✅ Successfully loaded skills from API:`);
    console.log(`  - Soft Skills: ${softSkills.length}`);
    console.log(`  - Professional Skills: ${professionalSkills.length}`);
    console.log(`  - Technical Skills: ${technicalSkills.length}`);

    // Test 2: Generate skill options
    console.log('\n🔄 Test 2: Generating skill options...');
    const softSkillOptions = getSoftSkillOptions();
    const professionalSkillOptions = getProfessionalSkillOptions();
    const technicalSkillOptions = getTechnicalSkillOptions();
    
    console.log(`✅ Generated skill options:`);
    console.log(`  - Soft Skills: ${softSkillOptions.length} options`);
    console.log(`  - Professional Skills: ${professionalSkillOptions.length} options`);
    console.log(`  - Technical Skills: ${technicalSkillOptions.length} options`);

    // Test 3: Test ID to name conversion
    console.log('\n🔄 Test 3: Testing ID to name conversion...');
    const testSoftSkillId = softSkills[0]._id;
    const testProfessionalSkillId = professionalSkills[0]._id;
    const testTechnicalSkillId = technicalSkills[0]._id;
    
      const softSkillName = getSoftSkillNameById(testSoftSkillId);
    const professionalSkillName = getProfessionalSkillNameById(testProfessionalSkillId);
      const technicalSkillName = getTechnicalSkillNameById(testTechnicalSkillId);
    
    console.log(`✅ ID to name conversion results:`);
    console.log(`  - Soft Skill ID "${testSoftSkillId}" -> Name: "${softSkillName}"`);
    console.log(`  - Professional Skill ID "${testProfessionalSkillId}" -> Name: "${professionalSkillName}"`);
    console.log(`  - Technical Skill ID "${testTechnicalSkillId}" -> Name: "${technicalSkillName}"`);

    // Test 4: Test name to ID conversion
    console.log('\n🔄 Test 4: Testing name to ID conversion...');
    const testSoftSkillNames = softSkills.slice(0, 3).map(s => s.name);
    const testProfessionalSkillNames = professionalSkills.slice(0, 3).map(s => s.name);
    const testTechnicalSkillNames = technicalSkills.slice(0, 3).map(s => s.name);
    
      const softSkillIds = convertSoftSkillNamesToIds(testSoftSkillNames);
    const professionalSkillIds = convertProfessionalSkillNamesToIds(testProfessionalSkillNames);
    const technicalSkillIds = convertTechnicalSkillNamesToIds(testTechnicalSkillNames);
    
    console.log('✅ Name to ID conversion results:');
    console.log('  - Soft Skills:');
    testSoftSkillNames.forEach((name, index) => {
      console.log(`    "${name}" -> "${softSkillIds[index] || 'Not found'}"`);
    });
    console.log('  - Professional Skills:');
    testProfessionalSkillNames.forEach((name, index) => {
      console.log(`    "${name}" -> "${professionalSkillIds[index] || 'Not found'}"`);
    });
    console.log('  - Technical Skills:');
    testTechnicalSkillNames.forEach((name, index) => {
      console.log(`    "${name}" -> "${technicalSkillIds[index] || 'Not found'}"`);
    });

    // Test 5: Test with non-existent skills
    console.log('\n🔄 Test 5: Testing with non-existent skills...');
    const nonExistentSoftSkills = ['NonExistentSoftSkill1', 'NonExistentSoftSkill2'];
    const nonExistentProfessionalSkills = ['NonExistentProfessionalSkill1', 'NonExistentProfessionalSkill2'];
    const nonExistentTechnicalSkills = ['NonExistentTechnicalSkill1', 'NonExistentTechnicalSkill2'];
    
    const nonExistentSoftIds = convertSoftSkillNamesToIds(nonExistentSoftSkills);
    const nonExistentProfessionalIds = convertProfessionalSkillNamesToIds(nonExistentProfessionalSkills);
    const nonExistentTechnicalIds = convertTechnicalSkillNamesToIds(nonExistentTechnicalSkills);
    
    console.log('✅ Non-existent skill conversion results:');
    console.log('  - Non-existent soft skills:', nonExistentSoftIds);
    console.log('  - Non-existent professional skills:', nonExistentProfessionalIds);
    console.log('  - Non-existent technical skills:', nonExistentTechnicalIds);

    // Test 6: Test AI prompt generation
    console.log('\n🔄 Test 6: Testing AI prompt generation...');
    const softSkillNames = softSkillOptions.map(opt => opt.label);
    const professionalSkillNames = professionalSkillOptions.map(opt => opt.label);
    const technicalSkillNames = technicalSkillOptions.map(opt => opt.label);
    
    console.log('✅ AI prompt would include:');
    console.log(`  - ${softSkillNames.length} soft skills (sample: ${softSkillNames.slice(0, 3).join(', ')})`);
    console.log(`  - ${professionalSkillNames.length} professional skills (sample: ${professionalSkillNames.slice(0, 3).join(', ')})`);
    console.log(`  - ${technicalSkillNames.length} technical skills (sample: ${technicalSkillNames.slice(0, 3).join(', ')})`);

    console.log('\n🎉 All skills API tests completed successfully!');
    
    return {
      success: true,
      skillsLoaded: {
        soft: softSkills.length,
        professional: professionalSkills.length,
        technical: technicalSkills.length
      },
      optionsGenerated: {
        soft: softSkillOptions.length,
        professional: professionalSkillOptions.length,
        technical: technicalSkillOptions.length
      },
      sampleSkills: {
        soft: { id: testSoftSkillId, name: softSkillName },
        professional: { id: testProfessionalSkillId, name: professionalSkillName },
        technical: { id: testTechnicalSkillId, name: technicalSkillName }
      }
    };
    
  } catch (error) {
    console.error('❌ Error testing skills API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).testCompleteSkillsAPI = testCompleteSkillsAPI;
  console.log('🌐 Complete Skills API test function available as window.testCompleteSkillsAPI()');
} else {
  // Node.js environment
  testCompleteSkillsAPI().then(result => {
    console.log('Test result:', result);
  });
} 