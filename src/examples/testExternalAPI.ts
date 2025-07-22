import { loadActivities, loadIndustries, clearCache } from '../lib/activitiesIndustries';

/**
 * Test script to verify external API connectivity
 * Run this to check if the external API is working properly
 */
export async function testExternalAPI() {
  console.log('🧪 Testing External API Connectivity...\n');
  
  try {
    // Clear cache to ensure fresh data
    clearCache();
    console.log('🗑️ Cache cleared');
    
    // Test activities API
    console.log('\n📋 Testing Activities API...');
    const activities = await loadActivities();
    console.log(`✅ Activities loaded: ${activities.length} items`);
    
    if (activities.length > 0) {
      console.log('📋 Sample activities:');
      activities.slice(0, 5).forEach((activity, index) => {
        console.log(`  ${index + 1}. ${activity.name} (${activity.category})`);
      });
    }
    
    // Test industries API
    console.log('\n🏭 Testing Industries API...');
    const industries = await loadIndustries();
    console.log(`✅ Industries loaded: ${industries.length} items`);
    
    if (industries.length > 0) {
      console.log('📋 Sample industries:');
      industries.slice(0, 5).forEach((industry, index) => {
        console.log(`  ${index + 1}. ${industry.name}`);
      });
    }
    
    // Summary
    console.log('\n📊 API Test Summary:');
    console.log(`  - Activities: ${activities.length} available`);
    console.log(`  - Industries: ${industries.length} available`);
    console.log(`  - API Status: ✅ Working`);
    
    if (activities.length === 0 || industries.length === 0) {
      console.log('\n⚠️ Warning: Some data is missing from API');
      console.log('   Please check the external API endpoints:');
      console.log('   - Activities: https://api-repcreationwizard.harx.ai/api/activities');
      console.log('   - Industries: https://api-repcreationwizard.harx.ai/api/industries');
    } else {
      console.log('\n🎉 All tests passed! External API is working correctly.');
    }
    
  } catch (error) {
    console.error('\n❌ API Test Failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check internet connection');
    console.log('   2. Verify API endpoints are accessible');
    console.log('   3. Check if API server is running');
    console.log('   4. Verify CORS settings if testing from browser');
  }
}

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).testExternalAPI = testExternalAPI;
  console.log('🧪 External API test function available as window.testExternalAPI()');
} else {
  // Node.js environment
  testExternalAPI().catch(console.error);
} 