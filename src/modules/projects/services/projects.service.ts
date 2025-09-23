import { createClient } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/modules/auth/utils";
import { HackathonChallengeFeedbackRepository } from "@/modules/hackathon/repositories/hackathon-challenge-feedback.repository";
import { HackathonsRepository } from "@/modules/hackathon/repositories/hackathons.repository";
import { JudgingEntriesRepository } from "@/modules/judging/repositories";
import { ProjectChallengesRepository } from "../repositories/project-challenges.repository";
import { ProjectTeamMembersRepository } from "../repositories/project-team-members.repository";
import { ProjectsRepository } from "../repositories/projects.repository";
import { validateHackathonAndParticipant } from "../utils/validation-helpers";

export const getProjectByIdService = async (projectId: number, userId?: string) => {
  const supabase = await createClient();
  const projectsRepository = new ProjectsRepository(supabase);
  const projectTeamMembersRepository = new ProjectTeamMembersRepository(supabase);

  const project = await projectsRepository.findById(projectId);
  if (!project) {
    throw new Error("Could not fetch project");
  }

  let is_owner = false;

  if (userId) {
    const team_member = await projectTeamMembersRepository.checkTeamMemberStatus(projectId, userId);
    is_owner = !!team_member;
  }

  const project_completion_rate = await calculateProjectCompletionRate(supabase, project, userId);

  return { ...project, is_owner, project_completion_rate };
};

export const updateProjectService = async (
  projectId: number,
  updates: Partial<{
    name: string;
    description: string;
    video_url: string;
    demo_url: string;
    project_url: string;
    logo_url: string;
    header_url: string;
    submitted: boolean;
    technologies: string[];
    challenge_ids: number[];
    project_code_type?: "fresh_code" | "existing_code";
  }>
) => {
  const supabase = await createClient();
  const projectsRepository = new ProjectsRepository(supabase);
  const projectChallengesRepository = new ProjectChallengesRepository(supabase);

  const { challenge_ids, ...rest } = updates;
  const projectFields: Partial<{
    name: string;
    description: string;
    video_url: string;
    demo_url: string;
    project_url: string;
    logo_url: string;
    header_url: string;
    submitted: boolean;
    technologies: string[];
    project_code_type?: "fresh_code" | "existing_code";
  }> = rest;

  const updatedProject = await projectsRepository.update(projectId, projectFields);

  // If challenge_ids provided, update project_challenges
  if (challenge_ids) {
    await projectChallengesRepository.deleteByProjectId(projectId);
    await projectChallengesRepository.insertChallengeLinks(projectId, challenge_ids);
  }

  if (projectFields.technologies) {
    // Note: Legacy code had token service logic here, but we'll keep it simple for now
    // as the main functionality is the project update
  }

  return updatedProject;
};

export const deleteProjectService = async (projectId: number) => {
  const supabase = await createClient();
  const projectsRepository = new ProjectsRepository(supabase);

  const deletedProject = await projectsRepository.delete(projectId);
  return deletedProject;
};

// Helper function to calculate project completion rate (copied exactly from legacy)
async function calculateProjectCompletionRate(supabase: any, project: any, userId?: string) {
  const hackathonChallengeFeedbackRepository = new HackathonChallengeFeedbackRepository(supabase);

  const completionCriteria = [
    {
      check: () => Boolean(project.project_url),
      points: 20,
    },
    {
      check: () => Boolean(project.demo_url),
      points: 10,
    },
    {
      check: () => Boolean(project.video_url),
      points: 20,
    },
    {
      check: () => Boolean(project.description),
      points: 10,
    },
    {
      check: () => Array.isArray(project.technologies) && project.technologies.length >= 1,
      points: 10,
    },
    {
      check: () =>
        Array.isArray(project.project_challenges) && project.project_challenges.length >= 1,
      points: 20,
    },
    {
      check: async () => {
        if (!userId) return 0;
        const feedbacks = await hackathonChallengeFeedbackRepository.getUserFeedbackByHackathon(
          project.hackathon_id,
          userId
        );

        const remainingChallenges = project?.project_challenges?.filter(
          (challenge: any) =>
            !feedbacks?.some((feedback: any) => feedback.challenge_id === challenge.challenge_id)
        );

        if (remainingChallenges?.length === 0) return 10;

        return 0;
      },
      points: 0,
    },
  ];

  let totalPoints = 0;

  for (const criteria of completionCriteria) {
    const result = await criteria.check();
    totalPoints += typeof result === "number" ? result : result ? criteria.points : 0;
  }

  return totalPoints;
}

