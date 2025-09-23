import { getAuthenticatedUser } from "@/modules/auth/utils";
import { buildResponse } from "@/utils/buildResponse";

import {
  deleteHeaderImageService,
  deleteLogoService,
  deleteVideoService,
  uploadHeaderImageService,
  uploadLogoService,
  uploadVideoService,
} from "../services/media.service";

export const uploadHeaderImageController = async (projectId: string, formData: FormData) => {
  try {
    const { error } = await getAuthenticatedUser();

    if (error) return error;

    const id = parseInt(projectId);
    if (!id || isNaN(id)) {
      return buildResponse({
        message: "Invalid Project ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const data = await uploadHeaderImageService(id, formData);

    return buildResponse({
      message: "Header image uploaded successfully",
      data,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to update header image",
      data: error,
      isError: true,
      status: 400,
    });
  }
};

export const uploadLogoController = async (projectId: string, formData: FormData) => {
  try {
    const { error } = await getAuthenticatedUser();

    if (error) return error;

    const id = parseInt(projectId);
    if (!id || isNaN(id)) {
      return buildResponse({
        message: "Invalid Project ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const data = await uploadLogoService(id, formData);

    return buildResponse({
      message: "Logo uploaded successfully",
      data,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to update project image",
      data: error,
      isError: true,
      status: 400,
    });
  }
};

export const uploadVideoController = async (projectId: string, formData: FormData) => {
  try {
    const { error } = await getAuthenticatedUser();

    if (error) return error;

    const id = parseInt(projectId);
    if (!id || isNaN(id)) {
      return buildResponse({
        message: "Invalid Project ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const data = await uploadVideoService(id, formData);

    return buildResponse({
      message: "Video uploaded successfully",
      data,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to update project video",
      data: error,
      isError: true,
      status: 400,
    });
  }
};

export const deleteHeaderImageController = async (projectId: string) => {
  try {
    const { error } = await getAuthenticatedUser();

    if (error) return error;

    const id = parseInt(projectId);
    if (!id || isNaN(id)) {
      return buildResponse({
        message: "Invalid Project ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const data = await deleteHeaderImageService(id);

    return buildResponse({
      message: "Header image deleted successfully",
      data,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to remove header image",
      data: error,
      isError: true,
      status: 400,
    });
  }
};

export const deleteLogoController = async (projectId: string) => {
  try {
    const { error } = await getAuthenticatedUser();

    if (error) return error;

    const id = parseInt(projectId);
    if (!id || isNaN(id)) {
      return buildResponse({
        message: "Invalid Project ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const data = await deleteLogoService(id);

    return buildResponse({
      message: "Logo deleted successfully",
      data,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to remove project image",
      data: error,
      isError: true,
      status: 400,
    });
  }
};

export const deleteVideoController = async (projectId: string) => {
  try {
    const { error } = await getAuthenticatedUser();

    if (error) return error;

    const id = parseInt(projectId);
    if (!id || isNaN(id)) {
      return buildResponse({
        message: "Invalid Project ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const data = await deleteVideoService(id);

    return buildResponse({
      message: "Video deleted successfully",
      data,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to remove project video",
      data: error,
      isError: true,
      status: 400,
    });
  }
};
