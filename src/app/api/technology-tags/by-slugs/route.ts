import { get_technology_tags_by_slugs } from "@/lib/services/utils/tagService";
import { type NextRequest } from "next/server";

export const POST = async (request: NextRequest) => {
  const body = await request?.json();
  return await get_technology_tags_by_slugs(body?.slugs || []);
};