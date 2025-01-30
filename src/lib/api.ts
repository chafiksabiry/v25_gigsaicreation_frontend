import { supabase } from './supabase';
import type { Gig, GigHistory } from './types';

export async function createGig(gigData: Partial<Gig>) {
  const { data, error } = await supabase
    .from('gigs')
    .insert([{ ...gigData, status: 'draft' }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateGig(id: string, updates: Partial<Gig>) {
  const { data, error } = await supabase
    .from('gigs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
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
  const { data, error } = await supabase
    .from('gig_history')
    .select(`
      *,
      changed_by:profiles(username, full_name)
    `)
    .eq('gig_id', gigId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}