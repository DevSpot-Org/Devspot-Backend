import { discoverHackathonsController } from "@/modules/hackathon";
import { type NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  return await discoverHackathonsController();
};
