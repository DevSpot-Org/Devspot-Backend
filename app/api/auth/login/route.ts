import { signInController } from "@/modules/auth/controllers/auth.controller";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  return await signInController(body);
}
