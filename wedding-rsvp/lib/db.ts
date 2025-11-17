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

// ================================================
// PHONE WHITELIST FUNCTIONS
// ================================================

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

// ================================================
// ADMIN ROLE MANAGEMENT FUNCTIONS (NEW)
// ================================================

/**
 * Get admin role for a given email
 */
export async function getAdminRole(email: string): Promise<{ isAdmin: boolean; role: string | null }> {
  const { data, error } = await supabaseAdmin
    .from('admins')
    .select('role')
    .eq('email', email)
    .single();

  if (error || !data) {
    return { isAdmin: false, role: null };
  }

  return { isAdmin: true, role: data.role };
}

/**
 * Check if user has specific permission
 */
export async function hasPermission(
  email: string, 
  permission: 'view' | 'edit' | 'delete' | 'manage_admins'
): Promise<boolean> {
  const { role } = await getAdminRole(email);
  
  if (!role) return false;
  
  // Super admin can do everything
  if (role === 'super_admin') return true;
  
  // Event planner permissions
  if (role === 'event_planner') {
    return permission === 'view'; // Can only view
  }
  
  return false;
}

/**
 * List all admins (super admin only)
 */
export async function listAdmins(requestorEmail: string) {
  // Check if requestor is super admin
  const { role } = await getAdminRole(requestorEmail);
  if (role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabaseAdmin
    .from('admins')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Create admin (super admin only)
 */
export async function createAdmin(
  requestorEmail: string,
  newAdminEmail: string,
  role: 'super_admin' | 'event_planner'
) {
  // Check if requestor is super admin
  const { role: requestorRole } = await getAdminRole(requestorEmail);
  if (requestorRole !== 'super_admin') {
    throw new Error('Only super admins can create admins');
  }

  const { data, error } = await supabaseAdmin
    .from('admins')
    .insert({
      email: newAdminEmail,
      role: role,
      created_by: requestorEmail,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update admin role (super admin only)
 */
export async function updateAdminRole(
  requestorEmail: string,
  targetEmail: string,
  newRole: 'super_admin' | 'event_planner'
) {
  // Check if requestor is super admin
  const { role: requestorRole } = await getAdminRole(requestorEmail);
  if (requestorRole !== 'super_admin') {
    throw new Error('Only super admins can update admin roles');
  }

  // Prevent removing last super admin
  if (newRole === 'event_planner') {
    const { data: superAdmins } = await supabaseAdmin
      .from('admins')
      .select('email')
      .eq('role', 'super_admin');
    
    if (superAdmins && superAdmins.length === 1 && superAdmins[0].email === targetEmail) {
      throw new Error('Cannot remove the last super admin');
    }
  }

  const { data, error } = await supabaseAdmin
    .from('admins')
    .update({ 
      role: newRole,
      updated_at: new Date().toISOString(),
    })
    .eq('email', targetEmail)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete admin (super admin only)
 */
export async function deleteAdmin(
  requestorEmail: string,
  targetEmail: string
) {
  // Check if requestor is super admin
  const { role: requestorRole } = await getAdminRole(requestorEmail);
  if (requestorRole !== 'super_admin') {
    throw new Error('Only super admins can delete admins');
  }

  // Prevent self-deletion
  if (requestorEmail === targetEmail) {
    throw new Error('Cannot delete your own admin account');
  }

  // Prevent removing last super admin
  const { role: targetRole } = await getAdminRole(targetEmail);
  if (targetRole === 'super_admin') {
    const { data: superAdmins } = await supabaseAdmin
      .from('admins')
      .select('email')
      .eq('role', 'super_admin');
    
    if (superAdmins && superAdmins.length === 1) {
      throw new Error('Cannot delete the last super admin');
    }
  }

  const { error } = await supabaseAdmin
    .from('admins')
    .delete()
    .eq('email', targetEmail);

  if (error) throw error;
  return { success: true };
}