import { GIG_STATUS, getStatusLabel, getStatusColor, GigStatus } from '../lib/gigStatus';

// Test the gig status functionality
console.log('=== Gig Status Test ===');

// Test all status values
Object.values(GIG_STATUS).forEach(status => {
  console.log(`Status: ${status}`);
  console.log(`  English Label: ${getStatusLabel(status, 'en')}`);
  console.log(`  French Label: ${getStatusLabel(status, 'fr')}`);
  console.log(`  Color Classes: ${getStatusColor(status)}`);
  console.log('---');
});

// Test default status
console.log('Default Status:', GIG_STATUS.TO_ACTIVATE);
console.log('Default Status Label:', getStatusLabel(GIG_STATUS.TO_ACTIVATE));

// Test status validation
const validStatuses: GigStatus[] = ['to_activate', 'active', 'inactive', 'archived'];
console.log('Valid Statuses:', validStatuses);

// Example gig data with status
const exampleGig = {
  id: '123',
  title: 'Customer Service Representative',
  description: 'Handle customer inquiries and support',
  status: GIG_STATUS.TO_ACTIVATE as GigStatus,
  // ... other fields
};

console.log('Example Gig:', exampleGig);
console.log('Gig Status Label:', getStatusLabel(exampleGig.status)); 