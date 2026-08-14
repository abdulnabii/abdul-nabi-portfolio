const fs = require('fs');
const path = require('path');

// Read .env.local for Supabase credentials
const envPath = path.join(__dirname, '../.env.local');
const envText = fs.readFileSync(envPath, 'utf8');

let supabaseUrl = '';
let supabaseKey = '';

envText.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const token = "AQV75ydrjFbKapL64d7UlyL0zptEElYJCmnkIKSnO4DrFOgPxYyqeajTlLmcbb28UrpO_eGjaHjVRpHoLJWttkMdXYA8XvXnuESPur-u-TxyokkKdCAMPNUa8elYZ12TTCl4pPUw8jcqBGax73zjvoMSBWBvDm-Fg6GPkLdSxK2bPySMqdwSwWzEAPPvqgMj4MvWlCa36bttmpKg79uhVCWP6CZGhmRSDCTllxuRakQFUc1RiDxJzPwc6iEFifntbteiQeMlpKBWe2DeNYGpF8flcXXA1zGAzQKSVexHr-rRu40ONkUm2oz3a3IQlbmah-4b3Di6rSmw3HBQyRKPWo-M6BU6Q";

async function run() {
  console.log("1. Testing token against LinkedIn API...");
  
  // Test token with LinkedIn userinfo
  let personUrn = null;
  let name = "";
  
  const uiRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (uiRes.ok) {
    const data = await uiRes.json();
    personUrn = `urn:li:person:${data.sub}`;
    name = data.name || data.email;
    console.log("✅ Userinfo Success:", name, personUrn);
  } else {
    console.log("Userinfo failed:", uiRes.status, await uiRes.text());
    
    // Try /v2/me
    const meRes = await fetch("https://api.linkedin.com/v2/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (meRes.ok) {
      const meData = await meRes.json();
      personUrn = `urn:li:person:${meData.id}`;
      name = `${meData.localizedFirstName} ${meData.localizedLastName}`;
      console.log("✅ /v2/me Success:", name, personUrn);
    } else {
      console.log("/v2/me failed:", meRes.status, await meRes.text());
    }
  }

  if (!personUrn) {
    console.error("❌ Failed to resolve Person URN from token");
    return;
  }

  console.log("2. Fetching existing social credentials from Supabase...");
  const getRes = await fetch(`${supabaseUrl}/rest/v1/site_settings?select=*&key=eq.social_credentials_data`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  const rows = await getRes.json();
  let currentCreds = {};
  if (rows && rows.length > 0 && rows[0].value) {
    try {
      currentCreds = JSON.parse(rows[0].value);
    } catch(e){}
  }

  const updatedCreds = {
    ...currentCreds,
    linkedInAccessToken: token,
    linkedInPersonUrn: personUrn,
    autoPosterActive: true
  };

  console.log("3. Saving updated credentials to Supabase...");
  const upsertRes = await fetch(`${supabaseUrl}/rest/v1/site_settings`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify([{
      key: 'social_credentials_data',
      value: JSON.stringify(updatedCreds),
      updated_at: new Date().toISOString()
    }])
  });

  console.log("Supabase save status:", upsertRes.status);
  if (upsertRes.ok) {
    console.log("🎉 SUCCESS! Saved token & URN to Supabase. Account linked for:", name);
  }
}

run();
