import { createClient } from "@/lib/supabase";
import { HackathonsRepository } from "@/modules/hackathon/repositories/hackathons.repository";
import { ProjectsRepository } from "@/modules/projects/repositories/projects.repository";
import { AttritionAnalytics } from "../types/attrition.types";
import { MostCommonSkillsAnalytics } from "../types/most-common-skills.types";
import { ParticipantEngagementAnalytics } from "../types/participant-engagement.types";
import { HackathonRecapAnalytics } from "../types/recap-analytics.types";
import { SignUpsByLocationAnalytics } from "../types/sign-ups-by-location.types";

export const getHackathonRecapAnalyticsService = async (
  technologyOwnerId: number,
  hackathonId: number,
  specificEndpoint?: string
): Promise<
  | HackathonRecapAnalytics
  | ParticipantEngagementAnalytics
  | SignUpsByLocationAnalytics
  | MostCommonSkillsAnalytics
  | AttritionAnalytics
> => {
  const supabase = await createClient();

  // Initialize repositories
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

  // Handle different specific endpoints
  if (specificEndpoint === "participant-engagement") {
    // Fetch participant engagement data
    const [totalRegistrations, newToDevSpot, topGeographies, teamStats] = await Promise.all([
      hackathonsRepository.getHackathonTotalRegistrations(hackathonId),
      hackathonsRepository.getNewToDevSpotCount(hackathonId),
      hackathonsRepository.getTopGeographies(hackathonId),
      hackathonsRepository.getHackathonTeamStats(hackathonId),
    ]);

    // Build the participant engagement analytics response
    const analytics: ParticipantEngagementAnalytics = {
      overview: {
        participant_engagement_overview: `This hackathon attracted ${totalRegistrations} participants, with ${newToDevSpot} new to DevSpot. The event saw ${teamStats.number_of_teams} teams formed with an average team size of ${teamStats.average_team_size} members.`,
        total_registrations: totalRegistrations,
        new_to_devspot: newToDevSpot,
        top_3_geographies: topGeographies,
        number_of_solo_hackers: teamStats.number_of_solo_hackers,
        number_of_teams: teamStats.number_of_teams,
        average_team_size: teamStats.average_team_size,
      },
    };

    return analytics;
  }

  // Handle sign-ups by location endpoint
  if (specificEndpoint === "sign-ups-by-location") {
    // Fetch sign-ups by location data
    const [totalRegistrations, signUpsByLocation] = await Promise.all([
      hackathonsRepository.getHackathonTotalRegistrations(hackathonId),
      hackathonsRepository.getSignUpsByLocation(hackathonId),
    ]);

    // Build the sign-ups by location analytics response
    const analytics: SignUpsByLocationAnalytics = {
      overview: {
        sign_ups_by_location_overview: `This hackathon attracted participants from ${signUpsByLocation.length} countries, with a total of ${totalRegistrations} sign-ups. The top participating countries showcase the global reach of this event.`,
        total_countries: signUpsByLocation.length,
        total_signups: totalRegistrations,
        sign_ups_by_country: signUpsByLocation,
      },
    };

    return analytics;
  }

  // Handle most common skills endpoint
  if (specificEndpoint === "most-common-skills") {
    // Fetch most common skills data
    const [totalRegistrations, mostCommonSkills] = await Promise.all([
      hackathonsRepository.getHackathonTotalRegistrations(hackathonId),
      hackathonsRepository.getMostCommonSkills(hackathonId),
    ]);

    // Build the most common skills analytics response
    const analytics: MostCommonSkillsAnalytics = {
      overview: {
        most_common_skills_overview: `This hackathon attracted ${totalRegistrations} participants with diverse skill sets. The most common skills showcase the technical expertise and interests of the participant community.`,
        total_participants: totalRegistrations,
        total_skills: mostCommonSkills.length,
        skills_with_counts_and_percentages: mostCommonSkills,
      },
    };

    return analytics;
  }

  // Handle attrition endpoint
  if (specificEndpoint === "attrition") {
    // Fetch attrition data
    const attritionData = await hackathonsRepository.getAttritionData(hackathonId);

    // Build the attrition analytics response
    const analytics: AttritionAnalytics = {
      overview: {
        attrition_overview: `This hackathon had ${attritionData.number_of_signups} signups, with ${attritionData.participants_who_created_project} participants creating projects. The attrition rate of ${attritionData.attrition_percentage}% shows the engagement level of participants.`,
        attrition_percentage: attritionData.attrition_percentage,
        number_of_signups: attritionData.number_of_signups,
        participants_who_created_project: attritionData.participants_who_created_project,
      },
    };

    return analytics;
  }

  // Default: return general recap analytics
  const [hackathonBasicInfo, challengesCount, projectStats] = await Promise.all([
    hackathonsRepository.getHackathonBasicInfo(hackathonId),
    hackathonsRepository.getHackathonChallengesCount(hackathonId),
    projectsRepository.getHackathonProjectStats(hackathonId),
  ]);

  // Build the general analytics response
  const analytics: HackathonRecapAnalytics = {
    overview: {
      hackathon_start_date: hackathonBasicInfo.start_date,
      hackathon_end_date: hackathonBasicInfo.end_date,
      number_of_challenges: challengesCount,
      total_projects_submitted: projectStats.total_projects_submitted,
      total_project_challenge_pairs: projectStats.total_project_challenge_pairs,
    },
  };

  return analytics;
};
