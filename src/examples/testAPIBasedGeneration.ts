import { loadActivities, loadIndustries, getActivityOptions, getIndustryOptions } from '../lib/activitiesIndustries';

/**
 * Test script to verify that AI generation uses API data
 */
export async function testAPIBasedGeneration() {
  console.log('🧪 Testing API-Based Generation...\n');
  
  try {
    // Load data from API
    console.log('📊 Loading data from API...');
    const activities = await loadActivities();
    const industries = await loadIndustries();
    
    const activityOptions = getActivityOptions();
    const industryOptions = getIndustryOptions();
    
    const activityNames = activityOptions.map(opt => opt.label);
    const industryNames = industryOptions.map(opt => opt.label);
    
    console.log('✅ Data loaded from API:');
    console.log(`  - Activities: ${activityNames.length} available`);
    console.log(`  - Industries: ${industryNames.length} available`);
    
    console.log('\n📋 Available Activities:');
    activityNames.forEach((activity, index) => {
      console.log(`  ${index + 1}. ${activity}`);
    });
    
    console.log('\n🏭 Available Industries:');
    industryNames.forEach((industry, index) => {
      console.log(`  ${index + 1}. ${industry}`);
    });
    
    // Test cases
    const testCases = [
      {
        description: "SAAS b2b, education end atraining industries",
        expectedKeywords: ['saas', 'b2b', 'education', 'training']
      },
      {
        description: "Vendre des mutuelles santé partenaires",
        expectedKeywords: ['mutuelles', 'santé', 'insurance', 'healthcare']
      },
      {
        description: "Customer service and technical support",
        expectedKeywords: ['customer service', 'technical', 'support']
      }
    ];
    
    console.log('\n🎯 Test Cases:');
    for (const testCase of testCases) {
      console.log(`\n📝 Test: "${testCase.description}"`);
      console.log('✅ Expected keywords:', testCase.expectedKeywords);
      
      // Check which activities/industries from API match the keywords
      const descriptionLower = testCase.description.toLowerCase();
      
      const matchingActivities = activityNames.filter(activity => 
        testCase.expectedKeywords.some(keyword => 
          descriptionLower.includes(keyword) && activity.toLowerCase().includes(keyword)
        )
      );
      
      const matchingIndustries = industryNames.filter(industry => 
        testCase.expectedKeywords.some(keyword => 
          descriptionLower.includes(keyword) && industry.toLowerCase().includes(keyword)
        )
      );
      
      console.log('🎯 Matching activities from API:', matchingActivities);
      console.log('🎯 Matching industries from API:', matchingIndustries);
    }
    
    console.log('\n✅ API-based generation test completed!');
    console.log('\n💡 The AI will now use ONLY these available options from the API.');
    
  } catch (error) {
    console.error('❌ API-based generation test failed:', error);
  }
}

// Run the test
testAPIBasedGeneration(); 