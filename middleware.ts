import { withCors } from "@/utils/cors";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const cors = withCors(req);

  // Handle OPTIONS directly (preflight)
  if (req.method === "OPTIONS") {
    return cors; // returns 204
  }

  const res = NextResponse.next();
  cors.headers.forEach((value, key) => {
    res.headers.set(key, value);
  });

  return res;
}

// Apply only to API routes
export const config = {
  matcher: "/api/:path*",
};
