/**
 * Supabase REST & Storage client helper.
 * Uses native fetch against NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Works seamlessly on Vercel serverless without requiring extra npm packages.
 */

function getSupabaseConfig() {
  const url = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://gqqzcznxncatfovulmtp.supabase.co"
  ).replace(/\/$/, "");

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxcXpjem54bmNhdGZvdnVsbXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0NzEzNzYsImV4cCI6MjA5OTA0NzM3Nn0.1HoimV4vDtSOwSGnEshnUp68qDWxCHxus5RN07c7a1I";

  return { url, key };
}

export async function supabaseDbQuery<T = any>(
  table: string,
  params: string = ""
): Promise<T[] | null> {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;

  try {
    const res = await fetch(`${url}/rest/v1/${table}?${params}`, {
      method: "GET",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return (await res.json()) as T[];
  } catch (err) {
    console.error(`[supabase] DB query error on ${table}:`, err);
    return null;
  }
}

export async function supabaseDbInsert<T = any>(
  table: string,
  payload: Record<string, any> | Record<string, any>[]
): Promise<T | null> {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;

  try {
    const res = await fetch(`${url}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return (Array.isArray(data) ? data[0] : data) as T;
  } catch (err) {
    console.error(`[supabase] DB insert error on ${table}:`, err);
    return null;
  }
}

export async function supabaseDbUpsert<T = any>(
  table: string,
  payload: Record<string, any> | Record<string, any>[],
  onConflict?: string
): Promise<T | null> {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;

  const conflictCol = onConflict || (table === "blogs" ? "slug" : table === "projects" ? "id" : "key");

  try {
    const res = await fetch(`${url}/rest/v1/${table}?on_conflict=${conflictCol}`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[supabase] DB upsert failed on ${table} (${res.status}): ${errText}`);
      return null;
    }
    const data = await res.json();
    return (Array.isArray(data) ? data[0] : data) as T;
  } catch (err) {
    console.error(`[supabase] DB upsert exception on ${table}:`, err);
    return null;
  }
}

export async function supabaseDbPatch<T = any>(
  table: string,
  matchParams: string,
  payload: Record<string, any>
): Promise<T | null> {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;

  try {
    const res = await fetch(`${url}/rest/v1/${table}?${matchParams}`, {
      method: "PATCH",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return (Array.isArray(data) ? data[0] : data) as T;
  } catch (err) {
    console.error(`[supabase] DB patch error on ${table}:`, err);
    return null;
  }
}

export async function supabaseDbDelete(
  table: string,
  matchParams: string
): Promise<boolean> {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return false;

  try {
    const res = await fetch(`${url}/rest/v1/${table}?${matchParams}`, {
      method: "DELETE",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    });

    return res.ok;
  } catch (err) {
    console.error(`[supabase] DB delete error on ${table}:`, err);
    return false;
  }
}

export async function supabaseStorageUpload(
  bucket: string,
  filePath: string,
  fileBuffer: Buffer | Blob,
  contentType: string
): Promise<string | null> {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;

  try {
    const cleanPath = filePath.replace(/^\//, "");
    const uploadUrl = `${url}/storage/v1/object/${bucket}/${cleanPath}`;

    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: fileBuffer as any,
    });

    if (!res.ok) {
      console.error(`[supabase] Storage upload failed: ${res.status} ${res.statusText}`);
      return null;
    }

    return `${url}/storage/v1/object/public/${bucket}/${cleanPath}`;
  } catch (err) {
    console.error(`[supabase] Storage upload exception on ${bucket}/${filePath}:`, err);
    return null;
  }
}
