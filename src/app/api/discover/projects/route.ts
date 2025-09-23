import { getProjectsDiscoverPageController } from "@/modules/projects/controllers/projects.controller";
import { type NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  return await getProjectsDiscoverPageController();
};
