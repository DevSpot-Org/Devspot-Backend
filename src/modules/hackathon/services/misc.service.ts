import { createClient } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/modules/auth/utils";
import { ProjectsRepository } from "../../projects/repositories/projects.repository";
import { ChallengesRepository } from "../repositories/challenges.repository";
import { MiscRepository } from "../repositories/misc.repository";
import {
  HackathonHandleInvitationParams,
  HackathonHandleInvitationRequest,
  HackathonHandleInvitationResponse,
  HackathonJoinParams,
  HackathonJoinRequest,
  HackathonJoinResponse,
  HackathonJudgesSearchParams,
  HackathonJudgesSearchRequest,
  HackathonJudgesSearchResponse,
  HackathonLeaderboardParams,
  HackathonLeaderboardResponse,
  HackathonLeaveParams,
  HackathonLeaveResponse,
  HackathonOverviewParams,
  HackathonOverviewResponse,
  HackathonParams,
  HackathonResponse,
  HackathonSponsorsParams,
  HackathonSponsorsResponse,
  HackathonStakeParams,
  HackathonStakeRequest,
  HackathonStakeResponse,
  HackathonToggleJudgeParams,
  HackathonToggleJudgeRequest,
  HackathonToggleJudgeResponse,
  HackathonToggleMultiProjectsParams,
  HackathonToggleMultiProjectsRequest,
  HackathonToggleMultiProjectsResponse,
  HackathonVipsParams,
  HackathonVipsResponse,
} from "../types";

export const getHackathonOverviewService = async (
  params: HackathonOverviewParams
): Promise<HackathonOverviewResponse> => {
  const supabase = await createClient();
  const miscRepository = new MiscRepository(supabase);

  const hackathon = await miscRepository.getHackathonOverview(params.hackathon_id);

  return { hackathon };
};

export const joinHackathonService = async (
  params: HackathonJoinParams,
  body: HackathonJoinRequest
): Promise<HackathonJoinResponse> => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    throw new Error("Authentication failed");
  }

  const miscRepository = new MiscRepository(supabase);
  const result = await miscRepository.joinHackathon(params.hackathon_id, user.id, body.email);

  return {
    id: result.user_id,
    status: result.status,
  };
};

export const leaveHackathonService = async (
  params: HackathonLeaveParams
): Promise<HackathonLeaveResponse> => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    throw new Error("Authentication failed");
  }

  const miscRepository = new MiscRepository(supabase);
  await miscRepository.leaveHackathon(params.hackathon_id, user.id);

  return {
    message: "Successfully left hackathon",
  };
};

export const searchJudgesService = async (
  params: HackathonJudgesSearchParams,
  query: HackathonJudgesSearchRequest
): Promise<HackathonJudgesSearchResponse> => {
  const supabase = await createClient();
  const miscRepository = new MiscRepository(supabase);

  const judges = await miscRepository.searchJudges(params.hackathon_id, query.query);

  return { judges };
};

export const getLeaderboardService = async (
  params: HackathonLeaderboardParams
): Promise<HackathonLeaderboardResponse> => {
  const supabase = await createClient();
  const miscRepository = new MiscRepository(supabase);

  const leaderboard = await miscRepository.getLeaderboard(params.hackathon_id);

  return { leaderboard };
};

export const getSponsorsService = async (
  params: HackathonSponsorsParams
): Promise<HackathonSponsorsResponse> => {
  const supabase = await createClient();
  const miscRepository = new MiscRepository(supabase);

  const sponsors = await miscRepository.getSponsors(params.hackathon_id);

  return { sponsors };
};

export const createStakeService = async (
  params: HackathonStakeParams,
  body: HackathonStakeRequest
): Promise<HackathonStakeResponse> => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    throw new Error("Authentication failed");
  }

  const miscRepository = new MiscRepository(supabase);
  const result = await miscRepository.createStakeTransaction(
    params.hackathon_id,
    user.id,
    body.amount
  );

  return {
    transaction_id: result.id.toString(),
    status: result.status,
  };
};

export const toggleJudgeService = async (
  params: HackathonToggleJudgeParams,
  body: HackathonToggleJudgeRequest
): Promise<HackathonToggleJudgeResponse> => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    throw new Error("Authentication failed");
  }

  const miscRepository = new MiscRepository(supabase);
  const result = await miscRepository.toggleJudgeStatus(
    params.hackathon_id,
    user.id,
    body.is_judge
  );

  return {
    id: result.user_id,
    is_judge: result.is_judge,
  };
};

export const toggleMultiProjectsService = async (
  params: HackathonToggleMultiProjectsParams,
  body: HackathonToggleMultiProjectsRequest
): Promise<HackathonToggleMultiProjectsResponse> => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    throw new Error("Authentication failed");
  }

  const miscRepository = new MiscRepository(supabase);
  const result = await miscRepository.toggleMultiProjects(
    params.hackathon_id,
    body.allow_multiple_projects
  );

  return {
    id: result.id,
    allow_multiple_projects: result.allow_multiple_projects,
  };
};

export const getVipsService = async (
  params: HackathonVipsParams
): Promise<HackathonVipsResponse> => {
  const supabase = await createClient();
  const miscRepository = new MiscRepository(supabase);

  const vips = await miscRepository.getVips(params.hackathon_id);

  return { vips };
};

export const handleInvitationService = async (
  params: HackathonHandleInvitationParams,
  body: HackathonHandleInvitationRequest
): Promise<HackathonHandleInvitationResponse> => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    throw new Error("Authentication failed");
  }

  const miscRepository = new MiscRepository(supabase);
  await miscRepository.handleInvitation(
    params.hackathon_id,
    user.id,
    body.invitation_id,
    body.action
  );

  return {
    message: `Invitation ${body.action}ed successfully`,
  };
};

export const getHackathonService = async (params: HackathonParams): Promise<HackathonResponse> => {
  const supabase = await createClient();
  const miscRepository = new MiscRepository(supabase);

  const hackathon = await miscRepository.getHackathon(params.hackathon_id);

  return { hackathon };
};

export const getUsedTechnologiesInHackathonService = async (hackathonId: number) => {
  const supabase = await createClient();
  const hackathonRepository = new ChallengesRepository(supabase);

  const challenges = await hackathonRepository.findByHackathonId(hackathonId, ["technologies"]);

  const projectRepository = new ProjectsRepository(supabase);
  const projects = await projectRepository.findByHackathonId(hackathonId, ["technologies"]);

  // 3. Extract and deduplicate all challenge technologies
  const challengeTechnologies = new Set<string>();
  challenges?.forEach((challenge) => {
    if (challenge.technologies && Array.isArray(challenge.technologies)) {
      challenge.technologies.forEach((tech) => {
        if (tech && typeof tech === "string" && tech.trim() !== "") {
          challengeTechnologies.add(tech);
        }
      });
    }
  });

  // 4. Calculate total number of projects
  const totalProjects = projects?.length || 0;

  // 5. For each challenge technology, count how many projects use it
  const technologyStats = Array.from(challengeTechnologies).map((technology) => {
    let uses = 0;

    projects?.forEach((project) => {
      if (project.technologies && Array.isArray(project.technologies)) {
        if (project.technologies.includes(technology)) {
          uses++;
        }
      }
    });

    // Calculate percentage with 1 decimal place
    const percentage = totalProjects > 0 ? Math.round((uses / totalProjects) * 100 * 10) / 10 : 0;

    return {
      technology_name: technology,
      uses,
      percentage,
    };
  });

  // 6. Sort by uses count (highest to lowest)
  technologyStats.sort((a, b) => b.uses - a.uses);

  return technologyStats;
};
