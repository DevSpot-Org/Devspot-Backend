import { linkUserIdentityController } from "@/modules/auth/controllers/identites.controller";
import { headers } from "next/headers";

export async function POST(request: Request) {
  const { provider, redirect } = await request.json();

  const headersList = await headers();
  const origin = headersList.get("origin");

  return await linkUserIdentityController(provider, redirect, origin);
}
