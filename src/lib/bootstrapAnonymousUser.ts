import { signInAnonymously, getUserId } from "./auth";

export async function ensureSupabaseUser() {
  let userId = await getUserId();
  if (userId) return userId;

  const { user } = await signInAnonymously();
  userId = user?.id ?? null;

  if (!userId) throw new Error("Supabase anonymous sign-in did not return a user id.");
  return userId;
}

