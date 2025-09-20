import { SupabaseError } from "./error";

/**
 * Handles Supabase responses consistently.
 * Throws a SupabaseError if `error` exists, otherwise returns `data`.
 */
export function handleSupabaseResult<T>(data: T | null, error: any): T {
  if (error) {
    const statusCode = error.status || 400;
    const message = error.message || "Supabase query failed";

    throw new SupabaseError(message, statusCode, {
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
  }

  if (!data) {
    throw new SupabaseError("No data returned from Supabase", 404);
  }

  return data;
}
