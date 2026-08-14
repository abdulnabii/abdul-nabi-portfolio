const https = require('https');

function fetchUrl(url) {
  https.get(url, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      console.log('Redirecting to:', res.headers.location);
      fetchUrl(res.headers.location);
      return;
    }
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('Status code:', res.statusCode);
      console.log('Contains Abdul Nabi:', data.includes('Abdul Nabi'));
      console.log('Contains resume-printable-area:', data.includes('resume-printable-area'));
      console.log('Contains Professional Summary:', data.includes('Professional Summary'));
    });
  }).on('error', (err) => {
    console.error('Fetch error:', err.message);
  });
}

fetchUrl('https://www.aiwithab.site/resume');
