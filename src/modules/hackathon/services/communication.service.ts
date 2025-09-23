import { createClient } from "@/lib/supabase";
import { CommunicationRepository } from "../repositories/communication.repository";
import { 
  HackathonCommunicationLinksParams,
  HackathonCommunicationLinksResponse,
  HackathonAnnouncementsParams,
  HackathonAnnouncementsResponse
} from "../types";

export const getCommunicationLinksService = async (
  params: HackathonCommunicationLinksParams
): Promise<HackathonCommunicationLinksResponse> => {
  const supabase = await createClient();
  const communicationRepository = new CommunicationRepository(supabase);
  
  const links = await communicationRepository.getCommunicationLinks(params.hackathon_id);
  
  return {
    links,
  };
};

export const getAnnouncementsService = async (
  params: HackathonAnnouncementsParams
): Promise<HackathonAnnouncementsResponse> => {
  const supabase = await createClient();
  const communicationRepository = new CommunicationRepository(supabase);
  
  const announcements = await communicationRepository.getAnnouncements(params.hackathon_id);
  
  const formattedAnnouncements = announcements.map((announcement) => ({
    id: announcement.platform_message_id,
    content: announcement.content,
    timestamp: announcement.platform_timestamp,
    platform: announcement.platform_type,
    author: {
      username: announcement.author_username,
      avatar: announcement.author_avatar,
    },
    truncatedContent:
      announcement.content.length > 456
        ? announcement.content.substring(0, 456) + "..."
        : announcement.content,
  }));
  
  return {
    announcements: formattedAnnouncements,
  };
};