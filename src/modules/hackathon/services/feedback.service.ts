import { createClient } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/modules/auth/utils";
import { FeedbackRepository } from "../repositories/feedback.repository";
import HackathonFeedbackRepository from "../repositories/hackathon-feedback.repository";
import {
  HackathonFeedbackParams,
  HackathonFeedbackRequest,
  HackathonFeedbackResponse,
} from "../types";

export const createHackathonFeedbackService = async (
  params: HackathonFeedbackParams,
  body: HackathonFeedbackRequest
): Promise<HackathonFeedbackResponse> => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    throw new Error("Authentication failed");
  }

  const feedbackRepository = new FeedbackRepository(supabase);
  const result = await feedbackRepository.createHackathonFeedback(
    params.hackathon_id,
    user.id,
    body.feedback,
    body.rating
  );

  return {
    id: result.id,
    feedback: result.feedback,
    rating: result.rating,
    created_at: result.created_at,
  };
};

export const getFeedbackByChallengeService = async (hackathonId: number, challengeId: number) => {
  const supabase = await createClient();
  const hackathonFeedbackRepo = new HackathonFeedbackRepository(supabase);
  const { data, error } = await hackathonFeedbackRepo.getFeedbackByChallenge(
    hackathonId,
    challengeId
  );

  if (error) throw new Error(`Failed to get feedback: ${error.message}`);
  return data;
};

export const createFeedbackForChallenge = async (payload: {
  hackathon_id: number;
  challenge_id: number;
  project_id: number;
  overall_rating: number;
  docs_rating: number;
  support_rating: number;
  comments?: string;
}) => {
  const supabase = await createClient();
  const hackathonFeedbackRepo = new HackathonFeedbackRepository(supabase);
  const { data, error } = await hackathonFeedbackRepo.createFeedbackForChallenge(payload);

  if (error) throw new Error(`Failed to create feedback: ${error.message}`);
  return data;
};

export const updateFeedbackForChallenge = async (payload: {
  hackathon_id: number;
  challenge_id: number;
  project_id: number;
  overall_rating?: number;
  docs_rating?: number;
  support_rating?: number;
  comments?: string;
}) => {
  const supabase = await createClient();
  const hackathonFeedbackRepo = new HackathonFeedbackRepository(supabase);
  const updates: Record<string, any> = {};
  if (payload.overall_rating !== undefined) updates.overall_rating = payload.overall_rating;
  if (payload.docs_rating !== undefined) updates.docs_rating = payload.docs_rating;
  if (payload.support_rating !== undefined) updates.support_rating = payload.support_rating;
  if (payload.comments !== undefined) updates.comments = payload.comments;

  const { data, error } = await hackathonFeedbackRepo.updateFeedbackForChallenge(
    payload.hackathon_id,
    payload.challenge_id,
    payload.project_id,
    updates
  );

  if (error) throw new Error(`Failed to update feedback: ${error.message}`);
  return data;
};
