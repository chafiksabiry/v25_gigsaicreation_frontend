import { skillsManager, SkillData } from '../lib/skillsManager';

// Example: How to use the Skills Database Manager

export async function skillsDatabaseExample() {
  console.log('🚀 Starting Skills Database Example...');

  try {
    // 1. Load all skills from the database
    console.log('\n📋 Loading all skills...');
    const allSkills = await skillsManager.getAllSkills();
    console.log('✅ Loaded skills:', {
      soft: allSkills.soft.length,
      technical: allSkills.technical.length,
      professional: allSkills.professional.length
    });

    // 2. Add a new skill to the database
    console.log('\n➕ Adding a new skill...');
    const newSkill: Omit<SkillData, '_id' | 'createdAt' | 'updatedAt'> = {
      name: 'React Development',
      description: 'Proficiency in React.js framework for building user interfaces',
      category: 'technical',
      level: 4,
      details: 'Experience with hooks, context, and modern React patterns',
      source: 'example'
    };

    const saveResult = await skillsManager.saveSkill(newSkill);
    if (saveResult.error) {
      console.error('❌ Failed to save skill:', saveResult.error);
    } else {
      console.log('✅ Skill saved successfully:', saveResult.data[0]);
    }

    // 3. Search for skills by name
    console.log('\n🔍 Searching for skills...');
    const searchResult = await skillsManager.searchSkillsByName('React');
    console.log('✅ Search results:', searchResult.data.length, 'skills found');

    // 4. Get skill by ID
    if (saveResult.data && saveResult.data.length > 0) {
      const skillId = saveResult.data[0]._id;
      if (skillId) {
        console.log('\n🔍 Getting skill by ID...');
        const skillById = await skillsManager.getSkillById(skillId);
        console.log('✅ Skill by ID:', skillById.data[0]);
      }
    }

    // 5. Update a skill
    if (saveResult.data && saveResult.data.length > 0) {
      const skillId = saveResult.data[0]._id;
      if (skillId) {
        console.log('\n✏️ Updating skill...');
        const updateResult = await skillsManager.updateSkill(skillId, {
          description: 'Advanced proficiency in React.js framework for building scalable user interfaces',
          level: 5
        });
        if (updateResult.error) {
          console.error('❌ Failed to update skill:', updateResult.error);
        } else {
          console.log('✅ Skill updated successfully:', updateResult.data[0]);
        }
      }
    }

    // 6. Batch save multiple skills
    console.log('\n📦 Batch saving multiple skills...');
    const batchSkills: Array<Omit<SkillData, '_id' | 'createdAt' | 'updatedAt'>> = [
      {
        name: 'Project Management',
        description: 'Ability to plan, execute, and close projects effectively',
        category: 'professional',
        level: 3,
        details: 'Experience with Agile methodologies and project management tools',
        source: 'example'
      },
      {
        name: 'Communication',
        description: 'Effective verbal and written communication skills',
        category: 'soft',
        level: 4,
        details: 'Strong presentation skills and cross-functional collaboration',
        source: 'example'
      },
      {
        name: 'TypeScript',
        description: 'Proficiency in TypeScript for type-safe JavaScript development',
        category: 'technical',
        level: 4,
        details: 'Advanced type system usage and interface design',
        source: 'example'
      }
    ];

    const batchResult = await skillsManager.batchSaveSkills(batchSkills);
    if (batchResult.error) {
      console.error('❌ Failed to batch save skills:', batchResult.error);
    } else {
      console.log('✅ Batch saved', batchResult.data.length, 'skills');
    }

    // 7. Sync skills from external source
    console.log('\n🔄 Syncing skills from external source...');
    const externalSkills: Array<Omit<SkillData, '_id' | 'createdAt' | 'updatedAt'>> = [
      {
        name: 'Node.js',
        description: 'Server-side JavaScript runtime environment',
        category: 'technical',
        level: 3,
        details: 'Experience with Express.js and RESTful API development',
        source: 'external'
      },
      {
        name: 'Leadership',
        description: 'Ability to lead and motivate teams',
        category: 'soft',
        level: 4,
        details: 'Team management and strategic decision making',
        source: 'external'
      }
    ];

    const syncResult = await skillsManager.syncSkills(externalSkills);
    if (syncResult.error) {
      console.error('❌ Failed to sync skills:', syncResult.error);
    } else {
      console.log('✅ Synced', syncResult.data.length, 'skills');
    }

    // 8. Get skill name by ID
    if (saveResult.data && saveResult.data.length > 0) {
      const skillId = saveResult.data[0]._id;
      if (skillId) {
        console.log('\n🔍 Getting skill name by ID...');
        const skillName = await skillsManager.getSkillNameById(skillId);
        console.log('✅ Skill name:', skillName);
      }
    }

    // 9. Get skill ID by name
    console.log('\n🔍 Getting skill ID by name...');
    const skillId = await skillsManager.getSkillIdByName('React Development', 'technical');
    console.log('✅ Skill ID for "React Development":', skillId);

    // 10. Final load to see all changes
    console.log('\n📋 Final load of all skills...');
    const finalSkills = await skillsManager.getAllSkills();
    console.log('✅ Final skills count:', {
      soft: finalSkills.soft.length,
      technical: finalSkills.technical.length,
      professional: finalSkills.professional.length
    });

    console.log('\n🎉 Skills Database Example completed successfully!');

  } catch (error) {
    console.error('❌ Error in skills database example:', error);
  }
}

