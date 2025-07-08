# Skills Database Management System

Ce système permet de gérer les compétences (skills) dans la base de données avec des références ObjectId MongoDB.

## 🎯 Objectif

Enregistrer et gérer les IDs des compétences à partir des endpoints dans la base de données des compétences, en utilisant le format MongoDB ObjectId `{ $oid: string }`.

## 📁 Structure des fichiers

```
src/
├── lib/
│   ├── api.ts                    # Fonctions API pour les compétences
│   └── skillsManager.ts          # Gestionnaire de compétences avec cache
├── components/
│   ├── SkillsSection.tsx         # Composant d'affichage des compétences
│   ├── Suggestions.tsx           # Composant de suggestions
│   └── SkillsDatabaseManager.tsx # Interface de gestion des compétences
└── examples/
    └── skillsDatabaseExample.ts  # Exemples d'utilisation
```

## 🔧 Fonctionnalités

### 1. Gestion des compétences par catégorie
- **Soft Skills** : Compétences interpersonnelles
- **Technical Skills** : Compétences techniques
- **Professional Skills** : Compétences professionnelles

### 2. Opérations CRUD
- ✅ **Create** : Ajouter une nouvelle compétence
- 📖 **Read** : Récupérer les compétences par catégorie ou ID
- ✏️ **Update** : Modifier une compétence existante
- 🗑️ **Delete** : Supprimer une compétence

### 3. Fonctionnalités avancées
- 🔍 **Recherche** : Rechercher par nom
- 📦 **Batch operations** : Opérations en lot
- 🔄 **Sync** : Synchronisation depuis des sources externes
- 💾 **Cache** : Mise en cache pour les performances

## 🚀 Utilisation

### Installation et import

```typescript
import { skillsManager, SkillData } from '../lib/skillsManager';
```

### Exemples d'utilisation

#### 1. Charger toutes les compétences

```typescript
const allSkills = await skillsManager.getAllSkills();
console.log('Soft skills:', allSkills.soft.length);
console.log('Technical skills:', allSkills.technical.length);
console.log('Professional skills:', allSkills.professional.length);
```

#### 2. Ajouter une nouvelle compétence

```typescript
const newSkill = {
  name: 'React Development',
  description: 'Proficiency in React.js framework',
  category: 'technical' as const,
  level: 4,
  source: 'manual'
};

const result = await skillsManager.saveSkill(newSkill);
if (result.data) {
  console.log('Skill saved:', result.data[0]);
}
```

#### 3. Rechercher des compétences

```typescript
const searchResult = await skillsManager.searchSkillsByName('React', 'technical');
console.log('Found skills:', searchResult.data);
```

#### 4. Mettre à jour une compétence

```typescript
const updateResult = await skillsManager.updateSkill(skillId, {
  description: 'Updated description',
  level: 5
});
```

#### 5. Supprimer une compétence

```typescript
const deleteResult = await skillsManager.deleteSkill(skillId, 'technical');
```

## 🔗 Intégration avec les composants existants

### SkillsSection.tsx

Remplacez les appels API directs par le skillsManager :

```typescript
// Avant
const response = await fetch('https://api-repcreationwizard.harx.ai/api/skills/professional');

// Après
const result = await skillsManager.getSkillsByCategory('professional');
if (result.data) {
  setProfessionalSkills(result.data);
}
```

### Suggestions.tsx

Utilisez le skillsManager pour la gestion des ObjectId :

```typescript
// Obtenir l'ID d'une compétence par son nom
const skillId = await skillsManager.getSkillIdByName('React Development', 'technical');

// Obtenir le nom d'une compétence par son ID
const skillName = await skillsManager.getSkillNameById(skillObjectId);
```

## 📊 Format des données

### Structure d'une compétence

```typescript
interface SkillData {
  _id?: string;                    // MongoDB ObjectId
  name: string;                    // Nom de la compétence
  description: string;             // Description
  category: 'soft' | 'technical' | 'professional';
  level?: number;                  // Niveau (1-5)
  details?: string;                // Détails supplémentaires (correspond au backend)
  source?: string;                 // Source de la compétence
  createdAt?: string;              // Date de création
  updatedAt?: string;              // Date de modification
}
```

