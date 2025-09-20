import { getAuthenticatedUser } from "@/utils/auth-helpers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();

    if (error) throw error;

    return NextResponse.json(
      { status: "Authenticated", timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (error:any) {
    console.log({error})
    return NextResponse.json({ status: "error", message: error?.message??"Health check failed" }, { status: 500 });
  }
}
