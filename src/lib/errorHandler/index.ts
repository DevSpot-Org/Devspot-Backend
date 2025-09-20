import { NextResponse } from "next/server";
import { AppError } from "./error";

export * from "./error";
export * from "./supabaseErrorHandler";

export function handleError(error: unknown) {
  if (error instanceof AppError) {
    const errorResponse = {
      error: error.message,
      details: error.details,
      status: error.statusCode,
    };
    return NextResponse.json(errorResponse, { status: error.statusCode });
  }

  // Log and handle unexpected errors
  console.error("Unexpected Error:", error);

  const defaultErrorResponse = {
    error: "Something went wrong",
    serverMessage: error instanceof Error ? error.message : undefined,
    status: (error as any)?.statusCode ?? 500,
  };

  return NextResponse.json(defaultErrorResponse, { status: 500 });
}
