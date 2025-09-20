export function extractApexDomain(host: string): string {
  if (!host) return "";

  const parts = host.split(".");

  // ─── localhost:<port> cases ───
  // "localhost:3000" or "foo.localhost:3000"
  if (/^localhost:\d+$/.test(parts[parts.length - 1])) {
    return parts.slice(-1)[0];
  }

  // ─── vercel.app deployments ───
  // Handle Vercel's deployment URLs: preview-abc123.vercel.app or subdomain.preview-abc123.vercel.app
  if (
    parts.length >= 3 &&
    parts[parts.length - 1] === "app" &&
    parts[parts.length - 2] === "vercel"
  ) {
    if (parts.length === 3) {
      // "preview-abc123.vercel.app" - this is the apex domain
      return host;
    } else {
      // "subdomain.preview-abc123.vercel.app" - return "preview-abc123.vercel.app"
      return parts.slice(-3).join(".");
    }
  }

  // ─── all other domains ───
  if (parts.length <= 2) {
    // "domain.com" or even just "localhost"
    return host;
  }
  // drop one subdomain: "bar.foo.com" → "foo.com"
  return parts.slice(1).join(".");
}

export function extractSubdomain(
  hostname: string,
  apexDomain: string
): string | null {
  const apexParts = apexDomain.split(".");
  const hostParts = hostname.split(".");
  const diff = hostParts.length - apexParts.length;

  // if diff ≤ 0, there's no extra label to call "subdomain"
  if (diff <= 0) return null;

  // take the leftmost diff parts (always 1 with our apex logic)
  return hostParts.slice(0, diff).join(".");
}
