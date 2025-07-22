// Simple test to verify API endpoints are working
async function testAPIs() {
  console.log('🧪 Testing Activities, Industries, and Languages APIs...\n');

  try {
    // Test Activities API
    console.log('📞 Testing Activities API...');
    const activitiesResponse = await fetch('https://api-repcreationwizard.harx.ai/api/activities');
    const activitiesData = await activitiesResponse.json();
    
    if (activitiesData.success) {
      console.log('✅ Activities API working -', activitiesData.data.length, 'activities loaded');
      console.log('📋 Sample activities:', activitiesData.data.slice(0, 3).map(a => a.name));
    } else {
      console.log('❌ Activities API failed:', activitiesData.message);
    }

    console.log('\n📞 Testing Industries API...');
    const industriesResponse = await fetch('https://api-repcreationwizard.harx.ai/api/industries');
    const industriesData = await industriesResponse.json();
    
    if (industriesData.success) {
      console.log('✅ Industries API working -', industriesData.data.length, 'industries loaded');
      console.log('📋 Sample industries:', industriesData.data.slice(0, 3).map(i => i.name));
    } else {
      console.log('❌ Industries API failed:', industriesData.message);
    }

    console.log('\n📞 Testing Languages API...');
    const languagesResponse = await fetch('https://api-repcreationwizard.harx.ai/api/languages');
    const languagesData = await languagesResponse.json();
    
    if (languagesData.success) {
      console.log('✅ Languages API working -', languagesData.data.length, 'languages loaded');
      console.log('📋 Sample languages:', languagesData.data.slice(0, 3).map(l => ({ name: l.name, code: l.code })));
    } else {
      console.log('❌ Languages API failed:', languagesData.message);
    }

    console.log('\n🎉 API test completed successfully!');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Run the test
testAPIs(); 