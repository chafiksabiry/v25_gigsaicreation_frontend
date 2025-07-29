import { loadActivities, getActivityOptions } from '../lib/activitiesIndustries';

/**
 * Test script to verify activity matching logic
 */
export async function testActivityMatching() {
  console.log('🧪 Testing Activity Matching Logic...\n');
  
  try {
    // Load activities from API
    const activities = await loadActivities();
    const activityOptions = getActivityOptions();
    const activityNames = activityOptions.map(opt => opt.label);
    
    console.log('📊 Available activities:', activityNames);
    
    // Test cases
    const testCases = [
      {
        description: "Vendre des mutuelles santé partenaires",
        expectedKeywords: ['vendre', 'sales', 'vente']
      },
      {
        description: "Customer service and technical support",
        expectedKeywords: ['customer service', 'technical', 'support']
      },
      {
        description: "Lead generation and appointment setting",
        expectedKeywords: ['lead', 'appointment', 'generation']
      }
    ];
    
    // Keywords mapping for testing
    const activityKeywords = {
      'sales': ['Sales', 'Lead Generation', 'Account Management'],
      'vendre': ['Sales', 'Lead Generation', 'Account Management'],
      'vente': ['Sales', 'Lead Generation', 'Account Management'],
      'customer service': ['Customer Service', 'Support', 'Help Desk'],
      'support': ['Customer Service', 'Technical Support', 'Help Desk'],
      'service client': ['Customer Service', 'Support', 'Help Desk'],
      'technical': ['Technical Support', 'Product Support', 'Help Desk'],
      'technique': ['Technical Support', 'Product Support', 'Help Desk'],
      'marketing': ['Marketing', 'Lead Generation', 'Market Research'],
      'appointment': ['Appointment Setting', 'Lead Generation'],
      'rendez-vous': ['Appointment Setting', 'Lead Generation'],
      'lead': ['Lead Generation', 'Sales', 'Account Management'],
      'prospection': ['Lead Generation', 'Sales', 'Market Research'],
      'survey': ['Survey Calls', 'Market Research'],
      'sondage': ['Survey Calls', 'Market Research'],
      'welcome': ['Welcome Calls', 'Customer Service'],
      'bienvenue': ['Welcome Calls', 'Customer Service'],
      'follow-up': ['Follow-up Calls', 'Customer Service'],
      'suivi': ['Follow-up Calls', 'Customer Service'],
      'complaint': ['Complaint Resolution', 'Customer Service'],
      'plainte': ['Complaint Resolution', 'Customer Service'],
      'billing': ['Billing Support', 'Customer Service'],
      'facturation': ['Billing Support', 'Customer Service'],
      'collections': ['Collections', 'Customer Service'],
      'recouvrement': ['Collections', 'Customer Service'],
      'dispatch': ['Dispatch Services', 'Customer Service'],
      'emergency': ['Emergency Support', 'Customer Service'],
      'urgence': ['Emergency Support', 'Customer Service'],
      'multilingual': ['Multilingual Support', 'Customer Service'],
      'multilingue': ['Multilingual Support', 'Customer Service']
    };
    
    for (const testCase of testCases) {
      console.log(`\n📝 Testing: "${testCase.description}"`);
      
      const descriptionLower = testCase.description.toLowerCase();
      const matchedActivities: string[] = [];
      
      // Find matching activities based on keywords in description
      for (const [keyword, possibleActivities] of Object.entries(activityKeywords)) {
        if (descriptionLower.includes(keyword)) {
          for (const activity of possibleActivities) {
            if (activityNames.includes(activity) && !matchedActivities.includes(activity)) {
              matchedActivities.push(activity);
            }
          }
        }
      }
      
      console.log('🎯 Matched activities:', matchedActivities);
      console.log('✅ Expected keywords found:', testCase.expectedKeywords.filter(k => descriptionLower.includes(k)));
    }
    
    console.log('\n✅ Activity matching test completed!');
    
  } catch (error) {
    console.error('❌ Activity matching test failed:', error);
  }
}

// Run the test
testActivityMatching(); 