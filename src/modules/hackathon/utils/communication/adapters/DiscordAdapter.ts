import { createClient } from "@/lib/supabase";
import { DiscordErrorType, DiscordServiceError } from "../discord/errors";
import { DiscordRetryHandler } from "../discord/retryHandler";
import {
  AnnouncementResult,
  ChannelInfo,
  CommunicationSetupResult,
  HackathonDetails,
  PlatformAdapter,
  ValidationResult,
} from "../types";

export class DiscordAdapter implements PlatformAdapter {
  readonly platform = "discord" as const;

  private readonly guildId: string;
  private readonly botToken: string;
  private readonly headers: Record<string, string>;

  constructor() {
    this.guildId = process.env.DISCORD_GUILD_ID!;
    this.botToken = process.env.DISCORD_BOT_TOKEN!;

    if (!this.guildId || !this.botToken) {
      throw new DiscordServiceError(
        DiscordErrorType.INVALID_GUILD,
        "Discord configuration is missing - GUILD_ID or BOT_TOKEN not set",
        false
      );
    }

    this.headers = {
      Authorization: `Bot ${this.botToken}`,
      "Content-Type": "application/json",
    };
  }

  async setupCommunicationSpace(hackathon: HackathonDetails): Promise<CommunicationSetupResult> {
    try {
      const botUserResponse = await DiscordRetryHandler.withRetryForDiscordAPI(() =>
        fetch(`https://discord.com/api/v10/users/@me`, {
          method: "GET",
          headers: this.headers,
        })
      );

      const botUser = await botUserResponse.json();
      if (!botUserResponse.ok) {
        console.error("Failed to get bot user info:", botUser);
        throw new DiscordServiceError(
          DiscordErrorType.PERMISSION_DENIED,
          `Failed to get bot user info: ${botUser.message || botUserResponse.statusText}`,
          false
        );
      }

      const safeId = Date.now();
      const roleResponse = await DiscordRetryHandler.withRetryForDiscordAPI(() =>
        fetch(`https://discord.com/api/v10/guilds/${this.guildId}/roles`, {
          method: "POST",
          headers: this.headers,
          body: JSON.stringify({
            name: `Hackathon-${hackathon.name}-${safeId}-Role`,
            mentionable: true,
          }),
        })
      );

      const role = await roleResponse.json();

      if (!roleResponse.ok) {
        throw new DiscordServiceError(
          DiscordErrorType.PERMISSION_DENIED,
          `Failed to create Discord role: ${role.message || roleResponse.statusText}`,
          false
        );
      }

      const categoryResponse = await DiscordRetryHandler.withRetryForDiscordAPI(() =>
        fetch(`https://discord.com/api/v10/guilds/${this.guildId}/channels`, {
          method: "POST",
          headers: this.headers,
          body: JSON.stringify({
            name: `Hackathon-${hackathon.name}-${safeId}`,
            type: 4,
            permission_overwrites: [
              { id: this.guildId, type: 0, deny: (1 << 10).toString() },
              { id: role.id, type: 0, allow: (1 << 10).toString() },
              { id: botUser.id, type: 1, allow: (1 << 10).toString() },
            ],
          }),
        })
      );

      const category = await categoryResponse.json();

      if (!categoryResponse.ok) {
        const error = new DiscordServiceError(
          DiscordErrorType.PERMISSION_DENIED,
          `Failed to create Discord category: ${category.message || categoryResponse.statusText}`,
          false
        );
        throw error;
      }

      const channelConfigs = [
        { name: "general", type: 0 },
        {
          name: "announcements",
          type: 0,
          permission_overwrites: [
            {
              id: botUser.id, // Bot user ID
              type: 1, // user
              allow: "2048", // SEND_MESSAGES permission
            },
          ],
        },
        { name: "find-a-team", type: 0 },
        { name: "ask-a-mentor", type: 0 },
        { name: "technical-support", type: 0 },
        { name: "judging-questions", type: 0 },
        { name: "submission-help", type: 0 },
      ];

      const createdChannels: ChannelInfo[] = [];

      // Create channels with retry logic
      for (const channelConfig of channelConfigs) {
        try {
          const channelPayload: any = {
            name: channelConfig.name,
            type: channelConfig.type,
            parent_id: category.id,
          };

          // Add permission overwrites if they exist
          if ("permission_overwrites" in channelConfig) {
            channelPayload.permission_overwrites = channelConfig.permission_overwrites;
          }

          const channelResponse = await DiscordRetryHandler.withRetryForDiscordAPI(() =>
            fetch(`https://discord.com/api/v10/guilds/${this.guildId}/channels`, {
              method: "POST",
              headers: this.headers,
              body: JSON.stringify(channelPayload),
            })
          );

          const createdChannel = await channelResponse.json();

          if (!channelResponse.ok) {
            console.error(`Error creating channel ${channelConfig.name}:`, createdChannel);
            continue;
          }

          createdChannels.push({
            id: createdChannel.id,
            name: createdChannel.name,
            type: createdChannel.type,
          });
        } catch (error) {
          console.error(`Error creating channel ${channelConfig.name}:`, error);
        }
      }

      // Create invite link
      let inviteUrl: string | undefined;
      const generalChannel = createdChannels.find((ch) => ch.name === "general");

      if (generalChannel) {
        try {
          const inviteResponse = await DiscordRetryHandler.withRetryForDiscordAPI(() =>
            fetch(`https://discord.com/api/v10/channels/${generalChannel.id}/invites`, {
              method: "POST",
              headers: this.headers,
              body: JSON.stringify({
                max_age: 0, // Never expires
                max_uses: 0, // Unlimited uses
                temporary: false,
                unique: true,
              }),
            })
          );

          if (inviteResponse.ok) {
            const invite = await inviteResponse.json();
            inviteUrl = `https://discord.gg/${invite.code}`;
            console.log("Invite created:", inviteUrl);

            const supabase = await createClient();
            await supabase.from("discord_invites").insert({
              hackathon_id: hackathon.id,
              role_id: role.id,
              invite_code: invite.code,
              guild_id: this.guildId,
            });
          } else {
            console.error("Failed to create invite:", await inviteResponse.text());
          }
        } catch (error) {
          console.error("Error creating invite:", error);
        }
      }

      const announcementsChannel = createdChannels.find((ch) => ch.name === "announcements");

      const setupResult: CommunicationSetupResult = {
        success: true,
        channels: createdChannels,
        inviteLink: inviteUrl,
        metadata: {
          guild_id: this.guildId,
          category_id: category.id,
          category_name: category.name,
          channels: createdChannels.map((ch) => ({
            id: ch.id,
            name: ch.name,
            type: ch.type,
          })),
          invite_channel_id: generalChannel?.id || null,
          announcements_channel_id: announcementsChannel?.id || null,
        },
      };

      return setupResult;
    } catch (error) {
      if (error instanceof DiscordServiceError) {
        return {
          success: false,
          channels: [],
          metadata: {},
          error: error.message,
        };
      }

      throw error;
    }
  }

