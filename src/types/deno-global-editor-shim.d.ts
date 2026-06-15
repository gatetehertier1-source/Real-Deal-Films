// Editor-only shims for Deno globals.
// Prevents VSCode TS errors inside Supabase Edge Function source files.

declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
};

