import { loadIndustries, getIndustryOptions } from '../lib/activitiesIndustries';

/**
 * Test script to verify industry matching logic
 */
export async function testIndustryMatching() {
  console.log('🧪 Testing Industry Matching Logic...\n');
  
  try {
    // Load industries from API
    const industries = await loadIndustries();
    const industryOptions = getIndustryOptions();
    const industryNames = industryOptions.map(opt => opt.label);
    
    console.log('📊 Available industries:', industryNames);
    
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
    
    // Keywords mapping for testing
    const industryKeywords = {
      'saas': ['Technology', 'Software', 'Information Technology'],
      'b2b': ['Business Services', 'Professional Services', 'Technology'],
      'education': ['Education', 'Training', 'Professional Services'],
      'training': ['Education', 'Training', 'Professional Services'],
      'healthcare': ['Healthcare', 'Medical', 'Pharmaceuticals'],
      'finance': ['Financial Services', 'Banking', 'Insurance'],
      'insurance': ['Insurance', 'Financial Services'],
      'mutuelles': ['Insurance', 'Healthcare', 'Financial Services'],
      'santé': ['Healthcare', 'Medical', 'Insurance'],
      'retail': ['Retail / e-Commerce', 'Consumer Goods'],
      'e-commerce': ['Retail / e-Commerce', 'Technology'],
      'marketing': ['Marketing', 'Advertising', 'Professional Services'],
      'sales': ['Sales', 'Business Services', 'Professional Services'],
      'customer service': ['Customer Service', 'Professional Services'],
      'support': ['Customer Service', 'Professional Services', 'Technology'],
      'consulting': ['Professional Services', 'Business Services'],
      'real estate': ['Real Estate', 'Property Management'],
      'logistics': ['Logistics', 'Transportation', 'Supply Chain'],
      'manufacturing': ['Manufacturing', 'Industrial'],
      'energy': ['Energy', 'Utilities', 'Oil & Gas']
    };
    
    for (const testCase of testCases) {
      console.log(`\n📝 Testing: "${testCase.description}"`);
      
      const descriptionLower = testCase.description.toLowerCase();
      const matchedIndustries: string[] = [];
      
      // Find matching industries based on keywords in description
      for (const [keyword, possibleIndustries] of Object.entries(industryKeywords)) {
        if (descriptionLower.includes(keyword)) {
          for (const industry of possibleIndustries) {
            if (industryNames.includes(industry) && !matchedIndustries.includes(industry)) {
              matchedIndustries.push(industry);
            }
          }
        }
      }
      
      console.log('🎯 Matched industries:', matchedIndustries);
      console.log('✅ Expected keywords found:', testCase.expectedKeywords.filter(k => descriptionLower.includes(k)));
    }
    
    console.log('\n✅ Industry matching test completed!');
    
  } catch (error) {
    console.error('❌ Industry matching test failed:', error);
  }
}

// Run the test
testIndustryMatching(); 