import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'attendly_supabase_url';
const STORAGE_KEY_KEY = 'attendly_supabase_anon_key';

export function getStoredSupabaseCredentials(): { url: string; key: string } {
  // Check localStorage first (allows dynamic in-browser configuration without restarting Vite)
  const localUrl = localStorage.getItem(STORAGE_KEY_URL);
  const localKey = localStorage.getItem(STORAGE_KEY_KEY);

  // Fallback to Vite environment variables
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return {
    url: localUrl || envUrl || '',
    key: localKey || envKey || ''
  };
}

export function saveSupabaseCredentials(url: string, key: string): void {
  if (url.trim()) {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_URL);
  }

  if (key.trim()) {
    localStorage.setItem(STORAGE_KEY_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_KEY);
  }
}

let cachedClient: SupabaseClient | null = null;
let lastClientUrl = '';
let lastClientKey = '';

export function isSupabaseConfigured(): boolean {
  const { url, key } = getStoredSupabaseCredentials();
  return Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    key.length > 20
  );
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getStoredSupabaseCredentials();

  if (!url || !key || !isSupabaseConfigured()) {
    return null;
  }

  if (cachedClient && lastClientUrl === url && lastClientKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    lastClientUrl = url;
    lastClientKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  tablesAvailable?: boolean;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      message: 'Supabase URL and anon public key are not yet configured.'
    };
  }

  try {
    // Attempt a light query on subjects table
    const { error } = await client.from('subjects').select('id').limit(1);

    if (error) {
      if (error.code === '42P01') {
        return {
          connected: true,
          tablesAvailable: false,
          message: 'Connected to Supabase, but tables have not been created yet. Run the SQL schema in your Supabase SQL Editor.'
        };
      }
      return {
        connected: false,
        message: `Supabase returned error: ${error.message} (Code: ${error.code})`
      };
    }

    return {
      connected: true,
      tablesAvailable: true,
      message: 'Successfully connected to your Supabase PostgreSQL database!'
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Network connection failed: ${err.message || err}`
    };
  }
}