  async fetchAnnouncements(linkId: string): Promise<AnnouncementResult[]> {
    // This method would be implemented to fetch announcements for a specific link
    // For now, it's a placeholder since the main implementation is in the API route
    throw new Error(
      "fetchAnnouncements should be called via API route for proper database integration"
    );
  }

  async validateConfiguration(metadata: Record<string, any>): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required Discord metadata
    if (!metadata.guild_id) {
      errors.push("Missing guild_id in metadata");
    }

    if (!metadata.announcements_channel_id) {
      warnings.push("No announcements channel ID specified");
    }

    if (!metadata.channels || !Array.isArray(metadata.channels)) {
      errors.push("Invalid or missing channels array in metadata");
    }

    // Validate channel structure
    if (metadata.channels && Array.isArray(metadata.channels)) {
      metadata.channels.forEach((channel: any, index: number) => {
        if (!channel.id) {
          errors.push(`Channel at index ${index} missing required 'id' field`);
        }
        if (!channel.name) {
          errors.push(`Channel at index ${index} missing required 'name' field`);
        }
        if (typeof channel.type !== "number") {
          errors.push(`Channel at index ${index} missing or invalid 'type' field`);
        }
      });
    }

    // Validate invite link format if present
    if (metadata.invite_link && typeof metadata.invite_link === "string") {
      if (!metadata.invite_link.match(/^https:\/\/discord\.gg\/[a-zA-Z0-9]+$/)) {
        errors.push("Invalid Discord invite link format");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
