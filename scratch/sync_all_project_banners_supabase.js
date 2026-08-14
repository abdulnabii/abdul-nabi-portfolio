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

const bannerUpdates = [
  { id: "aegis-appsec", image_url: "/projects/aegis.jpg" },
  { id: "aurora-dashboard", image_url: "/projects/aurora.jpg" },
  { id: "pulse-chat", image_url: "/projects/pulse.jpg" },
  { id: "signal-ops", image_url: "/projects/ops.jpg" },
  { id: "nova-commerce", image_url: "/projects/nova.jpg" },
  { id: "blood-sugar-tracker", image_url: "/blood_sugar_banner.jpg" },
];

async function updateAll() {
  for (const item of bannerUpdates) {
    const url = new URL(`${SUPABASE_URL}/rest/v1/projects?id=eq.${item.id}`);
    await new Promise((resolve) => {
      const req = https.request(url, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        }
      }, (res) => {
        let d = '';
        res.on('data', chunk => d += chunk);
        res.on('end', () => {
          console.log(`Updated ${item.id} banner: ${res.statusCode}`);
          resolve(d);
        });
      });
      req.write(JSON.stringify({ image_url: item.image_url }));
      req.end();
    });
  }
}

updateAll().then(() => console.log('All project banners synced to Supabase!'));
