# ObjectId Migration Guide

## Vue d'ensemble

Ce guide explique comment tester et utiliser le système de migration automatique des skills de string vers ObjectId dans l'application.

## Problème résolu

Avant la migration, les skills étaient stockés comme des strings simples :
```javascript
{ skill: "Ticket Management", level: 1, details: "Generated skill" }
```

Après la migration, ils sont stockés comme des ObjectIds MongoDB :
```javascript
{ skill: { $oid: "507f1f77bcf86cd799439011" }, level: 1, details: "Generated skill" }
```

## Système de migration automatique

### 1. Migration globale
- S'exécute automatiquement quand les skills sont chargés depuis l'API
- Convertit tous les skills string en ObjectIds
- Met à jour les suggestions en temps réel

### 2. Migration forcée
- Vérifie les skills au montage du composant
- Déclenche une migration si des skills string sont détectés
- Utilise des événements personnalisés pour la synchronisation

### 3. Migration locale (SkillsSection)
- S'exécute dans le composant SkillsSection
- Migre les skills lors de l'édition et de l'ajout
- Préserve les ObjectIds existants

## Comment tester la migration

### Test 1: Dans la console du navigateur

```javascript
// Importer et exécuter le test de migration
import('./src/examples/testMigration.ts').then(m => {
  m.testMigrationInBrowser();
});
```

### Test 2: Dans l'application

```javascript
// Déclencher la migration forcée
import('./src/examples/testMigration.ts').then(m => {
  m.testMigrationInApp();
});
```

### Test 3: Test manuel

1. **Créer un gig avec des skills générés par l'IA**
   - Aller sur la page de création de gig
   - Entrer un titre et description
   - Laisser l'IA générer des suggestions

2. **Vérifier les logs de migration**
   - Ouvrir la console du navigateur
   - Chercher les logs commençant par `🔄` et `✅`
   - Exemple :
   ```
   🔄 Running global skills migration...
   🔄 Global migration: "Ticket Management" (professional)
   ✅ Global migration to ObjectId: 507f1f77bcf86cd799439011
   ```

3. **Vérifier les données finales**
   - Dans la console, chercher : `Current suggestions skills (with ObjectIds)`
   - Vérifier que tous les skills ont le format `{ $oid: "..." }`

## Vérification des ObjectIds

### Dans la console
```javascript
// Vérifier les skills actuels
console.log('Skills avec ObjectIds:', suggestions.skills);

// Vérifier un skill spécifique
console.log('Professional skills:', suggestions.skills.professional);
```

### Format attendu
```javascript
{
  soft: [
    { skill: { $oid: "507f1f77bcf86cd799439011" }, level: 3, details: "Team communication" }
  ],
  professional: [
    { skill: { $oid: "507f1f77bcf86cd799439013" }, level: 4, details: "Agile methodology" }
  ],
  technical: [
    { skill: { $oid: "507f1f77bcf86cd799439015" }, level: 4, details: "ES6+ features" }
  ]
}
```

## Dépannage

### Problème: Skills restent en format string

**Solution:**
1. Vérifier que les skills existent dans la base de données
2. Déclencher la migration forcée :
   ```javascript
   window.dispatchEvent(new CustomEvent('forceSkillsMigration'));
   ```
3. Vérifier les logs d'erreur dans la console

### Problème: Skills non trouvés dans la base

**Solution:**
1. Synchroniser les skills prédéfinis :
   ```javascript
   import('./src/lib/skillsManager.ts').then(m => {
     m.syncPredefinedSkills();
   });
   ```
2. Attendre que la synchronisation soit terminée
3. Recharger la page

### Problème: Erreur "Cast to ObjectId failed"

**Solution:**
1. Vérifier que la migration s'est bien exécutée
2. S'assurer que tous les skills ont des ObjectIds valides
3. Vérifier les logs de migration dans la console

## Logs de débogage

### Logs de migration
- `🔄 Running global skills migration...` - Début de migration
- `🔄 Global migration: "Skill Name" (type)` - Migration d'un skill
- `✅ Global migration to ObjectId: id` - Migration réussie
- `⚠️ Skill not found in database: "Skill Name"` - Skill non trouvé

### Logs d'ajout de skills
- `🔄 Adding skill - Type: type, Skill ID: id, Level: level` - Ajout d'un skill
- `✅ Adding skill with ObjectId: {...}` - Skill ajouté avec ObjectId

### Logs de suppression
- `🗑️ Deleting skill - Type: type, Index: index` - Suppression d'un skill
- `🗑️ Skill ObjectId to delete: id` - ObjectId du skill supprimé

## Fonctions utilitaires

### `convertSkillNamesToObjectIds(skills, skillsDatabase)`
Convertit les noms de skills en ObjectIds.

### `syncPredefinedSkills()`
Synchronise les skills prédéfinis avec la base de données.

### `generateSkillsWithObjectIds(skillsDatabase)`
Génère des skills avec des ObjectIds.

## Intégration avec l'API

### Sauvegarde
Les skills sont automatiquement envoyés au format ObjectId lors de la sauvegarde :
```javascript
// Format envoyé à l'API
{
  skills: {
    professional: [
      { skill: { $oid: "507f1f77bcf86cd799439013" }, level: 4, details: "..." }
    ]
  }
}
```

### Chargement
Les skills sont automatiquement migrés lors du chargement si nécessaire.

## Tests automatisés

Exécuter tous les tests :
```javascript
import('./src/examples/testObjectIds.ts').then(m => {
  m.runAllObjectIdTests();
});
```

## Support

En cas de problème :
1. Vérifier les logs dans la console
2. Utiliser les fonctions de test
3. Vérifier que les skills existent dans la base de données
4. Déclencher la migration forcée si nécessaire 