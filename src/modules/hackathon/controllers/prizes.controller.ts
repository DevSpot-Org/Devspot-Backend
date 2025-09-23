import { buildResponse } from "@/utils/buildResponse";
import { getHackathonPrizesService } from "../services/prizes.service";
import { validateHackathonPrizesParams } from "../validators/prizes.validator";

export const getHackathonPrizesController = async (params: any) => {
  try {
    const validatedParams = validateHackathonPrizesParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const result = await getHackathonPrizesService(validatedParams);

    return buildResponse({
      message: "Hackathon prizes retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to retrieve hackathon prizes",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
