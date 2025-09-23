import { createClient } from "@/lib/supabase";
import { DiscordErrorType, DiscordServiceError } from "./errors";

export interface FetchAnnouncementsOptions {
  hackathonId: number;
  limit?: number;
}

export interface DiscordAnnouncement {
  id: string;
  content: string;
  timestamp: string;
  author: {
    username: string;
    avatar: string;
  };
  truncatedContent: string;
}

export interface FetchAnnouncementsResult {
  success: boolean;
  announcements: DiscordAnnouncement[];
  channelId?: string;
  guildId?: string;
  hackathonName?: string;
  channelSource?: "stored" | "fallback";
  communicationLinkId?: number | null;
  platformType: "discord";
  syncedCount: number;
  message?: string;
  suggestion?: string;
}

export async function fetchDiscordAnnouncements({
  hackathonId,
  limit = 10,
}: FetchAnnouncementsOptions): Promise<FetchAnnouncementsResult> {
  const GUILD_ID = process.env.DISCORD_GUILD_ID;
  const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

  if (!GUILD_ID || !BOT_TOKEN) {
    throw new DiscordServiceError(
      DiscordErrorType.INVALID_GUILD,
      "Discord configuration is missing - GUILD_ID or BOT_TOKEN not set",
      false
    );
  }

  const headers = {
    Authorization: `Bot ${BOT_TOKEN}`,
    "Content-Type": "application/json",
  };

  const adminSupabase = await createClient({
    isAdmin: true,
  });

  // Get hackathon and its Discord communication links
  const { data: hackathon, error: hackathonError } = await adminSupabase
    .from("hackathons")
    .select("id, name")
    .eq("id", hackathonId)
    .single();

  if (hackathonError || !hackathon) {
    throw new Error("Hackathon not found");
  }

  const { data: discordLink, error: linksError } = await adminSupabase
    .from("hackathon_communication_links")
    .select("id, channel_id")
    .eq("hackathon_id", hackathonId)
    .eq("platform_type", "discord")
    .eq("is_active", true)
    .eq("is_primary", true)
    .single();

  if (linksError) {
    throw new Error("Failed to fetch Discord configuration");
  }

  if (!discordLink) {
    throw new Error("No Discord communication link found for this hackathon");
  }

  const announcementsChannelId = discordLink.channel_id;

  const messagesResponse = await fetch(
    `https://discord.com/api/v10/channels/${announcementsChannelId}/messages?limit=${limit}`,
    { headers }
  );

  if (!messagesResponse.ok) {
    const errorText = await messagesResponse.text();
    const errorType =
      messagesResponse.status === 404
        ? DiscordErrorType.INVALID_CHANNEL
        : DiscordErrorType.PERMISSION_DENIED;

    if (messagesResponse.status === 404) {
      return {
        success: true,
        announcements: [],
        message: "Discord channel not found or bot lacks access",
        suggestion: "Verify the Discord channel exists and the bot has read permissions",
        platformType: "discord",
        syncedCount: 0,
        channelId: announcementsChannelId!,
        guildId: GUILD_ID,
        hackathonName: hackathon.name,
        channelSource: "stored",
        communicationLinkId: discordLink.id,
      };
    }

    throw new DiscordServiceError(
      errorType,
      `Failed to fetch Discord messages: ${messagesResponse.status} ${errorText}`,
      false
    );
  }

  const messages = await messagesResponse.json();

  const validMessages = messages.filter(
    (message: any) => message.content && message.content.trim().length > 0
  );

  // Sync messages to database
  const syncPromises = validMessages.map(async (message: any) => {
    try {
      const { error } = await adminSupabase.from("hackathon_announcements").upsert(
        {
          hackathon_id: hackathonId,
          communication_link_id: discordLink.id,
          platform_type: "discord",
          platform_message_id: message.id,
          platform_channel_id: announcementsChannelId,
          content: message.content,
          author_username: message.author.username,
          author_avatar: message.author.avatar,
          platform_timestamp: message.timestamp,
        },
        {
          onConflict: "hackathon_id,platform_message_id,platform_type",
          ignoreDuplicates: false,
        }
      );

      if (error) {
        console.error("Error syncing message to database:", error, "Message ID:", message.id);
      }
    } catch (syncError) {
      console.error("Error during message sync:", syncError);
    }
  });

  await Promise.allSettled(syncPromises);

  const formattedAnnouncements: DiscordAnnouncement[] = validMessages.map((message: any) => ({
    id: message.id,
    content: message.content,
    timestamp: message.timestamp,
    author: {
      username: message.author.username,
      avatar: message.author.avatar,
    },
    truncatedContent:
      message.content.length > 456 ? message.content.substring(0, 456) + "..." : message.content,
  }));

  return {
    success: true,
    announcements: formattedAnnouncements,
    channelId: announcementsChannelId!,
    guildId: GUILD_ID,
    hackathonName: hackathon.name,
    channelSource: "stored",
    communicationLinkId: discordLink.id,
    platformType: "discord",
    syncedCount: validMessages.length,
  };
}
