/**
 * Test script to verify ObjectId handling
 * Run this in the browser console to test the complete flow
 */

export async function testObjectIdFlow() {
  console.log('🧪 Testing ObjectId flow...');
  
  try {
    // 1. Test skills synchronization
    console.log('1️⃣ Syncing predefined skills...');
    const { syncPredefinedSkills } = await import('../lib/skillsManager');
    await syncPredefinedSkills();
    console.log('✅ Skills synced successfully');
    
    // 2. Test skill generation with ObjectIds
    console.log('2️⃣ Generating skills with ObjectIds...');
    const { generateSkills } = await import('../lib/ai');
    const skills = await generateSkills('Customer Service Representative', 'Provide excellent customer support');
    console.log('✅ Generated skills with ObjectIds:', skills);
    
    // 3. Test ObjectId conversion
    console.log('3️⃣ Testing ObjectId conversion...');
    const { convertSkillNamesToObjectIds } = await import('../lib/skillsManager');
    const skillNames = ['Active Listening', 'Email Support', 'Ticket Management'];
    const objectIds = await convertSkillNamesToObjectIds(skillNames, 'soft');
    console.log('✅ Converted skill names to ObjectIds:', objectIds);
    
    // 4. Test gig data structure
    console.log('4️⃣ Testing gig data structure...');
    const gigData = {
      title: 'Test Gig',
      description: 'Test description',
      skills: {
        languages: [
          { language: 'English', proficiency: 'B1', iso639_1: 'en' }
        ],
        soft: skills.soft,
        professional: skills.professional,
        technical: skills.technical,
        certifications: []
      }
    };
    console.log('✅ Gig data with ObjectIds:', gigData);
    
    // 5. Test API formatting
    console.log('5️⃣ Testing API formatting...');
    const { saveGigData } = await import('../lib/api');
    
    // Mock the API call to just log the data
    const originalFetch = window.fetch;
    window.fetch = async (url: string, options: any) => {
      if (url.includes('/gigs')) {
        console.log('📤 API call data:', JSON.parse(options.body));
        return new Response(JSON.stringify({ success: true, data: { _id: 'test-id' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return originalFetch(url, options);
    };
    
    try {
      await saveGigData(gigData);
      console.log('✅ API formatting test completed');
    } finally {
      window.fetch = originalFetch;
    }
    
    console.log('🎉 All ObjectId tests passed!');
    return {
      success: true,
      skills,
      objectIds,
      gigData
    };
    
  } catch (error) {
    console.error('❌ ObjectId test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Example usage in browser console:
// import('./examples/testObjectIds.ts').then(m => m.testObjectIdFlow()) 