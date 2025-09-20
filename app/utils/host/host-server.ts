import { extractApexDomain, extractSubdomain } from "@/utils/host/host-utils";
import { headers } from "next/headers";
/**
 * Get the full host:port string for the current server runtime (Server/Edge).
 * - On the server (App Router): headers().get('host')
 */
export async function getHostnameServer(): Promise<string> {
  // client-side
  if (typeof window !== "undefined") {
    throw new Error("getHostnameServer() can only be called on the server");
  }

  // server-side (App Router)
  const headerStore = await headers();
  const host = headerStore.get("host");
  return host ? host.trim() : "";
}

/**
 * Reduce any host to its "apex" (for server components/edge runtime):
 * - localhost:3000                    → localhost:3000
 * - foo.localhost:3000                → localhost:3000
 * - example.com                       → example.com
 * - bar.example.com                   → example.com
 * - preview-abc123.vercel.app         → preview-abc123.vercel.app
 * - sub.preview-abc123.vercel.app     → preview-abc123.vercel.app
 */
export async function getApexDomainServer(): Promise<string> {
  return extractApexDomain(await getHostnameServer());
}

export async function getSubdomainServer(): Promise<string | null> {
  const host = await getHostnameServer();
  if (!host) return null;

  const apexDomain = await getApexDomainServer();
  return extractSubdomain(host, apexDomain);
}