// Example: How to integrate with the existing components
export function integrateWithComponents() {
  console.log('🔗 Integration Example with Components');

  // Example: In a React component, you can use the skillsManager like this:
  
  /*
  import React, { useState, useEffect } from 'react';
  import { skillsManager } from '../lib/skillsManager';

  const MyComponent = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      loadSkills();
    }, []);

    const loadSkills = async () => {
      setLoading(true);
      try {
        const allSkills = await skillsManager.getAllSkills();
        setSkills(allSkills.technical); // Use technical skills
      } catch (error) {
        console.error('Failed to load skills:', error);
      } finally {
        setLoading(false);
      }
    };

    const addSkill = async (skillData) => {
      try {
        const result = await skillsManager.saveSkill(skillData);
        if (result.data) {
          await loadSkills(); // Reload skills
        }
      } catch (error) {
        console.error('Failed to add skill:', error);
      }
    };

    return (
      <div>
        {loading ? (
          <p>Loading skills...</p>
        ) : (
          <div>
            {skills.map(skill => (
              <div key={skill._id}>
                <h3>{skill.name}</h3>
                <p>{skill.description}</p>
                <span>Level: {skill.level}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  */
}

// Example: How to use with the SkillsSection component
export function integrateWithSkillsSection() {
  console.log('🔗 Integration Example with SkillsSection');

  /*
  // In SkillsSection.tsx, you can replace the direct API calls with skillsManager:

  import { skillsManager } from '../lib/skillsManager';

  // Replace the existing useEffect that fetches skills:
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoadingSkills(prev => ({ ...prev, professional: true }));
        setErrorSkills(prev => ({ ...prev, professional: false }));
        
        const result = await skillsManager.getSkillsByCategory('professional');
        
        if (result.error) {
          setErrorSkills(prev => ({ ...prev, professional: true }));
        } else {
          setProfessionalSkills(result.data || []);
        }
        
        setLoadingSkills(prev => ({ ...prev, professional: false }));
      } catch (error) {
        console.error('Error fetching professional skills:', error);
        setLoadingSkills(prev => ({ ...prev, professional: false }));
        setErrorSkills(prev => ({ ...prev, professional: true }));
      }
    };

    fetchSkills();
  }, []);

  // This provides better error handling, caching, and consistency
  */
} 