### Format ObjectId MongoDB

```typescript
// Dans les données de gig (correspond au backend mongoose.Types.ObjectId)
{
  skills: {
    technical: [
      {
        skill: { $oid: "507f1f77bcf86cd799439011" }, // Référence ObjectId
        level: 4,
        details: "Experience with hooks, context, and modern React patterns"
      }
    ]
  }
}
```

## 🎨 Interface utilisateur

### SkillsDatabaseManager

Composant React pour gérer les compétences avec une interface graphique :

```typescript
import { SkillsDatabaseManager } from '../components/SkillsDatabaseManager';

// Dans votre composant
const [showSkillsManager, setShowSkillsManager] = useState(false);

{showSkillsManager && (
  <SkillsDatabaseManager onClose={() => setShowSkillsManager(false)} />
)}
```

**Fonctionnalités de l'interface :**
- 📋 Affichage des compétences par catégorie
- 🔍 Recherche en temps réel
- ➕ Ajout de nouvelles compétences
- ✏️ Édition des compétences existantes
- 🗑️ Suppression de compétences
- 🔄 Actualisation des données

## 🔧 Configuration des endpoints

Les endpoints sont configurés dans `src/lib/api.ts` :

```typescript
const API_BASE_URL = 'https://api-repcreationwizard.harx.ai/api';

// Endpoints disponibles
GET    /skills/soft              // Récupérer les soft skills
GET    /skills/technical         // Récupérer les technical skills
GET    /skills/professional      // Récupérer les professional skills
POST   /skills/{category}        // Ajouter une compétence
PUT    /skills/{id}              // Modifier une compétence
DELETE /skills/{id}              // Supprimer une compétence
GET    /skills/search?name={name}&category={category}  // Rechercher
GET    /skills/id/{id}           // Récupérer par ID
```

## 🚨 Gestion des erreurs

Le système inclut une gestion robuste des erreurs :

```typescript
const result = await skillsManager.saveSkill(skillData);
if (result.error) {
  console.error('Erreur:', result.error.message);
  // Gérer l'erreur dans l'interface utilisateur
} else {
  console.log('Succès:', result.data);
}
```

## 💾 Cache et performances

Le `SkillsManager` utilise un système de cache pour optimiser les performances :

```typescript
// Le cache est automatiquement géré
const skills1 = await skillsManager.getSkillsByCategory('technical'); // API call
const skills2 = await skillsManager.getSkillsByCategory('technical'); // Cache

// Vider le cache si nécessaire
skillsManager.clearCache('technical'); // Cache spécifique
skillsManager.clearCache();           // Tous les caches
```

## 🔄 Synchronisation

Synchroniser des compétences depuis des sources externes :

```typescript
const externalSkills = [
  {
    name: 'New Technology',
    description: 'Description from external source',
    category: 'technical' as const,
    level: 3,
    source: 'external_api'
  }
];

const syncResult = await skillsManager.syncSkills(externalSkills);
```

## 📝 Exemples complets

Voir `src/examples/skillsDatabaseExample.ts` pour des exemples complets d'utilisation.

## 🛠️ Développement

### Ajouter une nouvelle fonctionnalité

1. Ajouter la fonction dans `src/lib/api.ts`
2. Implémenter la logique dans `src/lib/skillsManager.ts`
3. Mettre à jour l'interface dans `src/components/SkillsDatabaseManager.tsx`
4. Ajouter des tests et documentation

### Tests

```typescript
// Test d'une fonction
const testSkill = {
  name: 'Test Skill',
  description: 'Test Description',
  category: 'technical' as const,
  level: 1
};

const result = await skillsManager.saveSkill(testSkill);
expect(result.data).toBeDefined();
expect(result.data[0].name).toBe('Test Skill');
```

## 📞 Support

Pour toute question ou problème :
1. Vérifiez la documentation
2. Consultez les exemples dans `src/examples/`
3. Vérifiez les logs de la console
4. Contactez l'équipe de développement 