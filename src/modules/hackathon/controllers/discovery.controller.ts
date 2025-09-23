import { buildResponse } from "@/utils/buildResponse";
import { discoverHackathonsService } from "../services/discovery.service";

export const discoverHackathonsController = async () => {
  try {
    const result = await discoverHackathonsService();

    return buildResponse({
      message: "Hackathons retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to retrieve hackathons",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
