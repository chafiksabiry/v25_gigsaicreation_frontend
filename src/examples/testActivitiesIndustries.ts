import { 
  loadActivities, 
  loadIndustries, 
  getActivityOptions, 
  getIndustryOptions,
  getActivityNameById,
  getIndustryNameById,
  convertActivityNamesToIds,
  convertIndustryNamesToIds,
  clearCache
} from '../lib/activitiesIndustries';

// Test the activities and industries functionality
console.log('=== Activities and Industries Test ===');

async function testActivitiesAndIndustries() {
  try {
    // Clear cache to ensure fresh data
    clearCache();
    
    console.log('Loading activities and industries...');
    
    // Load data
    const activities = await loadActivities();
    const industries = await loadIndustries();
    
    console.log(`Loaded ${activities.length} activities`);
    console.log(`Loaded ${industries.length} industries`);
    
    // Test activity options
    const activityOptions = getActivityOptions();
    console.log('\nActivity Options:');
    activityOptions.forEach(option => {
      console.log(`  ${option.value}: ${option.label} (${option.category})`);
    });
    
    // Test industry options
    const industryOptions = getIndustryOptions();
    console.log('\nIndustry Options:');
    industryOptions.forEach(option => {
      console.log(`  ${option.value}: ${option.label}`);
    });
    
    // Test name to ID conversion
    if (activityOptions.length > 0) {
      const testActivityName = activityOptions[0].label;
      const activityIds = convertActivityNamesToIds([testActivityName]);
      console.log(`\nConverting activity name "${testActivityName}" to ID:`, activityIds[0]);
      
      // Test ID to name conversion
      const activityName = getActivityNameById(activityIds[0]);
      console.log(`Converting activity ID "${activityIds[0]}" back to name:`, activityName);
    }
    
    if (industryOptions.length > 0) {
      const testIndustryName = industryOptions[0].label;
      const industryIds = convertIndustryNamesToIds([testIndustryName]);
      console.log(`\nConverting industry name "${testIndustryName}" to ID:`, industryIds[0]);
      
      // Test ID to name conversion
      const industryName = getIndustryNameById(industryIds[0]);
      console.log(`Converting industry ID "${industryIds[0]}" back to name:`, industryName);
    }
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testActivitiesAndIndustries(); 