export const getAllSubmittedProjectsService = async () => {
  const supabase = await createClient();
  const projectsRepository = new ProjectsRepository(supabase);

  const projects = await projectsRepository.getAllSubmittedProjects();
  return projects;
};

export const getProjectsDiscoverPageService = async (): Promise<any> => {
  const supabase = await createClient();
  const projectsRepository = new ProjectsRepository(supabase);

  const [projects, count] = await Promise.all([
    projectsRepository.getDiscoverProjects(),
    projectsRepository.getProjectsCount(),
  ]);

  return {
    projects,
    count,
  };
};
export const getUserProjectsService = async (userId: string): Promise<any> => {
  const supabase = await createClient();
  const projectsRepository = new ProjectsRepository(supabase);
  const { user } = await getAuthenticatedUser();

  const isOwner = user?.id === userId;
  const data = await projectsRepository.getUserProjects(userId, isOwner);

  return data;
};

export const getHackathonProjectsService = async (
  hackathonId: number,
  options?: any
): Promise<any> => {
  const supabase = await createClient();
  const projectsRepository = new ProjectsRepository(supabase);

  // Try to get authenticated user, but don't fail if not authenticated
  let userId: string | undefined;
  try {
    const { user } = await getAuthenticatedUser();
    userId = user?.id;
  } catch (error) {
    // User is not authenticated, continue without user ID
    userId = undefined;
  }

  const data = await projectsRepository.getHackathonProjects(hackathonId, options, userId);

  return data;
};

export const getHackathonProjectsSearchService = async (hackathonId: number): Promise<any> => {
  const supabase = await createClient();
  const projectsRepository = new ProjectsRepository(supabase);

  const data = await projectsRepository.getHackathonProjectsSearch(hackathonId);

  return data;
};

export const getHackathonLeaderboardService = async (
  hackathonId: number,
  sortBy: "standing" | "score" | "challenge" = "standing"
): Promise<any> => {
  const supabase = await createClient();
  const projectChallengesRepository = new ProjectChallengesRepository(supabase);
  const judgingEntriesRepository = new JudgingEntriesRepository(supabase);
  const hackathonsRepository = new HackathonsRepository(supabase);

  // Get project challenges with leaderboard data
  const projectChallenges = await projectChallengesRepository.getLeaderboardData(hackathonId);

  // Get judging entries for each project-challenge combination
  const judgingEntries = await judgingEntriesRepository.getLeaderboardEntries(
    projectChallenges.map((pc) => pc.project_id)
  );

  // Transform data keeping each project-challenge combination separate
  const leaderboardData = projectChallenges.map((pc) => {
    // Get judging entries specific to this project-challenge combination
    const relevantEntries = judgingEntries.filter(
      (entry) => entry.project_id === pc.project_id && entry.challenge_id === pc.challenge_id
    );

    const validScores = relevantEntries.filter((entry) => entry.score !== null);
    const averageScore = validScores.length
      ? Math.round(validScores.reduce((sum, entry) => sum + entry.score, 0) / validScores.length)
      : 0;

    const randomComments = () => {
      if (relevantEntries.length <= 0) {
        return {
          comments: "",
          judge: null,
        };
      }

      const randomNumber = Math.floor(Math.random() * relevantEntries.length);

      const entry = relevantEntries[randomNumber];

      return {
        comments: entry.general_comments_summary,
        judge: {
          name: entry.judgings?.users.full_name,
          avatar_url: entry.judgings?.users.avatar_url,
        },
      };
    };

    const comment = randomComments();

    return {
      projectId: pc.project_id,
      challengeId: pc.challenge_id,
      projectName: pc.projects.name,
      projectDescription: pc.projects.description,
      challengeName: pc.hackathon_challenges.challenge_name,
      rank: pc.rank,
      averageScore,
      project: pc.projects,
      comments: comment?.comments,
      commentJudge: comment?.judge,
    };
  });

  switch (sortBy) {
    case "standing":
      leaderboardData.sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity));
      break;
    case "score":
      leaderboardData.sort((a, b) => b.averageScore - a.averageScore);
      break;
    case "challenge":
      leaderboardData.sort((a, b) => a.challengeName.localeCompare(b.challengeName));
      break;
  }

  // Get leaderboard options
  const leaderboardOptionsData = await hackathonsRepository.getLeaderboardOptions(hackathonId);

  const leaderboardOptions = {
    show_leaderboard_comments: leaderboardOptionsData?.show_leaderboard_comments ?? false,
    show_leaderboard_score: leaderboardOptionsData?.show_leaderboard_score ?? false,
    leaderboard_standing_by: leaderboardOptionsData?.leaderboard_standing_by ?? "standing",
  };

  return {
    projects: leaderboardData,
    options: leaderboardOptions,
  };
};

