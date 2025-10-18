export default function handler(req, res) {
  // Temporary fallback: redirect to the filesystem-served /about-us
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
  res.writeHead(302, { Location: '/about-us' });
  res.end();
}
