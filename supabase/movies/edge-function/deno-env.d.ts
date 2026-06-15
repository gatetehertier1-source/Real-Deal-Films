// Shim for Deno namespace in editor-only TypeScript.
// This is not used at runtime; Supabase Edge Functions run in Deno.

declare namespace Deno {
  const env: {
    get(name: string): string | undefined;
  };
}

