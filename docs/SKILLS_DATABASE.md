# Skills Database Management

## Overview

The Skills Database system manages skills as MongoDB ObjectId references rather than simple strings. This ensures data consistency and allows for detailed skill information including descriptions, categories, and metadata.

## Problem Resolution: ObjectId Cast Errors

### The Issue
If you encounter errors like:
```
Cast to ObjectId failed for value "Ticket Management" (type string) at path "skill"
```

This means the system is trying to use skill names as ObjectIds, but the skills don't exist in the database yet.

### The Solution
All predefined skills must be synchronized with the database before use. The system provides automatic synchronization:

1. **Automatic Sync**: The `generateSkills()` function automatically syncs predefined skills
2. **Manual Sync**: Use the "Sync Predefined Skills" button in the Skills Database Manager
3. **Programmatic Sync**: Call `syncPredefinedSkills()` directly

## Data Structure

### Skill Object Structure
```typescript
interface Skill {
  _id: string;           // MongoDB ObjectId
  name: string;          // Skill name (e.g., "Active Listening")
  description: string;   // Detailed description
  category: string;      // "soft", "professional", or "technical"
  createdAt?: string;
  updatedAt?: string;
}
```

### Gig Skill Reference Structure
```typescript
interface GigSkill {
  skill: { $oid: string };  // MongoDB ObjectId reference
  level: number;            // 1-5 skill level
  details: string;          // Additional context
}
```

## API Endpoints

### Skills Management
- `GET /api/skills/:category` - Get skills by category
- `POST /api/skills` - Create new skill
- `PUT /api/skills/:id` - Update skill
- `DELETE /api/skills/:id` - Delete skill
- `GET /api/skills/search/:query` - Search skills

### Categories
- `soft` - Interpersonal and communication skills
- `professional` - Industry-specific and business skills
- `technical` - Tools, software, and technical competencies

## Usage Examples

### 1. Initialize Skills Database
```typescript
import { syncPredefinedSkills } from '../lib/skillsManager';

// Sync all predefined skills with the database
await syncPredefinedSkills();
```

### 2. Generate Skills for a Gig
```typescript
import { generateSkills } from '../lib/ai';

// This automatically syncs predefined skills and returns ObjectIds
const skills = await generateSkills('Customer Service Representative', 'Provide excellent customer support');
```

### 3. Convert Skill Names to ObjectIds
```typescript
import { convertSkillNamesToObjectIds } from '../lib/skillsManager';

const skillNames = ['Active Listening', 'Email Support'];
const objectIds = await convertSkillNamesToObjectIds(skillNames, 'soft');
// Returns: [{ $oid: "507f1f77bcf86cd799439011" }, { $oid: "507f1f77bcf86cd799439012" }]
```

### 4. Create a Gig with Skills
```typescript
const gigData = {
  title: 'Customer Service Representative',
  description: 'Provide excellent customer support',
  skills: {
    languages: [
      { language: 'English', proficiency: 'C1', iso639_1: 'en' }
    ],
    soft: [
      { skill: { $oid: '507f1f77bcf86cd799439011' }, level: 3, details: 'Essential for customer interaction' }
    ],
    professional: [
      { skill: { $oid: '507f1f77bcf86cd799439012' }, level: 4, details: 'Core responsibility' }
    ],
    technical: [
      { skill: { $oid: '507f1f77bcf86cd799439013' }, level: 2, details: 'Basic proficiency required' }
    ]
  }
};
```

## Frontend Integration

### SkillsSection Component
The `SkillsSection` component automatically:
- Loads skills from the API
- Displays skill names while storing ObjectIds
- Handles skill selection and level assignment
- Manages the `details` field

### SkillsDatabaseManager Component
Provides a UI for:
- Viewing all skills by category
- Adding new skills
- Editing existing skills
- Deleting skills
- Searching skills
- **Syncing predefined skills** (resolves ObjectId issues)

## Error Handling

### Common Issues and Solutions

1. **ObjectId Cast Errors**
   - **Cause**: Skills don't exist in database
   - **Solution**: Run `syncPredefinedSkills()` or use the sync button

2. **Missing Skills**
   - **Cause**: Skill names don't match database
   - **Solution**: Check spelling or create missing skills

3. **API Connection Issues**
   - **Cause**: Network or server problems
   - **Solution**: Check API endpoints and network connectivity

### Debugging
```typescript
// Check if skills exist
const skills = await searchSkillsByName('Active Listening', 'soft');
console.log('Found skills:', skills);

// Verify ObjectId format
const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
```

## Best Practices

1. **Always sync predefined skills** before generating gigs
2. **Use the SkillsDatabaseManager** for manual skill management
3. **Validate skill names** before converting to ObjectIds
4. **Handle errors gracefully** with proper user feedback
5. **Cache skill data** to improve performance
6. **Use consistent skill naming** across the application

## Migration Guide

### From String-based Skills to ObjectId References

1. **Backup existing data**
2. **Run skills synchronization**
3. **Update existing gigs** to use ObjectId references
4. **Test thoroughly** before deployment

### Example Migration Script
```typescript
async function migrateSkillsToObjectIds() {
  // 1. Sync predefined skills
  await syncPredefinedSkills();
  
  // 2. Get existing gigs with string skills
  const gigs = await getExistingGigs();
  
  // 3. Convert each gig's skills
  for (const gig of gigs) {
    const convertedSkills = {
      soft: await convertSkillNamesToObjectIds(gig.skills.soft, 'soft'),
      professional: await convertSkillNamesToObjectIds(gig.skills.professional, 'professional'),
      technical: await convertSkillNamesToObjectIds(gig.skills.technical, 'technical')
    };
    
    // 4. Update gig with ObjectId references
    await updateGig(gig._id, { skills: convertedSkills });
  }
}
```

## Troubleshooting

### Quick Fix for ObjectId Errors
1. Open the Skills Database Manager
2. Click "Sync Predefined Skills"
3. Wait for completion
4. Try creating the gig again

### Manual Skill Creation
If automatic sync fails:
1. Use the Skills Database Manager to add missing skills
2. Ensure skill names match exactly
3. Verify category assignment

### API Debugging
```typescript
// Test API connectivity
const response = await fetch('/api/skills/soft');
console.log('API response:', response.status, await response.json());
```

This system ensures all skills are properly managed as MongoDB ObjectId references, preventing cast errors and maintaining data integrity. 