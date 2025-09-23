import {
  create_tag,
  get_technology_tag_options,
} from "@/lib/services/utils/tagService";
import { type NextRequest } from "next/server";

export const POST = async (request: NextRequest) => {
  const body = await request?.json();

  return await create_tag(body);
};

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const searchTerm = searchParams.get('search') || searchParams.get('q');
  
  return await get_technology_tag_options(searchTerm);
};
