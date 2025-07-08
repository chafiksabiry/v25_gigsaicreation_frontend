import { 
  saveSkillToDatabase, 
  updateSkillInDatabase, 
  deleteSkillFromDatabase, 
  getSkillById, 
  searchSkillsByName, 
  syncSkillsToDatabase,
  fetchSoftSkills,
  fetchTechnicalSkills,
  fetchProfessionalSkills
} from './api';

export interface SkillData {
  _id?: string;
  name: string;
  description: string;
  category: 'soft' | 'technical' | 'professional';
  level?: number;
  details?: string; // Add details field to match backend
  source?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SkillSearchResult {
  data: SkillData[];
  error?: Error;
}

export class SkillsManager {
  private static instance: SkillsManager;
  private skillsCache: Map<string, SkillData[]> = new Map();

  static getInstance(): SkillsManager {
    if (!SkillsManager.instance) {
      SkillsManager.instance = new SkillsManager();
    }
    return SkillsManager.instance;
  }

  // Get all skills from cache or API
  async getAllSkills(): Promise<{
    soft: SkillData[];
    technical: SkillData[];
    professional: SkillData[];
  }> {
    try {
      const [softResult, technicalResult, professionalResult] = await Promise.all([
        this.getSkillsByCategory('soft'),
        this.getSkillsByCategory('technical'),
        this.getSkillsByCategory('professional')
      ]);

      return {
        soft: softResult.data || [],
        technical: technicalResult.data || [],
        professional: professionalResult.data || []
      };
    } catch (error) {
      console.error('Error getting all skills:', error);
      return {
        soft: [],
        technical: [],
        professional: []
      };
    }
  }

  // Get skills by category with caching
  async getSkillsByCategory(category: 'soft' | 'technical' | 'professional'): Promise<SkillSearchResult> {
    const cacheKey = `skills_${category}`;
    
    // Check cache first
    if (this.skillsCache.has(cacheKey)) {
      const cachedSkills = this.skillsCache.get(cacheKey);
      if (cachedSkills && cachedSkills.length > 0) {
        return { data: cachedSkills };
      }
    }

    try {
      let result;
      switch (category) {
        case 'soft':
          result = await fetchSoftSkills();
          break;
        case 'technical':
          result = await fetchTechnicalSkills();
          break;
        case 'professional':
          result = await fetchProfessionalSkills();
          break;
        default:
          throw new Error(`Unknown category: ${category}`);
      }

      if (result.error) {
        throw result.error;
      }

      // Cache the results
      this.skillsCache.set(cacheKey, result.data || []);
      
      return { data: result.data || [] };
    } catch (error) {
      console.error(`Error fetching ${category} skills:`, error);
      return { 
        data: [], 
        error: error instanceof Error ? error : new Error(`Failed to fetch ${category} skills`) 
      };
    }
  }

  // Save a new skill to database
  async saveSkill(skillData: Omit<SkillData, '_id' | 'createdAt' | 'updatedAt'>): Promise<SkillSearchResult> {
    try {
      const result = await saveSkillToDatabase(skillData);
      
      if (result.error) {
        throw result.error;
      }

      // Clear cache for this category to force refresh
      this.skillsCache.delete(`skills_${skillData.category}`);
      
      return { data: [result.data] };
    } catch (error) {
      console.error('Error saving skill:', error);
      return { 
        data: [], 
        error: error instanceof Error ? error : new Error('Failed to save skill') 
      };
    }
  }

  // Update an existing skill
  async updateSkill(skillId: string, updates: Partial<SkillData>): Promise<SkillSearchResult> {
    try {
      const result = await updateSkillInDatabase(skillId, updates);
      
      if (result.error) {
        throw result.error;
      }

      // Clear cache for this category to force refresh
      if (updates.category) {
        this.skillsCache.delete(`skills_${updates.category}`);
      }
      
      return { data: [result.data] };
    } catch (error) {
      console.error('Error updating skill:', error);
      return { 
        data: [], 
        error: error instanceof Error ? error : new Error('Failed to update skill') 
      };
    }
  }

  // Delete a skill from database
  async deleteSkill(skillId: string, category?: 'soft' | 'technical' | 'professional'): Promise<SkillSearchResult> {
    try {
      const result = await deleteSkillFromDatabase(skillId);
      
      if (result.error) {
        throw result.error;
      }

      // Clear cache for this category to force refresh
      if (category) {
        this.skillsCache.delete(`skills_${category}`);
      }
      
      return { data: [result.data] };
    } catch (error) {
      console.error('Error deleting skill:', error);
      return { 
        data: [], 
        error: error instanceof Error ? error : new Error('Failed to delete skill') 
      };
    }
  }

