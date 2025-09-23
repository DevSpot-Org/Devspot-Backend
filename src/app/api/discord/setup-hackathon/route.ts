import { createClient } from "@/lib/supabase";
import {
  DiscordErrorType,
  DiscordServiceError,
} from "@/modules/hackathon/utils/communication/discord/errors";
import { PlatformRegistry } from "@/modules/hackathon/utils/communication/registry";
import { HackathonDetails } from "@/modules/hackathon/utils/communication/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { name, hackathonId } = body;

    if (!name || !hackathonId) {
      return NextResponse.json(
        { error: "Missing required fields: name and hackathonId" },
        { status: 400 }
      );
    }

    const discordAdapter = PlatformRegistry.get("discord");
    if (!discordAdapter) {
      const error = new DiscordServiceError(
        DiscordErrorType.INVALID_GUILD,
        "Discord adapter not available - check configuration",
        false
      );

      return NextResponse.json(
        {
          error: error.message,
          errorType: error.type,
          retryable: error.retryable,
        },
        { status: 500 }
      );
    }

    const hackathonDetails: HackathonDetails = {
      id: parseInt(hackathonId),
      name: name,
    };

    const setupResult = await discordAdapter.setupCommunicationSpace(hackathonDetails);

    if (!setupResult.success) {
      return NextResponse.json(
        {
          error: setupResult.error || "Failed to setup Discord communication space",
          setupResult,
          responseTime: Date.now() - startTime,
        },
        { status: 500 }
      );
    }

    if (setupResult.inviteLink && hackathonId) {
      try {
        const supabase = await createClient();

        const announcementsChannel = setupResult.channels.find((ch) => ch.name === "announcements");
        const generalChannel = setupResult.channels.find((ch) => ch.name === "general");

        const communicationLinkData = {
          hackathon_id: parseInt(hackathonId),
          platform_type: "discord" as const,
          link_url: setupResult.inviteLink,
          channel_id: announcementsChannel?.id || null,
          channel_name: announcementsChannel?.name || null,
          is_primary: true,
          is_active: true,
          metadata: {
            ...setupResult.metadata,
            error_config: {
              max_retries: 3,
              retry_delay_ms: 1000,
              last_sync_error: null,
              consecutive_failures: 0,
            },
            sync_health: {
              last_successful_sync: null,
              total_syncs: 0,
              failed_syncs: 0,
              health_status: "healthy",
            },
          },
        };

        const { data: communicationLink, error: linkError } = await supabase
          .from("hackathon_communication_links")
          .insert(communicationLinkData)
          .select()
          .single();

        if (linkError) {
          console.error("Error creating communication link:", linkError);
          return NextResponse.json({ error: "Failed to save communication link" }, { status: 500 });
        }

        const { error: updateError } = await supabase
          .from("hackathons")
          .update({ communication_link: setupResult.inviteLink })
          .eq("id", parseInt(hackathonId));

        if (updateError) {
          console.error("Error updating hackathon communication link (legacy):", updateError);
        }
      } catch (error) {
        console.error("Error creating communication link:", error);
        return NextResponse.json(
          {
            error: "Failed to create communication link",
            setupResult,
            responseTime: Date.now() - startTime,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      channels: setupResult.channels,
      channelsCreated: setupResult.channels.length,
      inviteUrl: setupResult.inviteLink,
      metadata: setupResult.metadata,
      serverName: `${name} Hackathon`,
      platformType: "discord",
      responseTime: Date.now() - startTime,
    });
  } catch (error) {
    console.error("Error creating Discord setup:", error);

    if (error instanceof DiscordServiceError) {
      return NextResponse.json(
        {
          error: error.message,
          errorType: error.type,
          retryable: error.retryable,
          responseTime: Date.now() - startTime,
        },
        {
          status: error.type === DiscordErrorType.INVALID_GUILD ? 500 : 400,
        }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        responseTime: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
