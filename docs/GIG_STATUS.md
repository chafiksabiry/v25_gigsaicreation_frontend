# Gig Status Feature

## Overview

The gig status feature allows tracking the lifecycle of gigs with four distinct states. Each gig has a status field that indicates its current state in the system.

## Status Values

| Status | English Label | French Label | Description |
|--------|---------------|--------------|-------------|
| `to_activate` | To Activate | À activer | Default status for new gigs, ready to be activated |
| `active` | Active | Actif | Gig is currently active and accepting applications |
| `inactive` | Inactive | Inactif | Gig is temporarily paused |
| `archived` | Archived | Archivé | Gig is permanently archived |

## Default Value

All new gigs are created with the status `'to_activate'` by default.

## Implementation

### Database Schema

The status field is stored in the database with the following characteristics:
- **Type**: `gig_status` enum
- **Default**: `'to_activate'`
- **Required**: Yes
- **Values**: `'to_activate'`, `'active'`, `'inactive'`, `'archived'`

### Backend Model

The MongoDB schema includes the status field:

```typescript
status: { 
  type: String, 
  enum: ['to_activate', 'active', 'inactive', 'archived'],
  default: 'to_activate',
  required: true
}
```

### Frontend Components

#### Status Selector Component

The `GigStatusSelector` component provides a user-friendly interface for changing gig status:

```tsx
<GigStatusSelector
  value={gig.status}
  onChange={(status) => updateGigStatus(status)}
  language="en"
/>
```

#### Status Badge Component

The `GigStatusBadge` component displays the current status with appropriate styling:

```tsx
<GigStatusBadge 
  status={gig.status} 
  showIcon={true}
  language="en"
/>
```

### Utility Functions

The `gigStatus.ts` utility file provides helper functions:

- `getStatusLabel(status, language)`: Get human-readable status label
- `getStatusColor(status)`: Get CSS classes for status styling
- `isActiveStatus(status)`: Check if status is active
- `canEditStatus(status)`: Check if gig can be edited

## Usage Examples

### Setting Status

```typescript
import { GIG_STATUS } from '../lib/gigStatus';

// Set gig to active
gig.status = GIG_STATUS.ACTIVE;

// Set gig to archived
gig.status = GIG_STATUS.ARCHIVED;
```

### Displaying Status

```typescript
import { getStatusLabel, getStatusColor } from '../lib/gigStatus';

const statusLabel = getStatusLabel(gig.status, 'en'); // "To Activate"
const statusColor = getStatusColor(gig.status); // "bg-yellow-100 text-yellow-800"
```

### Status Validation

```typescript
import { GigStatus } from '../lib/gigStatus';

function isValidStatus(status: string): status is GigStatus {
  return ['to_activate', 'active', 'inactive', 'archived'].includes(status);
}
```

## Migration

The status field was added via database migration `20250120115000_add_gig_status.sql` which:

1. Creates the `gig_status` enum type
2. Adds the `status` column to the `gigs` table
3. Sets the default value to `'to_activate'`

## UI Integration

The status field is integrated into:

1. **BasicSection**: Status selector in the gig creation form
2. **GigReview**: Status badge display in the review page
3. **GigView**: Status display when viewing existing gigs

## Color Scheme

Each status has a distinct color scheme for visual identification:

- **To Activate**: Yellow (`bg-yellow-100 text-yellow-800`)
- **Active**: Green (`bg-green-100 text-green-800`)
- **Inactive**: Gray (`bg-gray-100 text-gray-800`)
- **Archived**: Red (`bg-red-100 text-red-800`)

## Future Enhancements

Potential future improvements:

1. Status transition rules (e.g., prevent direct transition from active to archived)
2. Status change history tracking
3. Automated status transitions based on time or conditions
4. Status-based filtering and search
5. Status change notifications 