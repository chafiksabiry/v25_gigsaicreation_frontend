# Skills Components Documentation

## Overview

This document describes the skills components that correspond to the skills schema defined in `src/types/index.ts`. The components provide different ways to display and interact with skills data.

## Components

### 1. SkillsDisplay

A flexible component for displaying skills in different layouts and styles.

#### Props

```typescript
interface SkillsDisplayProps {
  skills: {
    languages: Array<{ 
      language: string; 
      proficiency: string;
      iso639_1: string;
    }>;
    soft: Array<{
      skill: string;
      level: number;
    }>;
    professional: Array<{
      skill: string;
      level: number;
    }>;
    technical: Array<{
      skill: string;
      level: number;
    }>;
    certifications: Array<{
      name: string;
      required: boolean;
      provider?: string;
    }>;
  };
  variant?: 'default' | 'compact' | 'detailed';
  showLevels?: boolean;
  className?: string;
}
```

#### Variants

- **default**: Full layout with sections for each skill type
- **compact**: Simple badge layout for quick overview
- **detailed**: Includes a skills summary with statistics

#### Usage

```tsx
import { SkillsDisplay } from './SkillsDisplay';

const skills = {
  languages: [
    { language: 'English', proficiency: 'C1 - Advanced', iso639_1: 'en' }
  ],
  professional: [
    { skill: 'Sales Management', level: 4 }
  ],
  // ... other skills
};

<SkillsDisplay 
  skills={skills}
  variant="default"
  showLevels={true}
/>
```

### 2. SkillsCard

An interactive card component with expandable sections and editing capabilities.

#### Props

```typescript
interface SkillsCardProps {
  skills: {
    // Same structure as SkillsDisplay
  };
  title?: string;
  subtitle?: string;
  editable?: boolean;
  onEdit?: () => void;
  onAdd?: () => void;
  className?: string;
}
```

#### Features

- **Expandable sections**: Click to show/hide skill details
- **Skills summary**: Overview of skill counts by category
- **Interactive editing**: Optional edit and add buttons
- **Responsive design**: Adapts to different screen sizes

#### Usage

```tsx
import { SkillsCard } from './SkillsCard';

<SkillsCard 
  skills={skills}
  title="Required Skills"
  subtitle="Skills and competencies for this position"
  editable={true}
/>
```

## Skill Levels

### Professional, Technical, and Soft Skills

Skills use a 1-5 level system:

1. **Basic** (⭐) - Gray
2. **Intermediate** (📈) - Blue  
3. **Advanced** (⚡) - Purple
4. **Expert** (🏆) - Green
5. **Master** (❤️) - Red

### Languages

Languages use CEFR levels:

- **A1 - Beginner** - Gray
- **A2 - Elementary** - Blue
- **B1 - Intermediate** - Yellow
- **B2 - Upper Intermediate** - Orange
- **C1 - Advanced** - Purple
- **C2 - Mastery** - Green

## Styling

Both components use Tailwind CSS and support:

- **Custom className**: Add additional styling
- **Responsive design**: Mobile-first approach
- **Color-coded sections**: Each skill type has its own color theme
- **Hover effects**: Interactive elements with smooth transitions
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Examples

See `SkillsExample.tsx` for comprehensive usage examples including:

- Different variants of SkillsDisplay
- Interactive and read-only SkillsCard
- Custom styling examples
- All skill types and levels

## Integration

These components can be integrated into:

- Gig creation forms
- Gig detail pages
- User profiles
- Skill assessment tools
- Job posting displays

## Schema Compliance

Both components fully comply with the skills schema defined in `src/types/index.ts`:

```typescript
skills: {
  languages: Array<{ language: string; proficiency: string; iso639_1: string; }>;
  soft: Array<{ skill: string; level: number; }>;
  professional: Array<{ skill: string; level: number; }>;
  technical: Array<{ skill: string; level: number; }>;
  certifications: Array<{ name: string; required: boolean; provider?: string; }>;
}
``` 