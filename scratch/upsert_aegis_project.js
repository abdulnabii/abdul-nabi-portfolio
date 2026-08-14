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
} catch (e) {
  console.log('No .env.local found');
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.log('Supabase credentials not found.');
  process.exit(0);
}

const projects = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'projects.json'), 'utf8'));
const aegis = projects.find(p => p.id === 'aegis-appsec');

const cleanProject = {
  id: aegis.id,
  title: aegis.title,
  description: aegis.description,
  problem: aegis.problem,
  role: aegis.role,
  outcome: aegis.outcome,
  tags: aegis.tags,
  image: aegis.image,
  githubUrl: aegis.githubUrl,
  liveUrl: aegis.liveUrl,
  status: aegis.status,
  statusLabel: aegis.statusLabel,
  featured: aegis.featured,
  year: aegis.year,
  published: aegis.published,
  appreciations: aegis.appreciations,
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
    console.log(`Supabase upsert status: ${res.statusCode}`);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('Successfully upserted clean aegis-appsec to Supabase!');
    } else {
      console.log('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Error upserting to Supabase:', e.message);
});

req.write(JSON.stringify(cleanProject));
req.end();
