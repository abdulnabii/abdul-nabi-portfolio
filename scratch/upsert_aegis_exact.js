const fs = require('fs');
const https = require('https');
const path = require('path');

let env = {};
try {
  const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  });
} catch (e) {}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const dbRecord = {
  id: "aegis-appsec",
  title: "Aegis AppSec Sentinel",
  description: "Live full-stack DevSecOps platform featuring real-time OWASP Top 10 API vulnerability auditing, cryptographic JWT token inspection, and Supabase Row-Level Security (RLS) policy simulation.",
  appreciations: 28,
  image_url: "/projects/ops.jpg",
  link: "https://www.aiwithab.site/projects/aegis-appsec",
  tags: ["Next.js 14", "TypeScript", "AppSec", "OWASP Top 10", "Supabase RLS", "JWT Crypto"],
};

const url = new URL(`${SUPABASE_URL}/rest/v1/projects`);

const req = https.request(url, {
  method: 'POST',
  headers: {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates',
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`Supabase status: ${res.statusCode}`);
    console.log('Response:', data);
  });
});

req.write(JSON.stringify(dbRecord));
req.end();
