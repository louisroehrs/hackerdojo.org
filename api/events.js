// Fetches Hacker Dojo's Meetup RSS feed (server-side, so no CORS) and returns
// ready-to-inject HTML cards for the events page.

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const RSS_URL = 'https://www.meetup.com/hackerdojo/events/rss/';

function escapeHtml(s) {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function truncate(text, max) {
  const plain = (text || '').replace(/\s+/g, ' ').trim();
  return plain.length > max ? plain.slice(0, max).trimEnd() + '…' : plain;
}

// Pull the text of a tag from an <item> block, handling CDATA.
function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  if (!m) return '';
  return m[1].replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
}

function parseFeed(xml) {
  const items = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  return items.map(block => ({
    title: tag(block, 'title'),
    link: tag(block, 'link'),
    date: tag(block, 'pubDate'),
    description: tag(block, 'description'),
  }));
}

function buildCard(event) {
  const date = formatDate(event.date);
  const title = escapeHtml(event.title);
  const description = escapeHtml(truncate(event.description, 160));
  const link = encodeURI(event.link);

  return `
    <article class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div class="w-full h-2 bg-gradient-to-r from-dojo-red to-dojo-navy"></div>
      <div class="p-5 flex flex-col flex-1">
        ${date ? `<p class="text-dojo-red font-heading font-semibold text-sm uppercase tracking-wide mb-2">${date}</p>` : ''}
        <h3 class="font-heading font-bold text-xl text-dojo-navy mb-3 leading-tight">
          <a href="${link}" target="_blank" rel="noopener" class="hover:text-dojo-red transition-colors">${title}</a>
        </h3>
        ${description ? `<p class="text-gray-600 text-sm leading-relaxed mb-4 flex-1">${description}</p>` : '<div class="flex-1"></div>'}
        <div class="flex items-center justify-end mt-2 pt-4 border-t border-gray-100">
          <a href="${link}" target="_blank" rel="noopener"
             class="inline-flex items-center gap-1 bg-dojo-red text-white text-sm font-heading font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition">
            View &amp; RSVP
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </a>
        </div>
      </div>
    </article>`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const response = await fetch(RSS_URL, {
      headers: { 'User-Agent': 'hackerdojo.org events page' },
    });
    if (!response.ok) {
      return res.status(502).json({ error: 'Failed to fetch Meetup feed' });
    }

    const events = parseFeed(await response.text());
    const html = events.map(buildCard).join('');

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ count: events.length, html });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
