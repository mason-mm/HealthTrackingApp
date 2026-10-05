// Creates the browser-safe Supabase client; never put service keys here.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://jorflcfgdaaeqglmmlrz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_nc6-ziPm4VKdqZi8iWFqQA_X0ppAPTj';
const REMEMBER_ME_KEY = 'health-tracking-remember-me';
const AUTH_STORAGE_KEY = `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`;

export function getRememberMe() {
  return localStorage.getItem(REMEMBER_ME_KEY) !== 'false';
}

export function setRememberMe(rememberMe) {
  const wasRemembered = getRememberMe();
  const source = wasRemembered ? localStorage : sessionStorage;
  const destination = rememberMe ? localStorage : sessionStorage;
  const session = source.getItem(AUTH_STORAGE_KEY);

  if (session !== null && source !== destination) {
    destination.setItem(AUTH_STORAGE_KEY, session);
  }

  localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe));

  if (session !== null && source !== destination) {
    source.removeItem(AUTH_STORAGE_KEY);
  }
}

const authStorage = {
  getItem(key) {
    return (getRememberMe() ? localStorage : sessionStorage).getItem(key);
  },
  setItem(key, value) {
    (getRememberMe() ? localStorage : sessionStorage).setItem(key, value);
  },
  removeItem(key) {
    (getRememberMe() ? localStorage : sessionStorage).removeItem(key);
  }
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { storage: authStorage }
});