export const createAIProjectService = async (body: {
  name?: string;
  projectUrl: string;
  hackathonId: number;
  ai?: boolean;
  creator_id: string;
}): Promise<any> => {
  const supabase = await createClient();
  const projectsRepository = new ProjectsRepository(supabase);
  const projectChallengesRepository = new ProjectChallengesRepository(supabase);
  const projectTeamMembersRepository = new ProjectTeamMembersRepository(supabase);

  const { hackathonId, creator_id } = {
    hackathonId: body.hackathonId,
    creator_id: body.creator_id,
  };

  try {
    await validateHackathonAndParticipant(hackathonId, creator_id, supabase);

    if (body?.ai) {
      return await create_project_with_bot(body.projectUrl, creator_id);

      // return await this.createAIProject(body, hackathonId, creator_id);
    }

    return await createManualProject(
      body,
      hackathonId,
      creator_id,
      projectsRepository,
      projectChallengesRepository,
      projectTeamMembersRepository
    );
  } catch (error: any) {
    if (error && typeof error === "object" && "name" in error && error.name === "AxiosError") {
      throw new Error(`${error?.response?.data?.error}`);
    }

    throw error;
  }
};

export const createProjectService = async (body: {
  name: string;
  projectUrl: string | null;
  hackathonId: number;
  projectCodeType: "fresh_code" | "existing_code";
  challengeIds: number[];
  logo_url: string;
  creator_id: string;
}): Promise<any> => {
  const supabase = await createClient();
  const projectsRepository = new ProjectsRepository(supabase);
  const projectChallengesRepository = new ProjectChallengesRepository(supabase);
  const projectTeamMembersRepository = new ProjectTeamMembersRepository(supabase);

  // Copy exact legacy create_project function
  const { hackathonId, creator_id } = {
    hackathonId: body.hackathonId,
    creator_id: body.creator_id,
  };

  try {
    await validateHackathonAndParticipant(hackathonId, creator_id, supabase);

    // For regular projects, call createManualProject (exact legacy logic)
    return await createManualProject(
      body,
      hackathonId,
      creator_id,
      projectsRepository,
      projectChallengesRepository,
      projectTeamMembersRepository
    );
  } catch (error: any) {
    if (error && typeof error === "object" && "name" in error && error.name === "AxiosError") {
      throw new Error(`${error?.response?.data?.error}`);
    }

    throw error;
  }
};

async function create_project_with_bot(projectUrl: string, creator_id: string) {
  const response = await fetch(
    `https://devspot-judge-agent.onrender.com/project/generate?project_url=${encodeURIComponent(projectUrl)}&user_id=${encodeURIComponent(creator_id)}`
  );
  const data = await response.json();
  if (!data) return null;

  return data;
}

async function createManualProject(
  body: any,
  hackathonId: number,
  creator_id: string,
  projectsRepository: any,
  projectChallengesRepository: any,
  projectTeamMembersRepository: any
) {
  const project = await projectsRepository.insertProject({
    project_url: body.projectUrl,
    hackathon_id: hackathonId,
    submitted: false,
    name: body.name,
    project_code_type: body.project_code_type,
    logo_url: body.logo_url,
  });

  await projectChallengesRepository.linkProjectChallenges(project.id, body.challengeIds);
  await projectTeamMembersRepository.addTeamMember(project.id, creator_id);

  return project;
}
