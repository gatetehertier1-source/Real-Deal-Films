import { supabase } from "./supabaseClient";

export async function signInAnonymously() {
  // Creates an anonymous user in Supabase.
  // With RLS policies on user_id = auth.uid(), this lets us persist data safely.
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data;
}

export async function getUserId() {
  const { data: sessionData } = await supabase.auth.getSession();
  return sessionData.session?.user?.id ?? null;
}

