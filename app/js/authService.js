// Supabase authentication helpers used by the app pages.
import { supabase } from './supabaseClient.js';

export async function signUpUser(email, password, firstName, lastName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName }
    }
  });
  return { data, error };
}

export async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentSession() {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) {
    return { session: null, error: sessionError };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    if (userError && [401, 403, 404].includes(userError.status)) {
      await supabase.auth.signOut({ scope: 'local' });
    }
    return { session: null, error: userError };
  }

  return { session: sessionData.session, error: null };
}