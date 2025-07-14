import type { Gig, GigHistory } from './types';

// TODO: Implement these functions with your preferred storage solution
export async function createGig(gigData: Partial<Gig>) {
  throw new Error('Not implemented');
}

export async function updateGig(id: string, updates: Partial<Gig>) {
  throw new Error('Not implemented');
}

export async function submitForReview(id: string) {
  return updateGig(id, { status: 'pending_review' });
}

export async function publishGig(id: string) {
  return updateGig(id, { status: 'published' });
}

export async function closeGig(id: string) {
  return updateGig(id, { status: 'closed' });
}

export async function getGigHistory(gigId: string) {
  throw new Error('Not implemented');
}