import { extractApexDomain, extractSubdomain } from "@/utils/host/host-utils";

/**
 * Get the full host:port string for client components that use 'use client'.
 */
export function getHostnameClient(): string {
  if (typeof window !== "undefined") {
    return window.location.host;
  } else {
    throw new Error("getHostnameClient() can only be called on the client");
  }
}

/**
 * Reduce any host to its "apex" (for "use client" components):
 * - localhost:3000                    → localhost:3000
 * - foo.localhost:3000                → localhost:3000
 * - example.com                       → example.com
 * - bar.example.com                   → example.com
 * - preview-abc123.vercel.app         → preview-abc123.vercel.app
 * - sub.preview-abc123.vercel.app     → preview-abc123.vercel.app
 */
export function getApexDomainClient(): string {
  return extractApexDomain(getHostnameClient());
}

export function getSubdomainClient(): string | null {
  const host = getHostnameClient();
  if (!host) return null;

  const apexDomain = getApexDomainClient();
  return extractSubdomain(host, apexDomain);
}
