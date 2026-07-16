/**
 * Supabase client placeholder.
 *
 * Install when ready:
 *   npm install @supabase/supabase-js
 *
 * Then set in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=
 */

export type SupabaseClientPlaceholder = {
  from: (table: string) => {
    select: (columns?: string) => Promise<{ data: unknown; error: Error | null }>;
    insert: (values: unknown) => Promise<{ data: unknown; error: Error | null }>;
  };
};

/**
 * Returns a configured Supabase client when env vars are present.
 * Currently a safe placeholder so the app builds without the package installed.
 */
export function createSupabaseClient(): SupabaseClientPlaceholder | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Returning null client."
      );
    }
    return null;
  }

  // When you install @supabase/supabase-js, replace this with:
  // import { createClient } from "@supabase/supabase-js";
  // return createClient(url, anonKey);

  return {
    from: (table: string) => ({
      select: async () => {
        console.info(`[supabase] select on "${table}" — wire up real client`);
        return { data: null, error: new Error("Supabase client not configured") };
      },
      insert: async () => {
        console.info(`[supabase] insert on "${table}" — wire up real client`);
        return { data: null, error: new Error("Supabase client not configured") };
      },
    }),
  };
}

export const supabase = createSupabaseClient();
