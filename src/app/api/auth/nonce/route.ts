import { generateNonceController } from "@/modules/auth/controllers";
import { buildResponse } from "@/utils/buildResponse";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const walletAddress = searchParams.get("address");

  if (!walletAddress) {
    return buildResponse({
      data: null,
      message: "Please pass in a valid Address",
      isError: true,
      status: 400,
    });
  }

  return await generateNonceController(walletAddress);
}
