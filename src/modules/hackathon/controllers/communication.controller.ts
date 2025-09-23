import { buildResponse } from "@/utils/buildResponse";
import {
  getAnnouncementsService,
  getCommunicationLinksService,
} from "../services/communication.service";
import {
  validateHackathonAnnouncementsParams,
  validateHackathonCommunicationLinksParams,
} from "../validators/communication.validator";

export const getCommunicationLinksController = async (params: any) => {
  try {
    const validatedParams = validateHackathonCommunicationLinksParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const result = await getCommunicationLinksService(validatedParams);

    return buildResponse({
      message: "Communication links retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to retrieve communication links",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getAnnouncementsController = async (params: any) => {
  try {
    const validatedParams = validateHackathonAnnouncementsParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const result = await getAnnouncementsService(validatedParams);

    return buildResponse({
      message: "Announcements retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to retrieve announcements",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
