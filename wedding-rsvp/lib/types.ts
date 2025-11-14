export interface Guest {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  created_at: string;
  last_login: string | null;
}

export interface RSVP {
  id: string;
  guest_id: string;
  attending: boolean;
  note: string | null;
  dietary_needs: string | null;
  pledge_amount: number | null;
  hotel_choice: string | null;
  is_waitlisted: boolean;
  created_at: string;
  updated_at: string;
}

export interface MagicLink {
  id: string;
  email: string;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export interface Admin {
  id: string;
  email: string;
  created_at: string;
}

export interface RSVPWithGuest extends RSVP {
  guest: Guest;
}

export const HOTEL_OPTIONS = [
  { value: 'rusinga_lodge', label: 'Rusinga Island Lodge (Venue)', price: 'KES 18,000/night' },
  { value: 'mfangano_camp', label: 'Mfangano Island Camp', price: 'KES 15,000/night' },
  { value: 'traveling_back', label: 'Traveling back same day', price: '' },
  { value: 'sorted_externally', label: 'Sorted accommodation externally', price: '' },
] as const;