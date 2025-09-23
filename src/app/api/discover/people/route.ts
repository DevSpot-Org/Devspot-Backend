import { getPeopleDiscoverPageController } from "@/modules/user/controllers";
import { type NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  return await getPeopleDiscoverPageController();
};
