import { createClient } from "@/lib/supabase";
import { HackathonsRepository } from "@/modules/hackathon/repositories/hackathons.repository";
import { ProjectsRepository } from "@/modules/projects/repositories/projects.repository";
import { JudgingAndWinnersAnalyticsResponse } from "../types/judging-and-winners.types";
import { JudgingCriteriaScoresAnalytics } from "../types/judging-criteria-scores.types";
import { PrizeAndPaymentAnalyticsResponse } from "../types/prize-and-payment.types";
import { PrizesPerWinningProjectsAnalytics } from "../types/prizes-per-winning-projects.types";
import { ProjectSubmissionsAnalyticsResponse } from "../types/project-submissions.types";
import { ProjectTypeBreakdownAnalytics } from "../types/project-type-breakdown.types";
import { SubmissionsPerChallengeAnalytics } from "../types/submissions-per-challenge.types";
import { TechnologiesCountAnalytics } from "../types/technologies-count.types";
import { TechnologiesUsedAnalytics } from "../types/technologies-used.types";
import { TotalPerScoreChartAnalyticsResponse } from "../types/total-per-score-chart.types";
import { TotalPerScoreSummaryAnalyticsResponse } from "../types/total-per-score-summary.types";
import { WinningProjectPerPrizeAnalytics } from "../types/winning-project-per-prize.types";

export const getHackathonRecapProjectsTypeBreakdownService = async (
  technologyOwnerId: number,
  hackathonId: number
): Promise<ProjectTypeBreakdownAnalytics> => {
  const supabase = await createClient();

  const hackathonsRepository = new HackathonsRepository(supabase);
  const projectsRepository = new ProjectsRepository(supabase);

  // Validate that the hackathon belongs to the technology owner
  const hackathon = await hackathonsRepository.findById(hackathonId);
  if (!hackathon) {
    throw new Error("Hackathon not found");
  }

  if (hackathon.organizer_id !== technologyOwnerId) {
    throw new Error("Hackathon does not belong to the specified technology owner");
  }

  const typeBreakdown = await projectsRepository.getHackathonProjectTypeBreakdown(hackathonId);

  const analytics: ProjectTypeBreakdownAnalytics = {
    type_breakdown: typeBreakdown,
  };

  return analytics;
};

export const getHackathonRecapProjectsSubmissionsPerChallengeService = async (
  technologyOwnerId: number,
  hackathonId: number
): Promise<SubmissionsPerChallengeAnalytics> => {
  const supabase = await createClient();

  const hackathonsRepository = new HackathonsRepository(supabase);
  const projectsRepository = new ProjectsRepository(supabase);

  // Validate that the hackathon belongs to the technology owner
  const hackathon = await hackathonsRepository.findById(hackathonId);
  if (!hackathon) {
    throw new Error("Hackathon not found");
  }

  if (hackathon.organizer_id !== technologyOwnerId) {
    throw new Error("Hackathon does not belong to the specified technology owner");
  }

  const submissionsPerChallenge =
    await projectsRepository.getHackathonSubmissionsPerChallenge(hackathonId);

  const analytics: SubmissionsPerChallengeAnalytics = {
    submissions_per_challenge: submissionsPerChallenge,
  };

  return analytics;
};

export const getHackathonRecapProjectsTechnologiesCountService = async (
  technologyOwnerId: number,
  hackathonId: number
): Promise<TechnologiesCountAnalytics> => {
  const supabase = await createClient();

  const hackathonsRepository = new HackathonsRepository(supabase);
  const projectsRepository = new ProjectsRepository(supabase);

  // Validate that the hackathon belongs to the technology owner
  const hackathon = await hackathonsRepository.findById(hackathonId);
  if (!hackathon) {
    throw new Error("Hackathon not found");
  }

  if (hackathon.organizer_id !== technologyOwnerId) {
    throw new Error("Hackathon does not belong to the specified technology owner");
  }

  const technologiesCount = await projectsRepository.getHackathonTechnologiesCount(hackathonId);

  const analytics: TechnologiesCountAnalytics = {
    technologies_count: technologiesCount,
  };

  return analytics;
};

