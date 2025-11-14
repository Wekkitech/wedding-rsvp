import { supabaseAdmin } from './supabase-admin';
import { Guest, RSVP, RSVPWithGuest } from './types';

const MAX_GUESTS = parseInt(process.env.MAX_GUESTS || '70');

export async function getConfirmedRSVPCount(): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('rsvps')
    .select('*', { count: 'exact', head: true })
    .eq('attending', true)
    .eq('is_waitlisted', false);

  if (error) {
    console.error('Error getting RSVP count:', error);
    return 0;
  }

  return count || 0;
}

export async function shouldWaitlist(): Promise<boolean> {
  const count = await getConfirmedRSVPCount();
  return count >= MAX_GUESTS;
}

export async function createOrUpdateGuest(email: string, data?: Partial<Guest>): Promise<Guest | null> {
  const { data: existingGuest } = await supabaseAdmin
    .from('guests')
    .select('*')
    .eq('email', email)
    .single();

  if (existingGuest) {
    const { data: updatedGuest, error } = await supabaseAdmin
      .from('guests')
      .update({ ...data, last_login: new Date().toISOString() })
      .eq('id', existingGuest.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating guest:', error);
      return null;
    }
    return updatedGuest;
  }

  const { data: newGuest, error } = await supabaseAdmin
    .from('guests')
    .insert({ email, ...data })
    .select()
    .single();

  if (error) {
    console.error('Error creating guest:', error);
    return null;
  }

  return newGuest;
}

export async function getGuestByEmail(email: string): Promise<Guest | null> {
  const { data, error } = await supabaseAdmin
    .from('guests')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error getting guest:', error);
    return null;
  }

  return data;
}

export async function getRSVPByGuestId(guestId: string): Promise<RSVP | null> {
  const { data, error } = await supabaseAdmin
    .from('rsvps')
    .select('*')
    .eq('guest_id', guestId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error getting RSVP:', error);
    return null;
  }

  return data;
}

export async function createOrUpdateRSVP(guestId: string, rsvpData: Partial<RSVP>): Promise<RSVP | null> {
  const existingRSVP = await getRSVPByGuestId(guestId);
  
  // Check if we should waitlist new "yes" responses
  if (rsvpData.attending && !existingRSVP) {
    const shouldBeWaitlisted = await shouldWaitlist();
    rsvpData.is_waitlisted = shouldBeWaitlisted;
  }

  if (existingRSVP) {
    const { data, error } = await supabaseAdmin
      .from('rsvps')
      .update({ ...rsvpData, updated_at: new Date().toISOString() })
      .eq('id', existingRSVP.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating RSVP:', error);
      return null;
    }
    return data;
  }

  const { data, error } = await supabaseAdmin
    .from('rsvps')
    .insert({ guest_id: guestId, ...rsvpData })
    .select()
    .single();

  if (error) {
    console.error('Error creating RSVP:', error);
    return null;
  }

  return data;
}

export async function getAllRSVPs(): Promise<RSVPWithGuest[]> {
  const { data, error } = await supabaseAdmin
    .from('rsvps')
    .select(`
      *,
      guest:guests(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting all RSVPs:', error);
    return [];
  }

  return data as RSVPWithGuest[];
}

export async function isAdmin(email: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('admins')
    .select('email')
    .eq('email', email)
    .single();

  return !error && !!data;
}

// Add these functions to your existing lib/db.ts file

export async function isPhoneWhitelisted(phone: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('phone_whitelist')
    .select('phone')
    .eq('phone', phone)
    .single();

  return !error && !!data;
}

export async function getWhitelistedPhone(phone: string) {
  const { data, error } = await supabaseAdmin
    .from('phone_whitelist')
    .select('*')
    .eq('phone', phone)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error getting whitelisted phone:', error);
    return null;
  }

  return data;
}

export async function getAllWhitelistedPhones() {
  const { data, error } = await supabaseAdmin
    .from('phone_whitelist')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting whitelisted phones:', error);
    return [];
  }

  return data;
}

export async function addPhoneToWhitelist(
  phone: string, 
  name?: string, 
  notes?: string, 
  addedBy?: string
) {
  const { data, error } = await supabaseAdmin
    .from('phone_whitelist')
    .insert({
      phone,
      name: name || null,
      notes: notes || null,
      added_by: addedBy || null
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding phone to whitelist:', error);
    return null;
  }

  return data;
}

export async function removePhoneFromWhitelist(id: string) {
  const { error } = await supabaseAdmin
    .from('phone_whitelist')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error removing phone from whitelist:', error);
    return false;
  }

  return true;
}