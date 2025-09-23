import { createClient } from "@/lib/supabase";
import { HackathonsRepository } from "@/modules/hackathon/repositories/hackathons.repository";
import { ParticipantFeedbackAnalytics } from "../types/participant-feedback.types";

export const getHackathonRecapFeedbackService = async (
  technologyOwnerId: number,
  hackathonId: number,
  specificEndpoint?: string
): Promise<ParticipantFeedbackAnalytics> => {
  const supabase = await createClient();

  // Initialize repositories
  const hackathonsRepository = new HackathonsRepository(supabase);

  // Validate that the hackathon belongs to the technology owner
  const hackathon = await hackathonsRepository.findById(hackathonId);
  if (!hackathon) {
    throw new Error("Hackathon not found");
  }

  if (hackathon.organizer_id !== technologyOwnerId) {
    throw new Error("Hackathon does not belong to the specified technology owner");
  }

  // Handle participant feedback endpoint
  if (specificEndpoint === "participant-feedback") {
    // Fetch participant feedback averages
    const feedbackAverages = await hackathonsRepository.getParticipantFeedbackAverages(hackathonId);

    // Build the participant feedback analytics response
    const analytics: ParticipantFeedbackAnalytics = {
      overview: {
        participant_feedback_overview: `This hackathon received feedback with an overall experience rating of ${feedbackAverages.overall_hackathon_experience} and a recommendation likelihood of ${feedbackAverages.likeliness_to_recommend_hackathon}. DevSpot platform ratings show ${feedbackAverages.overall_devspot_experience} for overall experience and ${feedbackAverages.likeliness_to_recommend_devspot} for recommendation likelihood.`,
        overall_hackathon_experience: feedbackAverages.overall_hackathon_experience,
        likeliness_to_recommend_hackathon: feedbackAverages.likeliness_to_recommend_hackathon,
        overall_devspot_experience: feedbackAverages.overall_devspot_experience,
        likeliness_to_recommend_devspot: feedbackAverages.likeliness_to_recommend_devspot,
      },
    };

    return analytics;
  }

  // Default case - return empty feedback if no specific endpoint
  const analytics: ParticipantFeedbackAnalytics = {
    overview: {
      participant_feedback_overview: "No feedback data available for this hackathon.",
      overall_hackathon_experience: 0,
      likeliness_to_recommend_hackathon: 0,
      overall_devspot_experience: 0,
      likeliness_to_recommend_devspot: 0,
    },
  };

  return analytics;
};
