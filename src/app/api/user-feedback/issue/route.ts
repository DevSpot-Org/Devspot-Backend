import { NextRequest } from "next/server";
import { submit_issue_report } from "@/lib/services/user-feedback";

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  return await submit_issue_report(body);
};
