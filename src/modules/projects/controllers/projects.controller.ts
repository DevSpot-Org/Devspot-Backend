

import { getAuthenticatedUser } from "@/modules/auth/utils";
import { buildResponse } from "@/utils/buildResponse";
import {
  createAIProjectService,
  createProjectService,
  deleteProjectService,
  getAllSubmittedProjectsService,
  getHackathonLeaderboardService,
  getHackathonProjectsSearchService,
  getHackathonProjectsService,
  getProjectByIdService,
  getProjectsDiscoverPageService,
  getUserProjectsService,
  updateProjectService,
} from "../services/projects.service";

export const getProjectByIdController = async (projectId: string) => {
  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError || !user) {
      return (
        authError ||
        buildResponse({
          message: "Authentication required",
          data: null,
          isError: true,
          status: 401,
        })
      );
    }

    const id = parseInt(projectId);
    if (!id || isNaN(id)) {
      return buildResponse({
        message: "Invalid Project ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const project = await getProjectByIdService(id, user.id);
    return buildResponse({
      message: "Project retrieved successfully",
      data: project,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get project",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const updateProjectController = async (projectId: string, body: any) => {
  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError || !user) {
      return (
        authError ||
        buildResponse({
          message: "Authentication required",
          data: null,
          isError: true,
          status: 401,
        })
      );
    }

    const id = parseInt(projectId);
    if (!id || isNaN(id)) {
      return buildResponse({
        message: "Invalid Project ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const updatedProject = await updateProjectService(id, body);
    return buildResponse({
      message: "Project updated successfully",
      data: updatedProject,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to update project",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const deleteProjectController = async (projectId: string) => {
  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError || !user) {
      return (
        authError ||
        buildResponse({
          message: "Authentication required",
          data: null,
          isError: true,
          status: 401,
        })
      );
    }

    
    const id = parseInt(projectId);
    if (!id || isNaN(id)) {
      return buildResponse({
        message: "Invalid Project ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const deletedProject = await deleteProjectService(id);
    return buildResponse({
      message: "Project deleted successfully",
      data: deletedProject,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to delete project",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getAllSubmittedProjectsController = async () => {
  try {
    const projects = await getAllSubmittedProjectsService();
    return buildResponse({
      message: "Submitted projects retrieved successfully",
      data: projects,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get submitted projects",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getProjectsDiscoverPageController = async () => {
  try {
    const result = await getProjectsDiscoverPageService();
    return buildResponse({
      message: "Projects for discover page retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to get projects for Discover Page",
      data: error,
      isError: true,
      status: 400,
    });
  }
};


export const getUserProjectsController = async (userId: string) => {
  try {
    const result = await getUserProjectsService(userId);
    return buildResponse({
      message: "User projects retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to get user's projects",
      data: error,
      isError: true,
      status: 400,
    });
  }
};

export const getHackathonProjectsController = async (
  hackathonId: string,
  options?: any
) => {
  try {
    const id = parseInt(hackathonId);
    if (!id || isNaN(id)) {
      return buildResponse({
        message: "Invalid Hackathon Id",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const result = await getHackathonProjectsService(id, options);

    return buildResponse({
      message: "Hackathon Projects Retrieved Successfully",
      data: result,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to get hackathon projects",
      data: error,
      isError: true,
      status: 400,
    });
  }
};

export const getHackathonProjectsSearchController = async (
  hackathonId: string
) => {
  try {
    const id = parseInt(hackathonId);
    if (!id || isNaN(id)) {
      return buildResponse({
        message: "Invalid Hackathon Id",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const data = await getHackathonProjectsSearchService(id);

    return buildResponse({
      message: "Hackathon Projects Retrieved Successfully",
      data,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to get hackathon projects",
      data: error,
      isError: true,
      status: 400,
    });
  }
};

export const getHackathonLeaderboardController = async (
  hackathonId: string,
  sortBy?: "standing" | "score" | "challenge"
) => {
  try {
    const id = parseInt(hackathonId);
    if (!id || isNaN(id)) {
      return buildResponse({
        message: "Invalid Hackathon Id",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const data = await getHackathonLeaderboardService(id, sortBy);

    return buildResponse({
      message: "Hackathon Leaderboard Retrieved Successfully",
      data,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to get hackathon Leaderboard",
      data: error,
      isError: true,
      status: 400,
    });
  }
};

export const createAIProjectController = async (body: any) => {
  try {
    const { user } = await getAuthenticatedUser();
    if (!user) {
      return buildResponse({
        message: "Authentication required",
        data: null,
        isError: true,
        status: 401,
      });
    }

    const result = await createAIProjectService({
      ai: true,
      creator_id: user.id,
      hackathonId: body.hackathonId,
      projectUrl: body.projectUrl,
      name: body?.name ?? undefined,
    });
    return buildResponse({
      message: "AI project created successfully",
      data: result,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to create AI project",
      data: error,
      isError: true,
      status: 400,
    });
  }
};

export const createProjectController = async (body: any) => {
  try {
    const { user } = await getAuthenticatedUser();
    if (!user) {
      return buildResponse({
        message: "Authentication required",
        data: null,
        isError: true,
        status: 401,
      });
    }

    const result = await createProjectService({
      creator_id: user.id,
      hackathonId: body.hackathonId,
      projectUrl: body.projectUrl,
      name: body.name,
      challengeIds: body.challengeIds,
      projectCodeType: body.projectCodeType,
      logo_url: body.logo_url,
    });
    return buildResponse({
      message: "Project created successfully",
      data: result,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to create project",
      data: error,
      isError: true,
      status: 400,
    });
  }
};
