import fs from 'fs';
import path from 'path';

const src = 'C:/Users/Mohammedhussain/Downloads/pixolo/globe/website.html';

let html = fs.readFileSync(src, 'utf8');

// Remove the script block (zoom fit) - not needed for static view
html = html.replace(/<script>[\s\S]*?<\/script>/g, '');

// Rewrite relative font path so it works at /wireframe/
html = html.replace(/url\("assets\//g, 'url("/assets/');

// Fonts live in public/assets/fonts (served at /assets/fonts)
const fontSrc = 'C:/Users/Mohammedhussain/Downloads/pixolo/globe/assets/fonts';
const fontDst = 'C:/Users/Mohammedhussain/Downloads/pixolo/globewa/apps/frontend/public/assets/fonts';
fs.mkdirSync(fontDst, { recursive: true });
for (const f of fs.readdirSync(fontSrc)) {
  fs.copyFileSync(path.join(fontSrc, f), path.join(fontDst, f));
}
console.log('fonts copied to public/assets/fonts');

// ---------------------------------------------------------------------------
// Make every <a> clickable: map link text -> board anchor on this page
// Boards: #home #services #pricing #dlt #company #contact
// ---------------------------------------------------------------------------
const MAP = {
  // main nav (each board repeats it)
  Home: '#home',
  Services: '#services',
  Pricing: '#pricing',
  DLT: '#dlt',
  Company: '#company',
  Contact: '#contact',
  'Brand nameBulk communications': '#home',
  'Brand name': '#home',

  // CTAs -> contact board
  'Start free trial': '#contact',
  'Talk to sales': '#contact',
  'Contact us': '#contact',
  'Send message': '#contact',
  'Request a quote': '#contact',
  'Ask us': '#contact',
  'Talk to an automation specialist': '#contact',
  'Become a reseller': '#contact',

  // utility strip / auth
  'Log in': '#home',
  'Log in to portal': '#home',
  'DLT registration': '#dlt',

  // footer: services
  'Bulk SMS': '#services',
  'Bulk voice': '#services',
  'Bulk email': '#services',
  'Business WhatsApp': '#services',
  'API documentation': '#services',
  'Template library': '#services',
  'Read the API documentation': '#services',
  'Explore all services': '#services',
  'Messaging 06': '#services',
  'Numbers &amp; telephony 04': '#services',
  'Automation 03': '#services',
  'Creative &amp; brand 04': '#services',
  'See messaging rates': '#pricing',
  'Compare number plans': '#pricing',

  // footer: company
  'About us': '#company',
  'Reseller programme': '#company',
  'See partner terms': '#company',
  'Compare channels': '#pricing',

  // pricing actions
  'See pricing': '#pricing',
  'Purchase now': '#pricing',

  // DLT actions
  'Start registration': '#dlt',
  'Download checklist': '#dlt',

  // footer: legal (no board -> top)
  Terms: '#home',
  Privacy: '#home',
  Refund: '#home',
  Grievance: '#home',
};

const unmapped = new Set();
let added = 0;
html = html.replace(/<a(\s[^>]*)?>([\s\S]*?)<\/a>/g, (full, attrs = '', inner) => {
  if (attrs.includes('href=')) return full;
  const text = inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const href = MAP[text];
  if (!href) {
    unmapped.add(text);
    return full;
  }
  added++;
  return '<a' + attrs + ' href="' + href + '">' + inner + '</a>';
});
console.log('hrefs added:', added);
if (unmapped.size) console.log('UNMAPPED (left as-is):', [...unmapped].join(' | '));

// Smooth in-page scrolling for the anchor links
html = html.replace('html{background:#E9ECF1}', 'html{background:#E9ECF1;scroll-behavior:smooth}');

// Guard: Astro parses {} in HTML body as expressions — must be zero outside style/script
const check = html.replace(/<style[\s\S]*?<\/style>/g, '');
const braceCount = (check.match(/[{}]/g) || []).length;
if (braceCount > 0) {
  console.error('ABORT: ' + braceCount + ' braces found outside <style> — would break Astro parsing');
  process.exit(1);
}

// Verify every board anchor target exists
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const hrefs = [...new Set([...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]))];
const missing = hrefs.filter((h) => !ids.has(h));
console.log('anchor targets:', hrefs.length, 'missing:', missing.length ? missing.join(', ') : 'none');

// Write as an Astro page (no frontmatter needed — pure static HTML)
const out = 'C:/Users/Mohammedhussain/Downloads/pixolo/globewa/apps/frontend/src/pages/wireframe.astro';
fs.writeFileSync(out, html);
console.log('written:', out, html.length, 'bytes');
