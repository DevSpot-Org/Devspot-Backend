import { createClient } from "@/lib/supabase";
import { ResourcesRepository } from "../repositories/resources.repository";
import {
  HackathonResourceParams,
  HackathonResourceResponse,
  HackathonResourcesParams,
  HackathonResourcesResponse,
} from "../types";

export const getHackathonResourcesService = async (
  params: HackathonResourcesParams
): Promise<HackathonResourcesResponse> => {
  const supabase = await createClient();
  const resourcesRepository = new ResourcesRepository(supabase);

  const resources = await resourcesRepository.getHackathonResources(params.hackathon_id);

  return {
    resources,
  };
};

export const getHackathonResourceService = async (
  params: HackathonResourceParams
): Promise<HackathonResourceResponse> => {
  const supabase = await createClient();
  const resourcesRepository = new ResourcesRepository(supabase);

  const resource = await resourcesRepository.getHackathonResource(
    params.hackathon_id,
    params.resource_id
  );

  return {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    url: resource.url,
  };
};
