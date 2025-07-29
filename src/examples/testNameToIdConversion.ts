import { loadActivities, loadIndustries, getActivityOptions, getIndustryOptions } from '../lib/activitiesIndustries';

/**
 * Test script to verify name to ID conversion
 */
export async function testNameToIdConversion() {
  console.log('🧪 Testing Name to ID Conversion...\n');
  
  try {
    // Load data from API
    console.log('📊 Loading data from API...');
    const activities = await loadActivities();
    const industries = await loadIndustries();
    
    const activityOptions = getActivityOptions();
    const industryOptions = getIndustryOptions();
    
    console.log('✅ Data loaded from API:');
    console.log(`  - Activities: ${activityOptions.length} available`);
    console.log(`  - Industries: ${industryOptions.length} available`);
    
    // Test cases - simulate AI generated names
    const testCases = [
      {
        type: 'activities',
        aiGeneratedNames: ['Telesales', 'Customer Service', 'Lead Generation'],
        options: activityOptions
      },
      {
        type: 'industries',
        aiGeneratedNames: ['SaaS B2B', 'Education & Training', 'Technology'],
        options: industryOptions
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n🎯 Testing ${testCase.type} conversion:`);
      console.log(`AI Generated Names:`, testCase.aiGeneratedNames);
      
      // Simulate the conversion logic
      const validNames = testCase.aiGeneratedNames.filter((name: string) => 
        testCase.options.some(opt => opt.label === name)
      );
      
      console.log(`Valid Names Found:`, validNames);
      
      // Convert names to IDs
      const ids = validNames.map((name: string) => {
        const option = testCase.options.find(opt => opt.label === name);
        return option ? option.value : null;
      }).filter((id: string | null): id is string => id !== null);
      
      console.log(`Converted IDs:`, ids);
      
      // Verify conversion by converting back to names
      const convertedBackNames = ids.map(id => {
        const option = testCase.options.find(opt => opt.value === id);
        return option ? option.label : 'Unknown';
      });
      
      console.log(`Names from IDs:`, convertedBackNames);
      
      // Check if conversion is correct
      const isCorrect = validNames.every((name, index) => 
        convertedBackNames[index] === name
      );
      
      console.log(`✅ Conversion correct:`, isCorrect);
    }
    
    console.log('\n✅ Name to ID conversion test completed!');
    
  } catch (error) {
    console.error('❌ Name to ID conversion test failed:', error);
  }
}

// Run the test
testNameToIdConversion(); 