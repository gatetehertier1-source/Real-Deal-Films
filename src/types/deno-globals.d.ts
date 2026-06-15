// Makes Deno globals available to the Vite/TypeScript editor so edge-function files don't show red squiggles.
// This does NOT change runtime behavior of the Vite app.

declare namespace Deno {
  function envGet(name: string): string | undefined;
}

// Most Deno edge code uses `Deno.env.get(...)`
// We declare a minimal shape for editor type-checking.
declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
};

