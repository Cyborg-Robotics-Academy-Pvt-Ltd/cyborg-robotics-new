export default function handler(req, res) {
  // Temporary fallback: redirect to the filesystem-served /about
  // This ensures requests don't fail while we inspect Vercel routes.
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
  res.writeHead(302, { Location: '/mycomp' });
  res.end();
}
