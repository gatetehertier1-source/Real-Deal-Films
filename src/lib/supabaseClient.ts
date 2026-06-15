import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Allow the app to still boot; calls will fail and show a meaningful error.
  // eslint-disable-next-line no-console
  console.warn(
    "Supabase env vars are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env"
  );
}

export const supabase = createBrowserClient(supabaseUrl ?? "", supabaseAnonKey ?? "");