  // Get skill by ID
  async getSkillById(skillId: string): Promise<SkillSearchResult> {
    try {
      const result = await getSkillById(skillId);
      
      if (result.error) {
        throw result.error;
      }
      
      return { data: [result.data] };
    } catch (error) {
      console.error('Error getting skill by ID:', error);
      return { 
        data: [], 
        error: error instanceof Error ? error : new Error('Failed to get skill by ID') 
      };
    }
  }

  // Search skills by name
  async searchSkillsByName(name: string, category?: 'soft' | 'technical' | 'professional'): Promise<SkillSearchResult> {
    try {
      const result = await searchSkillsByName(name, category);
      
      if (result.error) {
        throw result.error;
      }
      
      return { data: result.data || [] };
    } catch (error) {
      console.error('Error searching skills by name:', error);
      return { 
        data: [], 
        error: error instanceof Error ? error : new Error('Failed to search skills by name') 
      };
    }
  }

  // Sync skills from external sources
  async syncSkills(skills: Array<Omit<SkillData, '_id' | 'createdAt' | 'updatedAt'>>): Promise<SkillSearchResult> {
    try {
      const result = await syncSkillsToDatabase(skills);
      
      if (result.error) {
        throw result.error;
      }

      // Clear all caches to force refresh
      this.skillsCache.clear();
      
      return { data: result.data || [] };
    } catch (error) {
      console.error('Error syncing skills:', error);
      return { 
        data: [], 
        error: error instanceof Error ? error : new Error('Failed to sync skills') 
      };
    }
  }

  // Clear cache
  clearCache(category?: 'soft' | 'technical' | 'professional'): void {
    if (category) {
      this.skillsCache.delete(`skills_${category}`);
    } else {
      this.skillsCache.clear();
    }
  }

  // Get skill name by ID from cache or API
  async getSkillNameById(skillId: string): Promise<string | null> {
    try {
      // First check cache
      for (const [cacheKey, skills] of this.skillsCache.entries()) {
        const skill = skills.find(s => s._id === skillId);
        if (skill) {
          return skill.name;
        }
      }

      // If not in cache, fetch from API
      const result = await this.getSkillById(skillId);
      if (result.data && result.data.length > 0) {
        return result.data[0].name;
      }

      return null;
    } catch (error) {
      console.error('Error getting skill name by ID:', error);
      return null;
    }
  }

  // Get skill ID by name from cache or API
  async getSkillIdByName(name: string, category?: 'soft' | 'technical' | 'professional'): Promise<string | null> {
    try {
      // First check cache
      if (category) {
        const cachedSkills = this.skillsCache.get(`skills_${category}`);
        if (cachedSkills) {
          const skill = cachedSkills.find(s => s.name.toLowerCase() === name.toLowerCase());
          if (skill) {
            return skill._id;
          }
        }
      } else {
        // Check all categories
        for (const [cacheKey, skills] of this.skillsCache.entries()) {
          const skill = skills.find(s => s.name.toLowerCase() === name.toLowerCase());
          if (skill) {
            return skill._id;
          }
        }
      }

      // If not in cache, search API
      const result = await this.searchSkillsByName(name, category);
      if (result.data && result.data.length > 0) {
        return result.data[0]._id;
      }

      return null;
    } catch (error) {
      console.error('Error getting skill ID by name:', error);
      return null;
    }
  }

  // Batch operations
  async batchSaveSkills(skills: Array<Omit<SkillData, '_id' | 'createdAt' | 'updatedAt'>>): Promise<SkillSearchResult> {
    try {
      const results = [];
      
      for (const skill of skills) {
        try {
          const result = await this.saveSkill(skill);
          if (result.data && result.data.length > 0) {
            results.push(result.data[0]);
          }
        } catch (skillError) {
          console.error(`Error saving skill ${skill.name}:`, skillError);
          // Continue with other skills even if one fails
        }
      }
      
      return { data: results };
    } catch (error) {
      console.error('Error in batch save skills:', error);
      return { 
        data: [], 
        error: error instanceof Error ? error : new Error('Failed to batch save skills') 
      };
    }
  }
}

// Export singleton instance
export const skillsManager = SkillsManager.getInstance(); 