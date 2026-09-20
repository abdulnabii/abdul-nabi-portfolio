const fs = require('fs');
const path = require('path');

// 1. Load environment variables
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
}

const supabaseUrl = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://gqqzcznxncatfovulmtp.supabase.co'
).replace(/\/$/, '');

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxcXpjem54bmNhdGZvdnVsbXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0NzEzNzYsImV4cCI6MjA5OTA0NzM3Nn0.1HoimV4vDtSOwSGnEshnUp68qDWxCHxus5RN07c7a1I';

function sanitizeContent(raw) {
  if (!raw) return raw;
  let text = raw;

  // 1. Remove google news RSS redirect URLs that cause mobile overflow
  text = text.replace(/https?:\/\/news\.google\.com\/[^\s\)\]]+/g, '');

  // 2. Decode html entities
  text = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, '&');

  // 3. Strip font and leaked html tags
  text = text
    .replace(/<font[^>]*>/gi, '')
    .replace(/<\/font>/gi, '')
    .replace(/<a\s+[^>]*href="[^"]*"[^>]*>([\s\S]*?)<\/a>/gi, '$1')
    .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '$1');

  // 4. Clean stray HTML tags in prose (leave markdown intact)
  text = text.replace(/<(b|i|u|span|div|p|br|table|tr|td|th)\b[^>]*>/gi, '');
  text = text.replace(/<\/(b|i|u|span|div|p|br|table|tr|td|th)>/gi, '');

  // 5. Replace ASCII box diagram with clean markdown table
  const asciiBoxRegex = /```[\s\S]*?┌[\s\S]*?└[\s\S]*?```/g;
  const tableReplacement = `| Layer | Core Architecture | Latency & SLA Target |
| :--- | :--- | :--- |
| **1. Event & Ingestion Layer** | Sub-50ms Reactive Ingestion | Edge validation & schema assertion |
| **2. Compute & Model Layer** | Distributed Vector & Workers | Scalable worker pools without main thread blocking |
| **3. Security & Policy (RLS)** | Row-Level Cryptographic Auth | Defense-in-depth at the data layer |`;
  text = text.replace(asciiBoxRegex, tableReplacement);

  // 6. Fix "Context from Recent Tech Headlines" or leaked RSS lists
  text = text.replace(/### Context from Recent Tech Headlines[\s\S]*?(?=---|\n## )/gi, (section) => {
    const lines = section.split('\n');
    const cleanLines = lines
      .filter(l => !l.includes('news.google.com') && !l.includes('<font'))
      .map(l => l.replace(/\([^\)]*Google News[^\)]*\)/gi, '').trim())
      .filter(Boolean);
    if (cleanLines.length <= 1) return '';
    return cleanLines.join('\n\n') + '\n\n';
  });

  // 7. Ensure headings and lists have clean linebreaks
  text = text.replace(/([^\n])\n(#{2,4}\s)/g, '$1\n\n$2');
  text = text.replace(/(#{2,4}\s[^\n]+)\n([^\n#])/g, '$1\n\n$2');

  // 8. Clean trailing hyphens or empty bullets
  text = text.replace(/^-\s*(\(\s*\))?\s*$/gm, '');
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

async function run() {
  console.log('[sanitize-blogs] Fetching blogs from Supabase site_settings...');
  const res = await fetch(`${supabaseUrl}/rest/v1/site_settings?select=*&key=eq.blogs_store_json`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    console.error('[sanitize-blogs] Failed to fetch site_settings:', res.status, res.statusText);
    return;
  }

  const rows = await res.json();
  if (!rows || rows.length === 0 || !rows[0].value) {
    console.log('[sanitize-blogs] No blogs_store_json found.');
    return;
  }

  const blogs = JSON.parse(rows[0].value);
  console.log(`[sanitize-blogs] Found ${blogs.length} posts in Supabase.`);

  let modifiedCount = 0;
  const cleanedBlogs = blogs.map((blog) => {
    const origContent = blog.content || '';
    const newContent = sanitizeContent(origContent);

    let origExcerpt = blog.excerpt || '';
    let newExcerpt = origExcerpt
      .replace(/https?:\/\/news\.google\.com\/[^\s\)\]]+/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (newContent !== origContent || newExcerpt !== origExcerpt) {
      modifiedCount++;
      console.log(` - Sanitized: ${blog.slug}`);
      return {
        ...blog,
        content: newContent,
        excerpt: newExcerpt,
        updatedAt: new Date().toISOString(),
      };
    }
    return blog;
  });

  console.log(`[sanitize-blogs] Total posts modified: ${modifiedCount}`);

  if (modifiedCount > 0) {
    console.log('[sanitize-blogs] Updating Supabase site_settings...');
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/site_settings?on_conflict=key`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        key: 'blogs_store_json',
        value: JSON.stringify(cleanedBlogs),
        updated_at: new Date().toISOString(),
      }),
    });

    if (updateRes.ok) {
      console.log('[sanitize-blogs] Successfully saved cleaned posts to Supabase!');
    } else {
      console.error('[sanitize-blogs] Failed to update Supabase:', updateRes.status, await updateRes.text());
    }

    // Also update local data/blogs.json if exists
    const localBlogsPath = path.join(__dirname, '..', 'data', 'blogs.json');
    if (fs.existsSync(localBlogsPath)) {
      try {
        const localData = JSON.parse(fs.readFileSync(localBlogsPath, 'utf8'));
        const updatedLocal = localData.map((b) => {
          const matched = cleanedBlogs.find((cb) => cb.slug === b.slug);
          return matched || b;
        });
        fs.writeFileSync(localBlogsPath, JSON.stringify(updatedLocal, null, 2), 'utf8');
        console.log('[sanitize-blogs] Updated local data/blogs.json as well.');
      } catch (e) {
        console.warn('[sanitize-blogs] Notice updating local data/blogs.json:', e.message);
      }
    }
  } else {
    console.log('[sanitize-blogs] No posts needed cleaning.');
  }
}

run().catch(console.error);
