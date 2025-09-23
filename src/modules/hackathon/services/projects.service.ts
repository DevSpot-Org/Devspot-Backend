import { createClient } from "@/lib/supabase";
import { ProjectsRepository } from "../../projects/repositories/projects.repository";
import {
  HackathonProjectsParams,
  HackathonProjectsRequest,
  HackathonProjectsResponse,
  SearchHackathonProjectsParams,
  SearchHackathonProjectsRequest,
  SearchHackathonProjectsResponse,
} from "../types";

export const getHackathonProjectsService = async (
  params: HackathonProjectsParams,
  query: HackathonProjectsRequest
): Promise<HackathonProjectsResponse> => {
  const supabase = await createClient();
  const projectsRepository = new ProjectsRepository(supabase);

  const result = await projectsRepository.getHackathonProjects(params.hackathon_id, {
    page: query.page,
    page_size: query.limit,
  });

  return {
    projects: result.items,
    total: result.totalItems,
  };
};

export const searchHackathonProjectsService = async (
  params: SearchHackathonProjectsParams,
  query: SearchHackathonProjectsRequest
): Promise<SearchHackathonProjectsResponse> => {
  const supabase = await createClient();
  const projectsRepository = new ProjectsRepository(supabase);

  const result = await projectsRepository.searchHackathonProjects(
    params.hackathon_id,
    query.query,
    query.page,
    query.limit
  );

  return {
    projects: result.projects,
    total: result.total,
  };
};
