import { createClient } from "@/lib/supabase";
import { HackathonsRepository } from "@/modules/hackathon/repositories/hackathons.repository";
import { EngagementFunnelAnalytics } from "../types/engagement-funnel.types";
import { EngagementPartnersAnalytics } from "../types/engagement-partners.types";
import { RoleBreakdownAnalytics } from "../types/role-breakdown.types";

export const getHackathonRecapEngagementPartnersService = async (
  technologyOwnerId: number,
  hackathonId: number
): Promise<EngagementPartnersAnalytics> => {
  const supabase = await createClient();

  const hackathonsRepository = new HackathonsRepository(supabase);

  // Validate that the hackathon belongs to the technology owner
  const hackathon = await hackathonsRepository.findById(hackathonId);
  if (!hackathon) {
    throw new Error("Hackathon not found");
  }

  if (hackathon.organizer_id !== technologyOwnerId) {
    throw new Error("Hackathon does not belong to the specified technology owner");
  }

  const sponsors = await hackathonsRepository.getHackathonSponsors(hackathonId);

  const analytics: EngagementPartnersAnalytics = {
    overview: {
      sponsors: sponsors,
    },
  };

  return analytics;
};

export const getHackathonRecapRoleBreakdownService = async (
  technologyOwnerId: number,
  hackathonId: number
): Promise<RoleBreakdownAnalytics> => {
  const supabase = await createClient();

  const hackathonsRepository = new HackathonsRepository(supabase);

  // Validate that the hackathon belongs to the technology owner
  const hackathon = await hackathonsRepository.findById(hackathonId);
  if (!hackathon) {
    throw new Error("Hackathon not found");
  }

  if (hackathon.organizer_id !== technologyOwnerId) {
    throw new Error("Hackathon does not belong to the specified technology owner");
  }

  const roleBreakdown = await hackathonsRepository.getHackathonRoleBreakdown(hackathonId);

  const analytics: RoleBreakdownAnalytics = {
    role_breakdown: roleBreakdown,
  };

  return analytics;
};

export const getHackathonRecapEngagementFunnelService = async (
  technologyOwnerId: number,
  hackathonId: number
): Promise<EngagementFunnelAnalytics> => {
  const supabase = await createClient();

  const hackathonsRepository = new HackathonsRepository(supabase);

  // Validate that the hackathon belongs to the technology owner
  const hackathon = await hackathonsRepository.findById(hackathonId);
  if (!hackathon) {
    throw new Error("Hackathon not found");
  }

  if (hackathon.organizer_id !== technologyOwnerId) {
    throw new Error("Hackathon does not belong to the specified technology owner");
  }

  const funnel = await hackathonsRepository.getHackathonEngagementFunnel(hackathonId);

  const analytics: EngagementFunnelAnalytics = {
    funnel: funnel,
  };

  return analytics;
};
