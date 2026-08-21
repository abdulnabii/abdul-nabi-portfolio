import httpx
import json

url = 'https://gqqzcznxncatfovulmtp.supabase.co'
key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxcXpjem54bmNhdGZvdnVsbXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0NzEzNzYsImV4cCI6MjA5OTA0NzM3Nn0.1HoimV4vDtSOwSGnEshnUp68qDWxCHxus5RN07c7a1I'
headers = {'apikey': key, 'Authorization': f'Bearer {key}'}

r = httpx.get(f'{url}/rest/v1/site_settings?key=eq.blogs_store_json&select=*', headers=headers)
rows = r.json()
if rows:
    blogs = json.loads(rows[0]['value'])
    print(f'Total blogs in Supabase: {len(blogs)}')
    for i, b in enumerate(blogs, 1):
        slug = b.get('slug', '')
        title = b.get('title', '')
        img = b.get('coverImage', '')
        print(f"{i}. [{slug[:30]}] {title[:40]} -> {img}")
else:
    print("No rows found")
