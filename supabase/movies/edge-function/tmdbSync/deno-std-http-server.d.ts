// Shim types so VSCode/TypeScript doesn't error on Deno std imports.
// The actual module comes from Deno runtime when deployed to Supabase.

declare module "std/http/server.ts" {
  export function serve(handler: (req: Request) => Promise<Response> | Response): void;
}

