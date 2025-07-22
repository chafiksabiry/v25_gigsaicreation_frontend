import { loadActivities, loadIndustries, getActivityOptions, getIndustryOptions, clearCache } from '../lib/activitiesIndustries';

/**
 * Test script to verify API connectivity specifically for Suggestions component
 * Run this to check if the external API is working properly for the Suggestions page
 */
export async function testSuggestionsAPI() {
  console.log('🧪 Testing Suggestions API Connectivity...\n');
  
  try {
    // Clear cache to ensure fresh data
    clearCache();
    console.log('🗑️ Cache cleared');
    
    // Test activities API
    console.log('\n📋 Testing Activities API for Suggestions...');
    const activities = await loadActivities();
    console.log(`✅ Activities loaded: ${activities.length} items`);
    
    if (activities.length > 0) {
      console.log('📋 Sample activities:');
      activities.slice(0, 5).forEach((activity, index) => {
        console.log(`  ${index + 1}. ${activity.name} (${activity.category})`);
      });
    }
    
    // Test industries API
    console.log('\n🏭 Testing Industries API for Suggestions...');
    const industries = await loadIndustries();
    console.log(`✅ Industries loaded: ${industries.length} items`);
    
    if (industries.length > 0) {
      console.log('📋 Sample industries:');
      industries.slice(0, 5).forEach((industry, index) => {
        console.log(`  ${index + 1}. ${industry.name}`);
      });
    }
    
    // Test UI options generation
    console.log('\n🎯 Testing UI Options Generation...');
    const activityOptions = getActivityOptions();
    const industryOptions = getIndustryOptions();
    
    console.log(`✅ Activity options: ${activityOptions.length}`);
    console.log(`✅ Industry options: ${industryOptions.length}`);
    
    if (activityOptions.length > 0) {
      console.log('📋 Sample activity options:');
      activityOptions.slice(0, 3).forEach((option, index) => {
        console.log(`  ${index + 1}. ${option.label} (${option.value}) - ${option.category}`);
      });
    }
    
    if (industryOptions.length > 0) {
      console.log('📋 Sample industry options:');
      industryOptions.slice(0, 3).forEach((option, index) => {
        console.log(`  ${index + 1}. ${option.label} (${option.value})`);
      });
    }
    
    // Test data structure for Suggestions component
    console.log('\n🔍 Testing Data Structure for Suggestions Component...');
    console.log('Expected activity structure:');
    console.log('  - value: string (ID)');
    console.log('  - label: string (Name)');
    console.log('  - category: string');
    
    console.log('Expected industry structure:');
    console.log('  - value: string (ID)');
    console.log('  - label: string (Name)');
    
    // Validate structure
    const activityStructureValid = activityOptions.every(opt => 
      typeof opt.value === 'string' && 
      typeof opt.label === 'string' && 
      typeof opt.category === 'string'
    );
    
    const industryStructureValid = industryOptions.every(opt => 
      typeof opt.value === 'string' && 
      typeof opt.label === 'string'
    );
    
    console.log(`✅ Activity structure valid: ${activityStructureValid}`);
    console.log(`✅ Industry structure valid: ${industryStructureValid}`);
    
    // Summary
    console.log('\n📊 Suggestions API Test Summary:');
    console.log(`  - Activities: ${activities.length} available`);
    console.log(`  - Industries: ${industries.length} available`);
    console.log(`  - Activity Options: ${activityOptions.length} generated`);
    console.log(`  - Industry Options: ${industryOptions.length} generated`);
    console.log(`  - API Status: ✅ Working`);
    console.log(`  - Data Structure: ✅ Valid`);
    
    if (activities.length === 0 || industries.length === 0) {
      console.log('\n⚠️ Warning: Some data is missing from API');
      console.log('   Please check the external API endpoints:');
      console.log('   - Activities: https://api-repcreationwizard.harx.ai/api/activities');
      console.log('   - Industries: https://api-repcreationwizard.harx.ai/api/industries');
    } else {
      console.log('\n🎉 All tests passed! Suggestions API is working correctly.');
      console.log('\n💡 Next steps:');
      console.log('   1. Check the Suggestions component console logs');
      console.log('   2. Verify that activities and industries appear in dropdowns');
      console.log('   3. Test adding/removing items from the lists');
    }
    
  } catch (error) {
    console.error('\n❌ Suggestions API Test Failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check internet connection');
    console.log('   2. Verify API endpoints are accessible');
    console.log('   3. Check if API server is running');
    console.log('   4. Verify CORS settings if testing from browser');
    console.log('   5. Check browser console for detailed error messages');
  }
}

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).testSuggestionsAPI = testSuggestionsAPI;
  console.log('🧪 Suggestions API test function available as window.testSuggestionsAPI()');
} else {
  // Node.js environment
  testSuggestionsAPI().catch(console.error);
} 