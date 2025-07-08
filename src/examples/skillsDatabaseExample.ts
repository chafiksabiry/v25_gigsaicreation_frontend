import { syncPredefinedSkills, convertSkillNamesToObjectIds } from '../lib/skillsManager';

/**
 * Example: Initialize the skills database with predefined skills
 * This ensures all predefined skills exist in the database with proper ObjectIds
 */
export async function initializeSkillsDatabase() {
  try {
    console.log('🚀 Initializing skills database...');
    
    // Sync all predefined skills with the database
    await syncPredefinedSkills();
    
    console.log('✅ Skills database initialized successfully!');
    
    // Example: Convert skill names to ObjectIds
    const skillNames = ['Active Listening', 'Email Support', 'Ticket Management'];
    const objectIds = await convertSkillNamesToObjectIds(skillNames, 'soft');
    
    console.log('📋 Example skill names converted to ObjectIds:', objectIds);
    
    return {
      success: true,
      message: 'Skills database initialized successfully',
      exampleObjectIds: objectIds
    };
  } catch (error) {
    console.error('❌ Error initializing skills database:', error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error
    };
  }
}

/**
 * Example: Generate skills for a gig with proper ObjectIds
 */
export async function generateSkillsForGig(title: string, description: string) {
  try {
    console.log(`🎯 Generating skills for gig: ${title}`);
    
    // Import the generateSkills function
    const { generateSkills } = await import('../lib/ai');
    
    // Generate skills with ObjectIds
    const skills = await generateSkills(title, description);
    
    console.log('✅ Generated skills with ObjectIds:', skills);
    
    return {
      success: true,
      skills,
      message: 'Skills generated successfully with ObjectIds'
    };
  } catch (error) {
    console.error('❌ Error generating skills:', error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error
    };
  }
}

/**
 * Example: Create a gig with proper skill ObjectIds
 */
export async function createGigWithSkills() {
  try {
    console.log('🎪 Creating gig with proper skill ObjectIds...');
    
    // First, ensure skills database is initialized
    await initializeSkillsDatabase();
    
    // Generate skills for a sample gig
    const title = 'Customer Service Representative';
    const description = 'Provide excellent customer support through phone, email, and chat channels.';
    
    const skillsResult = await generateSkillsForGig(title, description);
    
    if (!skillsResult.success) {
      throw new Error(skillsResult.message);
    }
    
    // Create gig data with proper skill ObjectIds
    const gigData = {
      title,
      description,
      skills: skillsResult.skills,
      // ... other gig data
    };
    
    console.log('✅ Gig data with ObjectIds created:', gigData);
    
    return {
      success: true,
      gigData,
      message: 'Gig created successfully with proper skill ObjectIds'
    };
  } catch (error) {
    console.error('❌ Error creating gig:', error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error
    };
  }
}

// Example usage:
// Run this in the browser console or as a script
/*
// Initialize the database
initializeSkillsDatabase().then(result => {
  console.log('Initialization result:', result);
});

// Generate skills for a specific gig
generateSkillsForGig('Technical Support Specialist', 'Provide technical assistance to customers').then(result => {
  console.log('Skills generation result:', result);
});

// Create a complete gig
createGigWithSkills().then(result => {
  console.log('Gig creation result:', result);
});
*/ 