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

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.log('No Supabase credentials found.');
  process.exit(0);
}

const educationData = [
  {
    id: "edu-1",
    degree: "BS in Computer Science",
    institution: "University of Sindh",
    location: "Jamshoro, Sindh, Pakistan",
    period: "2022 — 2026",
    description: "Graduated in 2026 with a focus on Software Engineering, Database Systems, Web Technologies, Application Security, and Machine Learning. Final Year Project: ML-powered Blood Sugar Tracker with ElasticNet regression.",
  }
];

const url = new URL(`${SUPABASE_URL}/rest/v1/site_settings`);

const req = https.request(url, {
  method: 'POST',
  headers: {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates',
  }
}, (res) => {
  let d = '';
  res.on('data', chunk => d += chunk);
  res.on('end', () => {
    console.log(`Supabase education sync status: ${res.statusCode}`);
    console.log('Response:', d);
  });
});

req.write(JSON.stringify({
  key: "education_data",
  value: JSON.stringify(educationData),
  updated_at: new Date().toISOString(),
}));
req.end();
