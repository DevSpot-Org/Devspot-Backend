import { createClient } from "@/lib/supabase";
import { uploadImage } from "../../../utils/uploadImage";
import { uploadVideo } from "../../../utils/uploadVideo";
import { ProjectsRepository } from "../repositories/projects.repository";
import { HeaderImageResponse } from "../types";

export const uploadHeaderImageService = async (
  projectId: number,
  formData: FormData
): Promise<HeaderImageResponse> => {
  const file = formData.get("image");

  if (!file || !(file instanceof File)) {
    throw new Error("image must be a valid file");
  }

  const { publicUrl: public_url, error: upload_error } = await uploadImage({
    file,
    userId: projectId?.toString(),
    bucketName: "project-videos",
    folderPath: "project-banners",
  });

  if (upload_error) {
    throw new Error(`Image upload failed: ${upload_error}`);
  }

  const supabase = await createClient();
  const projectsRepository = new ProjectsRepository(supabase);

  await projectsRepository.updateProjectHeaderUrl(projectId, public_url);

  return {
    imageUrl: public_url,
  };
};

export const uploadLogoService = async (
  projectId: number,
  formData: FormData
): Promise<HeaderImageResponse> => {
  const file = formData.get("image");

  if (!file || !(file instanceof File)) {
    throw new Error("image must be a valid file");
  }

  const { publicUrl: public_url, error: upload_error } = await uploadImage({
    file,
    userId: projectId?.toString(),
    bucketName: "project-videos",
    folderPath: "project-logos",
  });

  if (upload_error) {
    throw new Error(`Image upload failed: ${upload_error}`);
  }

  const supabase = await createClient();
  const projectsRepository = new ProjectsRepository(supabase);

  await projectsRepository.updateProjectLogoUrl(projectId, public_url);

  return {
    imageUrl: public_url,
  };
};

export const uploadVideoService = async (
  projectId: number,
  formData: FormData
): Promise<HeaderImageResponse> => {
  const file = formData.get("video");

  if (!file || !(file instanceof File)) {
    throw new Error("video must be a valid file");
  }

  const { publicUrl: public_url, error: upload_error } = await uploadVideo({
    file,
    userId: projectId?.toString(),
    bucketName: "project-videos",
    folderPath: "videos",
  });

  if (upload_error) {
    throw new Error(`Video upload failed: ${upload_error}`);
  }

  const supabase = await createClient();
  const projectsRepository = new ProjectsRepository(supabase);

  await projectsRepository.updateProjectVideoUrl(projectId, public_url);

  return {
    imageUrl: public_url,
  };
};

export const deleteHeaderImageService = async (projectId: number): Promise<null> => {
  const supabase = await createClient();
  const projectsRepository = new ProjectsRepository(supabase);

  await projectsRepository.deleteProjectHeaderUrl(projectId);

  return null;
};

export const deleteLogoService = async (projectId: number): Promise<null> => {
  const supabase = await createClient();
  const projectsRepository = new ProjectsRepository(supabase);

  await projectsRepository.deleteProjectLogoUrl(projectId);

  return null;
};

export const deleteVideoService = async (projectId: number): Promise<null> => {
  const supabase = await createClient();
  const projectsRepository = new ProjectsRepository(supabase);

  await projectsRepository.deleteProjectVideoUrl(projectId);

  return null;
};