export const getHackathonRecapProjectsTechnologiesUsedService = async (
  technologyOwnerId: number,
  hackathonId: number
): Promise<TechnologiesUsedAnalytics> => {
  const supabase = await createClient();

  const hackathonsRepository = new HackathonsRepository(supabase);
  const projectsRepository = new ProjectsRepository(supabase);

  // Validate that the hackathon belongs to the technology owner
  const hackathon = await hackathonsRepository.findById(hackathonId);
  if (!hackathon) {
    throw new Error("Hackathon not found");
  }

  if (hackathon.organizer_id !== technologyOwnerId) {
    throw new Error("Hackathon does not belong to the specified technology owner");
  }

  const technologiesUsed = await projectsRepository.getHackathonTechnologiesUsed(hackathonId);

  const analytics: TechnologiesUsedAnalytics = {
    technologies_used: technologiesUsed,
  };

  return analytics;
};

export const getHackathonRecapProjectsJudgingCriteriaScoresService = async (
  technologyOwnerId: number,
  hackathonId: number,
  challengeIds: number[]
): Promise<JudgingCriteriaScoresAnalytics> => {
  const supabase = await createClient();

  const hackathonsRepository = new HackathonsRepository(supabase);
  const projectsRepository = new ProjectsRepository(supabase);

  // Validate that the hackathon belongs to the technology owner
  const hackathon = await hackathonsRepository.findById(hackathonId);
  if (!hackathon) {
    throw new Error("Hackathon not found");
  }

  if (hackathon.organizer_id !== technologyOwnerId) {
    throw new Error("Hackathon does not belong to the specified technology owner");
  }

  const judgingCriteriaScores = await projectsRepository.getHackathonJudgingCriteriaScores(
    hackathonId,
    challengeIds
  );

  const analytics: JudgingCriteriaScoresAnalytics = {
    judging_criteria_scores: judgingCriteriaScores,
  };

  return analytics;
};

export const getHackathonRecapProjectsPrizesPerWinningProjectsService = async (
  technologyOwnerId: number,
  hackathonId: number
): Promise<PrizesPerWinningProjectsAnalytics> => {
  const supabase = await createClient();

  const hackathonsRepository = new HackathonsRepository(supabase);
  const projectsRepository = new ProjectsRepository(supabase);

  // Validate that the hackathon belongs to the technology owner
  const hackathon = await hackathonsRepository.findById(hackathonId);
  if (!hackathon) {
    throw new Error("Hackathon not found");
  }

  if (hackathon.organizer_id !== technologyOwnerId) {
    throw new Error("Hackathon does not belong to the specified technology owner");
  }

  const prizesPerWinningProjects =
    await projectsRepository.getHackathonPrizesPerWinningProjects(hackathonId);

  const analytics: PrizesPerWinningProjectsAnalytics = {
    prizes_per_winning_projects: prizesPerWinningProjects,
  };

  return analytics;
};

export const getHackathonRecapProjectsWinningProjectPerPrizeService = async (
  technologyOwnerId: number,
  hackathonId: number,
  challengeIds: number[]
): Promise<WinningProjectPerPrizeAnalytics> => {
  const supabase = await createClient();

  const hackathonsRepository = new HackathonsRepository(supabase);
  const projectsRepository = new ProjectsRepository(supabase);

  // Validate that the hackathon belongs to the technology owner
  const hackathon = await hackathonsRepository.findById(hackathonId);
  if (!hackathon) {
    throw new Error("Hackathon not found");
  }

  if (hackathon.organizer_id !== technologyOwnerId) {
    throw new Error("Hackathon does not belong to the specified technology owner");
  }

  const winningProjectPerPrize = await projectsRepository.getHackathonWinningProjectPerPrize(
    hackathonId,
    challengeIds
  );

  const analytics: WinningProjectPerPrizeAnalytics = {
    winning_projects_per_prize: winningProjectPerPrize,
  };

  return analytics;
};

