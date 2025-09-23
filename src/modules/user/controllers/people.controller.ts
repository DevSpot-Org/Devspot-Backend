import { buildResponse } from "@/utils/buildResponse";
import { getPeopleDiscoverPageService } from "../services/people.service";

export const getPeopleDiscoverPageController = async () => {
  try {
    const result = await getPeopleDiscoverPageService();

    return buildResponse({
      message: "People for Discover Page retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get people for Discover Page",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
