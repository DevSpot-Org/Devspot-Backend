import { buildResponse } from "@/utils/buildResponse";
import {
  createHackathonFaqService,
  deleteHackathonFaqService,
  getHackathonFaqService,
  getHackathonFaqsService,
  updateHackathonFaqService,
} from "../services/faqs.service";
import {
  validateHackathonFaqBody,
  validateHackathonFaqParams,
  validateHackathonFaqsParams,
} from "../validators/faqs.validator";

export const getHackathonFaqsController = async (params: any) => {
  try {
    const validatedParams = validateHackathonFaqsParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const result = await getHackathonFaqsService(validatedParams);

    return buildResponse({
      message: "Hackathon FAQs retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to retrieve hackathon FAQs",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getHackathonFaqController = async (params: any) => {
  try {
    const validatedParams = validateHackathonFaqParams({
      hackathon_id: parseInt(params.hackathonId),
      faq_id: parseInt(params.faqId),
    });
    const result = await getHackathonFaqService(validatedParams);

    return buildResponse({
      message: "Hackathon FAQ retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to retrieve hackathon FAQ",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const createHackathonFaqController = async (params: any, body: any) => {
  try {
    const validatedParams = validateHackathonFaqsParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const validatedBody = validateHackathonFaqBody(body);
    const result = await createHackathonFaqService(validatedParams, validatedBody);

    return buildResponse({
      message: "Hackathon FAQ created successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to create hackathon FAQ",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const updateHackathonFaqController = async (params: any, body: any) => {
  try {
    const validatedParams = validateHackathonFaqParams({
      hackathon_id: parseInt(params.hackathonId),
      faq_id: parseInt(params.faqId),
    });
    const validatedBody = validateHackathonFaqBody(body);
    const result = await updateHackathonFaqService(validatedParams, validatedBody);

    return buildResponse({
      message: "Hackathon FAQ updated successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to update hackathon FAQ",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const deleteHackathonFaqController = async (params: any) => {
  try {
    const validatedParams = validateHackathonFaqParams({
      hackathon_id: parseInt(params.hackathonId),
      faq_id: parseInt(params.faqId),
    });
    await deleteHackathonFaqService(validatedParams);

    return buildResponse({
      message: "Hackathon FAQ deleted successfully",
      data: null,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to delete hackathon FAQ",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