export const getHackathonRecapProjectsPrizeAndPaymentService = async (
  technologyOwnerId: number,
  hackathonId: number,
  challengeIds: number[]
): Promise<PrizeAndPaymentAnalyticsResponse> => {
  const supabase = await createClient();

  const hackathonsRepository = new HackathonsRepository(supabase);
  const projectsRepository = new ProjectsRepository(supabase);

  // Validate that the hackathon belongs to the technology owner
  const hackathon = await hackathonsRepository.findById(hackathonId);
  if (!hackathon || hackathon.organizer_id !== technologyOwnerId) {
    throw new Error("Hackathon not found or access denied");
  }

  const prizeAndPayment = await projectsRepository.getHackathonPrizeAndPayment(
    hackathonId,
    challengeIds
  );

  const analytics: PrizeAndPaymentAnalyticsResponse = {
    prize_and_payment: prizeAndPayment,
  };

  return analytics;
};

export const getHackathonRecapProjectsProjectSubmissionsService = async (
  technologyOwnerId: number,
  hackathonId: number
): Promise<ProjectSubmissionsAnalyticsResponse> => {
  const supabase = await createClient();

  const hackathonsRepository = new HackathonsRepository(supabase);
  const projectsRepository = new ProjectsRepository(supabase);

  // Validate that the hackathon belongs to the technology owner
  const hackathon = await hackathonsRepository.findById(hackathonId);
  if (!hackathon || hackathon.organizer_id !== technologyOwnerId) {
    throw new Error("Hackathon not found or access denied");
  }

  const projectSubmissions = await projectsRepository.getHackathonProjectSubmissions(hackathonId);

  const analytics: ProjectSubmissionsAnalyticsResponse = {
    project_submissions: projectSubmissions,
  };

  return analytics;
};

export const getHackathonRecapProjectsJudgingAndWinnersService = async (
  technologyOwnerId: number,
  hackathonId: number,
  challengeIds: number[]
): Promise<JudgingAndWinnersAnalyticsResponse> => {
  const supabase = await createClient();

  const hackathonsRepository = new HackathonsRepository(supabase);
  const projectsRepository = new ProjectsRepository(supabase);

  // Validate that the hackathon belongs to the technology owner
  const hackathon = await hackathonsRepository.findById(hackathonId);
  if (!hackathon || hackathon.organizer_id !== technologyOwnerId) {
    throw new Error("Hackathon not found or access denied");
  }

  const judgingAndWinners = await projectsRepository.getHackathonJudgingAndWinners(
    hackathonId,
    challengeIds
  );

  const analytics: JudgingAndWinnersAnalyticsResponse = {
    judging_and_winners: judgingAndWinners,
  };

  return analytics;
};

export const getHackathonRecapProjectsTotalPerScoreSummaryService = async (
  technologyOwnerId: number,
  hackathonId: number,
  challengeIds: number[]
): Promise<TotalPerScoreSummaryAnalyticsResponse> => {
  const supabase = await createClient();

  const hackathonsRepository = new HackathonsRepository(supabase);
  const projectsRepository = new ProjectsRepository(supabase);

  // Validate that the hackathon belongs to the technology owner
  const hackathon = await hackathonsRepository.findById(hackathonId);
  if (!hackathon || hackathon.organizer_id !== technologyOwnerId) {
    throw new Error("Hackathon not found or access denied");
  }

  const totalPerScoreSummary = await projectsRepository.getHackathonTotalPerScoreSummary(
    hackathonId,
    challengeIds
  );

  const analytics: TotalPerScoreSummaryAnalyticsResponse = {
    total_per_score_summary: totalPerScoreSummary,
  };

  return analytics;
};

export const getHackathonRecapProjectsTotalPerScoreChartService = async (
  technologyOwnerId: number,
  hackathonId: number,
  challengeIds: number[]
): Promise<TotalPerScoreChartAnalyticsResponse> => {
  const supabase = await createClient();

  const hackathonsRepository = new HackathonsRepository(supabase);
  const projectsRepository = new ProjectsRepository(supabase);

  // Validate that the hackathon belongs to the technology owner
  const hackathon = await hackathonsRepository.findById(hackathonId);
  if (!hackathon || hackathon.organizer_id !== technologyOwnerId) {
    throw new Error("Hackathon not found or access denied");
  }

  const totalPerScoreChart = await projectsRepository.getHackathonTotalPerScoreChart(
    hackathonId,
    challengeIds
  );

  const analytics: TotalPerScoreChartAnalyticsResponse = {
    total_per_score_chart: totalPerScoreChart,
  };

  return analytics;
};
