import { DiscordServiceError } from "@/lib/services/discord/errors";
import { fetchDiscordAnnouncements } from "@/lib/services/discord/fetch-messages";
import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

async function syncFromDiscord(hackathonId: number) {
  try {
    const result = await fetchDiscordAnnouncements({ hackathonId });
    return result.success;
  } catch (error) {
    if (error instanceof DiscordServiceError) {
      console.error("Discord sync failed:", error.message);
    } else {
      console.error("Discord sync failed:", error);
    }
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) {
  const startTime = Date.now();
  let discordSynced = false;

  try {
    const { hackathonId } = await params;
    const supabase = await createAdminClient();

    const { data: hackathon, error: hackathonError } = await supabase
      .from("hackathons")
      .select("id, name")
      .eq("id", parseInt(hackathonId))
      .single();

    if (hackathonError || !hackathon) {
      console.error("Error fetching hackathon:", hackathonError);
      return NextResponse.json(
        { error: "Hackathon not found" },
        { status: 404 }
      );
    }

    const syncSuccess = await syncFromDiscord(parseInt(hackathonId));
    if (syncSuccess) {
      discordSynced = true;
    }

    const { data: announcements, error: dbError } = await supabase
      .from("hackathon_announcements")
      .select("*")
      .eq("hackathon_id", parseInt(hackathonId))
      .eq("is_active", true)
      .order("platform_timestamp", { ascending: false })
      .limit(10);

    if (dbError) {
      console.error("Error fetching announcements from database:", dbError);
      return NextResponse.json(
        { error: "Failed to fetch announcements" },
        { status: 500 }
      );
    }

    const formattedAnnouncements = (announcements || []).map(
      (announcement) => ({
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
      })
    );

    return NextResponse.json({
      success: true,
      announcements: formattedAnnouncements,
      source: discordSynced ? "database+discord" : "database",
      hackathonName: hackathon.name,
      discordSynced,
      responseTime: Date.now() - startTime,
    });
  } catch (error) {
    console.error("Error fetching hackathon announcements:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        responseTime: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
