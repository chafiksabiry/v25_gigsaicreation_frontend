// Simple test script for ObjectId migration
// Run this in the browser console to test the migration

export function testMigrationInBrowser() {
  console.log('🧪 Testing ObjectId Migration in Browser...\n');

  // Mock skills data (simulate API response)
  const mockSkills = {
    soft: [
      { _id: '507f1f77bcf86cd799439011', name: 'Communication', description: 'Effective communication skills' },
      { _id: '507f1f77bcf86cd799439012', name: 'Leadership', description: 'Team leadership abilities' }
    ],
    professional: [
      { _id: '507f1f77bcf86cd799439013', name: 'Project Management', description: 'Project management skills' },
      { _id: '507f1f77bcf86cd799439014', name: 'Sales', description: 'Sales and negotiation skills' }
    ],
    technical: [
      { _id: '507f1f77bcf86cd799439015', name: 'JavaScript', description: 'JavaScript programming' },
      { _id: '507f1f77bcf86cd799439016', name: 'React', description: 'React framework knowledge' }
    ]
  };

  // Test data with string skills (old format)
  const testData = {
    skills: {
      languages: [{ language: "English", proficiency: "C1", iso639_1: "en" }],
      soft: [
        { skill: "Communication", level: 3, details: "Team communication" },
        { skill: "Leadership", level: 4, details: "Project leadership" }
      ],
      professional: [
        { skill: "Project Management", level: 4, details: "Agile methodology" }
      ],
      technical: [
        { skill: "JavaScript", level: 4, details: "ES6+ features" }
      ],
      certifications: []
    }
  };

  console.log('📋 Original data (with string skills):', testData);

  // Migration function
  const migrateSkillsToObjectIds = (skillsData: any, skillsDatabase: any) => {
    const migrated = { ...skillsData };
    
    ['soft', 'professional', 'technical'].forEach(type => {
      if (migrated[type] && Array.isArray(migrated[type])) {
        migrated[type] = migrated[type].map(skill => {
          if (typeof skill.skill === 'string') {
            console.log(`🔄 Migrating: "${skill.skill}" (${type})`);
            
            const skillArray = skillsDatabase[type] || [];
            const found = skillArray.find(s => s.name === skill.skill);
            
            if (found) {
              console.log(`✅ Found ObjectId: ${found._id}`);
              return {
                ...skill,
                skill: { $oid: found._id },
                details: skill.details || found.description
              };
            } else {
              console.log(`⚠️ Skill not found: "${skill.skill}"`);
              return skill; // Keep as string
            }
          }
          return skill; // Already ObjectId
        });
      }
    });
    
    return migrated;
  };

  // Run migration
  const migratedSkills = migrateSkillsToObjectIds(testData.skills, mockSkills);
  
  console.log('\n📋 Migrated data (with ObjectIds):', migratedSkills);

  // Verify ObjectIds
  console.log('\n🔍 Verifying ObjectId format:');
  ['soft', 'professional', 'technical'].forEach(type => {
    if (migratedSkills[type]) {
      migratedSkills[type].forEach((skill: any, index: number) => {
        if (skill.skill && typeof skill.skill === 'object' && skill.skill.$oid) {
          console.log(`✅ ${type}[${index}]: Valid ObjectId - ${skill.skill.$oid}`);
        } else {
          console.log(`❌ ${type}[${index}]: Invalid format - ${JSON.stringify(skill.skill)}`);
        }
      });
    }
  });

  console.log('\n🎉 Migration test completed!');
  
  return {
    original: testData,
    migrated: { skills: migratedSkills },
    mockSkills
  };
}

// Function to test in the actual app
export function testMigrationInApp() {
  console.log('🧪 Testing Migration in Actual App...\n');
  
  // Check if we're in the Suggestions component
  const suggestionsElement = document.querySelector('[data-testid="suggestions"]') || 
                           document.querySelector('.suggestions') ||
                           document.querySelector('[class*="suggestions"]');
  
  if (suggestionsElement) {
    console.log('✅ Found Suggestions component');
    
    // Trigger force migration
    const event = new CustomEvent('forceSkillsMigration');
    window.dispatchEvent(event);
    console.log('🔄 Triggered force migration event');
    
    // Check console for migration logs
    console.log('📋 Check the console above for migration logs');
    
  } else {
    console.log('❌ Suggestions component not found');
    console.log('💡 Make sure you are on the suggestions page');
  }
}

// Export for browser console usage
if (typeof window !== 'undefined') {
  (window as any).testMigration = testMigrationInBrowser;
  (window as any).testMigrationInApp = testMigrationInApp;
} 