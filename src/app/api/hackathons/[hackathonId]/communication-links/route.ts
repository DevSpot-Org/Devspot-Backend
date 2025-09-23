import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { hackathonId: string } }) {
  try {
    const { hackathonId } = await params;
    const url = new URL(request.url);
    const platformType = url.searchParams.get("platform_type");
    const isActive = url.searchParams.get("is_active");

    const supabase = await createClient();

    // Check if hackathon exists
    const { data: hackathon, error: hackathonError } = await supabase
      .from("hackathons")
      .select("id, name")
      .eq("id", parseInt(hackathonId))
      .single();

    if (hackathonError || !hackathon) {
      console.error("Error fetching hackathon:", hackathonError);
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 });
    }

    // Build query
    let query = supabase
      .from("hackathon_communication_links")
      .select("*")
      .eq("hackathon_id", parseInt(hackathonId))
      .order("created_at", { ascending: false });

    // Apply filters
    if (platformType) {
      query = query.eq("platform_type", platformType);
    }

    if (isActive !== null) {
      query = query.eq("is_active", isActive === "true");
    }

    const { data: communicationLinks, error: linksError } = await query;

    if (linksError) {
      console.error("Error fetching communication links:", linksError);
      return NextResponse.json({ error: "Failed to fetch communication links" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      links: communicationLinks || [],
      hackathonName: hackathon.name,
      totalCount: communicationLinks?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching communication links:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { hackathonId: string } }) {
  try {
    const { hackathonId } = params;
    const body = await request.json();

    const {
      platform_type,
      link_url,
      channel_id,
      channel_name,
      is_primary = false,
      metadata = {},
    } = body;

    // Validate required fields
    if (!platform_type || !link_url) {
      return NextResponse.json(
        { error: "platform_type and link_url are required" },
        { status: 400 }
      );
    }

    // Validate platform type
    const validPlatforms = ["discord", "slack", "telegram", "teams", "other"];
    if (!validPlatforms.includes(platform_type)) {
      return NextResponse.json(
        { error: `Invalid platform_type. Must be one of: ${validPlatforms.join(", ")}` },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if hackathon exists
    const { data: hackathon, error: hackathonError } = await supabase
      .from("hackathons")
      .select("id")
      .eq("id", parseInt(hackathonId))
      .single();

    if (hackathonError || !hackathon) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 });
    }

    // If setting as primary, unset other primary links for this platform
    if (is_primary) {
      await supabase
        .from("hackathon_communication_links")
        .update({ is_primary: false })
        .eq("hackathon_id", parseInt(hackathonId))
        .eq("platform_type", platform_type);
    }

    // Create the communication link
    const { data: newLink, error: createError } = await supabase
      .from("hackathon_communication_links")
      .insert({
        hackathon_id: parseInt(hackathonId),
        platform_type,
        link_url,
        channel_id,
        channel_name,
        is_primary,
        metadata,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating communication link:", createError);
      return NextResponse.json({ error: "Failed to create communication link" }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        link: newLink,
        message: "Communication link created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating communication link:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
