import { SupabaseClient } from "@/lib/supabase";
import {
  HackathonApplicationAnswers,
  HackathonApplicationQuestions,
  HackathonChallenges,
  HackathonParticipants,
  Hackathons,
  Projects,
} from "@/types/entities";
import ApiBaseService from "@/utils/baseService";
import { QueryModifierOptions } from "@/utils/query-helpers";
import { TokenService } from "@/utils/tokenService";
import { Novu } from "@novu/api";
import { Sponsor } from "../types";

interface GetHackathonQuery extends QueryModifierOptions {
  tags: string;
  technologies: string;
}

interface HackathonLeaderboardOptions {
  comments: boolean;
  score: boolean;
  sortBy?: "standing" | "score" | "challenge";
}

type ChallengeFeedback = {
  challenge_id: number;
  docs_rating: number;
  overall_rating: number;
  support_rating: number;
  challenge_recommendation_rating: number;
  comments?: string | null;
};

type HackathonFeedback = {
  question1_rating: number;
  question2_rating: number;
  question3_rating: number;
  question4_rating: number;
  comments?: string | null;
};

type FeedbackPayload = {
  challengeFeedbacks: ChallengeFeedback[];
  hackathonFeedback: HackathonFeedback;
};

// Get Hackathon Overview
class ReadHackathonService extends ApiBaseService {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async create_hackathon({
    name,
    type,
    applicationMethod,
    subdomain,
    organizerId,
  }: {
    name: string;
    type: "virtual" | "physical" | "hybrid";
    applicationMethod: string;
    subdomain: string;
    organizerId: number;
  }) {
    const { data: organizer, error: organizerError } = await this.supabase
      .from("technology_owners")
      .select("id")
      .eq("id", organizerId)
      .single();

    if (organizerError || !organizer) {
      throw new Error(`Invalid organizer ID: ${organizerId}`);
    }

    let finalSubdomain = subdomain;
    let counter = 1;

    while (true) {
      const { data: existing, error: subdomainError } = await this.supabase
        .from("hackathons")
        .select("id")
        .eq("subdomain", finalSubdomain)
        .single();

      if (subdomainError?.code === "PGRST116" || !existing) {
        break; // Subdomain is unique
      }

      finalSubdomain = `${subdomain}-${counter}`;
      counter++;
    }

    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + 7);

    const { data: hackathon, error: createError } = await this.supabase
      .from("hackathons")
      .insert({
        name: name || "Untitled Hackathon",
        type,
        // application_method: applicationMethod || "join",
        application_method: (applicationMethod as any) || "join",
        subdomain: finalSubdomain,
        organizer_id: organizerId,
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        allow_multiple_teams: false,
        show_leaderboard_comments: true,
        show_leaderboard_score: true,
        use_judge_bot: false,
        leaderboard_standing_by: "standing",
        sponsors: [],
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create hackathon: ${createError.message}`);
    }

    return hackathon;
  }

  async leave_hackathon(user_id: string, hackathon_id: number) {
    const { data: participations, error: participationsError } = await this.supabase
      .from("hackathon_participants")
      .delete()
      .eq("participant_id", user_id)
      .eq("hackathon_id", hackathon_id)
      .select("hackathon_id");

    if (participationsError) {
      throw new Error(`Error removing participant: ${participationsError.message}`);
    }

    const { data: teamMemberships, error: teamError } = await this.supabase
      .from("project_team_members")
      .select("*, projects!inner(*)")
      .eq("user_id", user_id)
      .eq("projects.hackathon_id", hackathon_id);

    if (teamError) {
      throw new Error(`Error fetching team memberships: ${teamError.message}`);
    }

    for (const membership of teamMemberships || []) {
      const projectId = membership.project_id;

      if (membership.is_project_manager) {
        const { data: nextManager, error: nextManagerError } = await this.supabase
          .from("project_team_members")
          .select("*")
          .eq("project_id", projectId)
          .neq("user_id", user_id)
          .eq("status", "confirmed")
          .order("created_at", { ascending: true })
          .maybeSingle();

        if (nextManagerError) {
          throw new Error(`Error finding next team member: ${nextManagerError.message}`);
        }

        if (nextManager) {
          const { error: updateManagerError } = await this.supabase
            .from("project_team_members")
            .update({ is_project_manager: true })
            .eq("id", nextManager.id);

          if (updateManagerError) {
            throw new Error(`Error updating project manager: ${updateManagerError.message}`);
          }
        } else {
          const { error: deleteProjectError } = await this.supabase
            .from("projects")
            .delete()
            .eq("id", projectId);

          if (deleteProjectError) {
            throw new Error(`Error deleting project: ${deleteProjectError.message}`);
          }
        }
      }

      const { error: removeMemberError } = await this.supabase
        .from("project_team_members")
        .delete()
        .eq("id", membership.id);

      if (removeMemberError) {
        throw new Error(`Error removing user from project: ${removeMemberError.message}`);
      }
    }

    return participations;
  }

  /**
   * Get all hackathons with pagination, filtering, and sorting
   *
   * @param options Query modifier options for filtering, sorting, and pagination
   * @returns Array of hackathons matching the criteria
   */
  async get_all_hackathons(options?: Partial<GetHackathonQuery>, participant_id?: string) {
    const query = () => {
      let baseQuery = this.supabase
        .from("hackathons")
        .select("*, organizer:technology_owners(*), participants:hackathon_participants(count)")
        .neq("status", "draft");

      let countQuery = this.supabase
        .from("hackathons")
        .select("id", { count: "exact" })
        .neq("status", "draft");

      if (options?.tags) {
        baseQuery = baseQuery.contains("tags", [options.tags]);
        countQuery = countQuery.contains("tags", [options.tags]);
      }

      if (options?.technologies) {
        baseQuery = baseQuery.contains("technologies", [options.technologies]);
        countQuery = countQuery.contains("technologies", [options.technologies]);
      }

      return { baseQuery, countQuery };
    };
    const item = query();

    const paginatedData = await this.fetch_paginated_data<Hackathons>(
      item.baseQuery,
      options,
      item.countQuery
    );
    let applicationStatuses: Record<number, string | null> = {};
    const hackathonIds = paginatedData.items.map((item) => item.id);

    if (participant_id) {
      const { data: participantData, error: participant_error } = await this.supabase
        .from("hackathon_participants")
        .select("hackathon_id, application_status")
        .in("hackathon_id", hackathonIds)
        .eq("participant_id", participant_id);

      if (participant_error) {
        throw new Error(
          `Error fetching participant application statuses: ${participant_error.message}`
        );
      }

      // Create a map of hackathon_id to application_status
      applicationStatuses = (participantData || []).reduce(
        (acc, curr) => {
          acc[curr.hackathon_id] = curr.application_status;
          return acc;
        },
        {} as Record<number, string | null>
      );
    }

    const mapped = paginatedData.items.map((hackathon: any) => {
      return {
        ...hackathon,
        number_of_participants: hackathon?.participants?.[0]?.count ?? 0,
        application_status: applicationStatuses[hackathon.id] || null,
      };
    });
    return {
      ...paginatedData,
      items: mapped,
    };
  }

  /**
   * Get a single hackathon by ID with its related information
   *
   * @param hackathonId The ID of the hackathon to retrieve
   * @param includeRelations Optional array specifying which related data to include
   * @returns The hackathon with requested related data
   */
  async get_hackathon_by_id(hackathonId: number, participant_id?: string) {
    const { data: hackathon, error } = await this.supabase
      .from("hackathons")
      .select("*, organizer:technology_owners(name, logo)")
      .eq("id", hackathonId)
      .maybeSingle();

    if (error) {
      throw new Error(`Error fetching hackathon with ID ${hackathonId}: ${error.message}`);
    }

    if (!hackathon) {
      throw new Error(`Hackathon with ID ${hackathonId} not found`);
    }

    let application_status = null;
    if (participant_id) {
      const { data: participantData, error: participant_error } = await this.supabase
        .from("hackathon_participants")
        .select("application_status")
        .eq("hackathon_id", hackathonId)
        .eq("participant_id", participant_id)
        .single();

      if (participant_error && participant_error.code !== "PGRST116") {
        // PGRST116: No rows found - we consider that as a valid case
        throw new Error(
          `Error fetching participant application status: ${participant_error.message}`
        );
      }
      application_status = participantData ? participantData.application_status : null;
    }

    const { data: allParticipants } = await this.supabase
      .from("hackathon_participants")
      .select("id")
      .eq("hackathon_id", hackathonId)
      .eq("application_status", "accepted");

    const allParticipantsCount = allParticipants?.length ?? 0;

    let acceptingParticipants = false;

    if (hackathon.participants_limit == null) {
      acceptingParticipants = true;
    } else if (
      allParticipantsCount < hackathon.participants_limit &&
      hackathon.accepting_participants === true
    ) {
      acceptingParticipants = true;
    }

    const relations: Record<string, any> = {};

    const { data: questions, error: questions_error } = await this.supabase
      .from("hackathon_application_questions")
      .select("*)")
      .eq("hackathon_id", hackathonId);

    if (questions_error) {
      throw new Error(`Error fetching Questions: ${questions_error?.message}`);
    }

    relations.questions = questions || [];

    return {
      ...hackathon,
      application_status,
      accepting_participants: acceptingParticipants,
      ...relations,
    };
  }

  async update_hackathon_participant_membership(
    hackathon_id: number,
    participant_id: string,
    status: boolean
  ) {
    const { error } = await this.supabase
      .from("hackathon_participants")
      .update({ looking_for_teammates: status })
      .eq("participant_id", participant_id)
      .eq("hackathon_id", hackathon_id)
      .single();

    if (error) {
      throw new Error(
        `Error updating participant profile for participant id ${participant_id}: ${error.message}`
      );
    }

    return null;
  }

  /**
   * Get a single hackathon by ID with its related information
   *
   * @param hackathonId The ID of the hackathon to retrieve
   * @param includeRelations Optional array specifying which related data to include
   * @returns The hackathon with requested related data
   */
  async get_hackathon_by_id_overview(hackathonId: number, participant_id?: string) {
    const { data: hackathon, error } = await this.supabase
      .from("hackathons")
      .select("*, participants:hackathon_participants(count)")
      .eq("id", hackathonId)
      .single();

    if (error) {
      throw new Error(`Error fetching hackathon with ID ${hackathonId}: ${error.message}`);
    }

    if (!hackathon) {
      throw new Error(`Hackathon with ID ${hackathonId} not found`);
    }

    // Initialize relations object
    const relations: Record<string, any> = {};

    const nowIso = new Date().toISOString();

    const { data: session, error: sessionError } = await this.supabase
      .from("hackathon_sessions")
      .select("*")
      .eq("hackathon_id", hackathonId)
      .gt("start_time", nowIso)
      .order("start_time", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (sessionError) {
      throw new Error(`Error fetching upcoming session: ${sessionError.message}`);
    }
    relations.upcomingSession = session ?? undefined;

    const { data: resources, error: resources_error } = await this.supabase
      .from("hackathon_resources")
      .select("*, challenges:hackathon_resource_challenges(*)")
      .eq("hackathon_id", hackathonId);

    if (resources_error) {
      throw new Error(`Error fetching Resources: ${resources_error?.message}`);
    }

    relations.resources = resources || [];

    const { data: vips, error: vips_error } = await this.supabase
      .from("hackathon_vips")
      .select("*, users(*)")
      .eq("hackathon_id", hackathonId)
      .limit(3);

    if (vips_error) {
      throw new Error(`Error fetching VIPs: ${vips_error.message}`);
    }

    relations.vips = vips || [];

    // Get project counts
    const { count: totalProjectsCount, error: projectsError } = await this.supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("hackathon_id", hackathonId);

    if (projectsError) {
      throw new Error(`Error fetching project count: ${projectsError.message}`);
    }

    const { count: submittedProjectsCount, error: submittedProjectsError } = await this.supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("hackathon_id", hackathonId)
      .eq("submitted", true);

    if (submittedProjectsError) {
      throw new Error(`Error fetching submitted project count: ${submittedProjectsError.message}`);
    }

    relations.projectCounts = {
      total: totalProjectsCount || 0,
      submitted: submittedProjectsCount || 0,
    };

    let application_status = null;
    let looking_for_teammates = false;
    if (participant_id) {
      const { data: participantData, error: participant_error } = await this.supabase
        .from("hackathon_participants")
        .select("application_status, looking_for_teammates")
        .eq("hackathon_id", hackathonId)
        .eq("participant_id", participant_id)
        .single();

      if (participant_error && participant_error.code !== "PGRST116") {
        // PGRST116: No rows found - we consider that as a valid case
        throw new Error(
          `Error fetching participant application status: ${participant_error.message}`
        );
      }
      looking_for_teammates = participantData?.looking_for_teammates ?? false;
      application_status = participantData ? participantData.application_status : null;
    }

    return {
      ...hackathon,
      ...relations,
      application_status,
      number_of_participants: hackathon?.participants?.[0]?.count ?? 0,
      looking_for_teammates,
    };
  }

  /**
   * Get all hackathons that a user is participating in
   *
   * @param userId The ID of the user
   * @param options Query modifier options for filtering, sorting, and pagination
   * @returns Array of hackathons the user is participating in
   */
  async get_hackathons_by_participant(user_id: string, options?: Partial<QueryModifierOptions>) {
    const { data: user_hackathons, error: participations_error } = await this.supabase
      .from("hackathon_participants")
      .select("hackathon_id")
      .eq("participant_id", user_id);

    if (participations_error) {
      throw new Error(
        `Error fetching participations for user ${user_id}: ${participations_error.message}`
      );
    }

    if (!user_hackathons || user_hackathons.length === 0) {
      return {
        items: [],
        pageNumber: 1,
        totalPages: 0,
        totalItems: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      };
    }

    const hackathonIds = user_hackathons.map((p) => p.hackathon_id);

    const query = this.supabase.from("hackathons").select("*").in("id", hackathonIds);

    const paginatedData = await this.fetch_paginated_data<{ id: number }>(
      query,
      options // Pass the filter in the options
    );

    // const paginatedData = await this.fetch_paginated_data<Hackathons>(
    //   query,
    //   options
    // );

    return paginatedData;
  }

  /**
   * Get all hackathons a user is involved with as a VIP (judge, mentor, etc.)
   *
   * @param userId The ID of the user
   * @param options Query modifier options for filtering, sorting, and pagination
   * @returns Array of hackathons where the user is a VIP
   */
  async get_hackathons_by_vip(userId: string, options?: Partial<QueryModifierOptions>) {
    const { data: vipRoles, error: vipError } = await this.supabase
      .from("hackathon_vips")
      .select("hackathon_id")
      .eq("user_id", userId);

    if (vipError) {
      throw new Error(`Error fetching VIP roles for user ${userId}: ${vipError.message}`);
    }

    if (!vipRoles || vipRoles.length === 0) {
      return {
        items: [],
        pageNumber: 1,
        totalPages: 0,
        totalItems: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      };
    }

    const hackathonIds = vipRoles.map((v) => v.hackathon_id);

    const query = this.supabase.from("hackathons").select("*").in("id", hackathonIds);

    const paginatedData = await this.fetch_paginated_data<Hackathons>(query, options);

    return paginatedData;
  }

  /**
   * Search hackathons by name or description
   *
   * @param searchTerm The search term to look for
   * @param options Query modifier options for filtering, sorting, and pagination
   * @returns Array of hackathons matching the search term
   */
  async search_hackathons(searchTerm: string, options?: Partial<QueryModifierOptions>) {
    const query = this.supabase
      .from("hackathons")
      .select("*", { count: "exact" })
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

    const paginatedData = await this.fetch_paginated_data<Hackathons>(query, options);

    return paginatedData;
  }

  /**
   * Get a Hackathon Schedule
   *
   * @param hackathonId The ID of the hackathon
   * @param options Query modifier options for filtering, sorting, and pagination
   */
  async get_hackathon_schedule(hackathon_id: number, user_id?: string) {
    const { data, error } = await this.supabase
      .from("hackathon_sessions")
      .select("*")
      .eq("hackathon_id", hackathon_id);

    if (error) {
      throw new Error(`Error fetching sessions for hackathon ${hackathon_id}: ${error.message}`);
    }

    if (!data || !data.length) return [];

    const now = new Date();

    let upcomingSessionId: number | null = null;
    if (data.length > 0) {
      data.sort((a, b) => {
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
      });

      const upcomingSession = data.find((session) => new Date(session.start_time) > now);
      upcomingSessionId = upcomingSession?.id ?? null;
    }

    let rsvpSessionIds: number[] = [];
    if (user_id) {
      const { data: rsvps, error: rsvpError } = await this.supabase
        .from("hackathon_user_session_rsvp")
        .select("session_id")
        .eq("participant_id", user_id)
        .eq("status", true);

      if (rsvpError) {
        throw new Error(`Error fetching RSVPs for user ${user_id}: ${rsvpError.message}`);
      }

      rsvpSessionIds = rsvps?.map((r) => r.session_id) || [];
    }

    const result = data.map((session) => ({
      ...session,
      upcoming: session.id === upcomingSessionId,
      rsvpd: user_id ? rsvpSessionIds.includes(session.id) : false,
    }));

    return result;
  }

  async rsvp_hackathon_schedule(session_id: number, user_id: string, status: boolean) {
    console.log(status);
    const { data, error } = await this.supabase
      .from("hackathon_user_session_rsvp")
      .upsert(
        {
          session_id,
          participant_id: user_id,
          status,
        },
        { onConflict: "session_id,participant_id" }
      )
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to RSVP for Session: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all challenges for a hackathon
   *
   * @param hackathonId The ID of the hackathon
   * @param options Query modifier options for filtering, sorting, and pagination
   * @returns Array of challenges for the specified hackathon
   */
  async get_hackathon_challenges(hackathonId: number, options?: Partial<QueryModifierOptions>) {
    const query = this.supabase
      .from("hackathon_challenges")
      .select(
        `
            *,
            prizes:hackathon_challenge_bounties (*)
          `
      )
      .eq("hackathon_id", hackathonId)
      .eq("is_round_2_only", false)
      .order("created_at", { ascending: true });

    const paginatedData = await this.fetch_paginated_data<HackathonChallenges>(query, options);

    const resolved = await Promise.all(
      paginatedData?.items.map(async (item) => {
        const { data: judges } = await this.supabase

          .from("judgings")
          .select(
            `
              id,
              user_id,
              judging_challenges (
                id,
                challenge_id
              )
            `
          )
          .eq("hackathon_id", hackathonId)
          .eq("judging_challenges.challenge_id", item.id);

        const { data: vips } = await this.supabase
          .from("hackathon_vips_invitations")
          .select(
            `
                id,
                user_id
              `
          )
          .eq("hackathon_id", hackathonId)
          .contains("challenge_ids", [item.id])
          .contains("roles", ["judge"]);

        const judgeUserIds = judges?.map((item) => item.user_id).filter(Boolean) ?? [];
        const vipUserIds = vips?.map((item) => item.user_id).filter(Boolean) ?? [];

        return {
          ...item,
        };
      })
    );

    return {
      ...paginatedData,
      items: resolved,
    };
  }

  /**
   * Get a specific challenge with its bounties
   *
   * @param challengeId The ID of the challenge
   * @returns The challenge with its bounties
   */
  async get_challenge_with_bounties(challengeId: number) {
    const { data: challenge, error: challengeError } = await this.supabase
      .from("hackathon_challenges")
      .select("*")
      .eq("id", challengeId)
      .single();

    if (challengeError) {
      throw new Error(`Error fetching challenge ${challengeId}: ${challengeError.message}`);
    }

    if (!challenge) {
      throw new Error(`Challenge with ID ${challengeId} not found`);
    }

    // Get the bounties for the challenge
    const { data: bounties, error: bountiesError } = await this.supabase
      .from("hackathon_challenge_bounties")
      .select("*")
      .eq("challenge_id", challengeId)
      .order("rank", { ascending: true });

    if (bountiesError) {
      throw new Error(
        `Error fetching bounties for challenge ${challengeId}: ${bountiesError.message}`
      );
    }

    return {
      ...challenge,
      bounties: bounties || [],
    };
  }

  /**
   * Get all participants for a hackathon
   *
   * @param hackathonId The ID of the hackathon
   * @param options Query modifier options for filtering, sorting, and pagination
   * @returns Array of participants for the specified hackathon
   */
  async get_hackathon_participants(hackathonId: number, options?: Partial<QueryModifierOptions>) {
    const query = () => {
      let baseQuery = this.supabase
        .from("hackathon_participants_sorted")
        .select("*", { count: "exact" })
        .eq("hackathon_id", hackathonId)
        .order("users->>completion_percentage", { ascending: false })
        .order("users->>full_name", { ascending: true });

      let countQuery = this.supabase
        .from("hackathon_participants_sorted")
        .select("*", { count: "exact", head: true })
        .eq("hackathon_id", hackathonId);

      if (options?.search_term && options?.search_term.trim() !== "") {
        baseQuery = baseQuery.ilike("users->>full_name", `%${options?.search_term}%`);
        countQuery = countQuery.ilike("users->>full_name", `%${options?.search_term}%`);
      }

      if (options?.sort_by === "newest") {
        baseQuery = baseQuery.order("created_at", { ascending: false });
      }

      if (options?.sort_by === "number_of_projects") {
        baseQuery = this.supabase
          .from("hackathon_participants_with_project_counts")
          .select("*", { count: "exact" })
          .eq("hackathon_id", hackathonId)
          .order("project_count", { ascending: false }) as any;

        countQuery = this.supabase
          .from("hackathon_participants_with_project_counts")
          .select("*", { count: "exact", head: true })
          .eq("hackathon_id", hackathonId) as any;
      }

      return { baseQuery, countQuery };
    };

    const item = query();

    const paginatedData = await this.fetch_paginated_data<HackathonParticipants>(
      item.baseQuery,
      options,
      item.countQuery
    );

    const transformedData = paginatedData.items.map(({ users, ...rest }) => ({
      ...rest,
      users: {
        ...users,
        profile: Array.isArray(users?.profile) ? (users?.profile[0] ?? null) : users?.profile,
      },
    }));

    return { ...paginatedData, items: transformedData };
  }

  async get_hackathon_projects(
    hackathonId: number,
    options?: Partial<QueryModifierOptions>,
    user_id?: string
  ) {
    const query = this.supabase
      .from("projects")
      .select(
        `
            *,
            hackathons (
              name, organizer:technology_owners(*)
            ),
            project_team_members (
              *,
              users:users(*)
            ),
            project_challenges (
              hackathon_challenges (
                id,
                challenge_name,
                sponsors,
                is_round_2_only
              )
            )
          `
      )
      .eq("hackathon_id", hackathonId);

    const paginatedData = await this.fetch_paginated_data<Projects>(query, options);

    if (user_id) {
      const updated = paginatedData.items.map((project) => ({
        ...project,
        is_owner: project.project_team_members.some((member) => member.user_id === user_id),
      }));

      return { ...paginatedData, items: updated };
    }

    return paginatedData;
  }

  /**
   * Get all VIPs for a hackathon with their roles
   *
   * @param hackathonId The ID of the hackathon
   * @param options Query modifier options for filtering, sorting, and pagination
   * @returns Array of VIPs for the specified hackathon with their roles
   */
  async get_hackathon_vips(hackathonId: number) {
    const { data: vips, error: vipsError } = await this.supabase
      .from("hackathon_vips")
      .select("*, users(*), hackathon_vip_roles(*, roles(*))")
      .eq("hackathon_id", hackathonId);

    if (vipsError) {
      throw new Error(`Error fetching vips for hackathon ${hackathonId}: ${vipsError.message}`);
    }

    let { data: invitations, error: invitationsError } = await this.supabase
      .from("hackathon_vips_invitations")
      .select("*, users(*)")
      .eq("hackathon_id", hackathonId)
      .not("user_id", "in", `(${vips?.map((v) => v.user_id).join(",") || ""})`);

    if (invitationsError) {
      throw new Error(
        `Error fetching vip invitations for hackathon ${hackathonId}: ${invitationsError.message}`
      );
    }

    const vipEmails = vips?.map((vip) => vip.users?.email) || [];
    invitations = (invitations || []).filter((invitation) => !vipEmails.includes(invitation.email));

    const result = [];

    // Process confirmed VIPs
    for (const vip of vips || []) {
      const { data: judgingData, error: judgingError } = await this.supabase
        .from("judgings")
        .select("id")
        .eq("hackathon_id", hackathonId)
        .eq("user_id", vip.user_id)
        .single();

      if (judgingError && judgingError.code !== "PGRST116") {
        throw new Error(`Error checking judge status: ${judgingError.message}`);
      }

      let challengeIds: number[] = [];

      if (judgingData) {
        const { data: judgingChallenges, error: challengesError } = await this.supabase
          .from("judging_challenges")
          .select("challenge_id")
          .eq("judging_id", judgingData.id);

        if (challengesError) {
          throw new Error(`Error fetching judge challenges: ${challengesError.message}`);
        }

        challengeIds = judgingChallenges.map((challenge) => challenge.challenge_id);
      }

      result.push({
        ...vip,
        challengeIds,
        invitation: false,
      });
    }

    invitations?.forEach((invitation) => {
      result.push({
        ...invitation,
        invitation: true,
      });
    });

    return result;
  }

  async update_hackathon_vips_office_hour_count(hackathonId: number, userId: string) {
    const { data, error } = await this.supabase
      .from("hackathon_vips")
      .select("*")
      .eq("hackathon_id", hackathonId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!data || error) {
      throw new Error(`Invalid VIP: ${error?.message}`);
    }

    const { error: updateError, data: updatedVip } = await this.supabase
      .from("hackathon_vips")
      .update({ office_hours_clicks: data?.office_hours_clicks + 1 })
      .eq("hackathon_id", hackathonId)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();

    if (updateError) {
      throw new Error(`Error updating office hours click: ${updateError.message}`);
    }

    return updatedVip;
  }

  async get_all_mentors(hackathonId: number) {
    const { error: updateError, data: activeMentors } = await this.supabase
      .from("hackathon_vip_roles")
      .select(
        `
            hackathon_vips!inner(
              *,
              users (
                id, 
                full_name,
                avatar_url
              )
            )
          `
      )
      .eq("hackathon_id", hackathonId)
      .eq("role_id", 2)
      .not("hackathon_vips.office_hours", "is", null);

    if (updateError) {
      throw new Error(`Error fetching all mentors: ${updateError.message}`);
    }

    const { data: pendingInvites } = await this.supabase
      .from("hackathon_vips_invitations")
      .select(
        `
            *,
            users (
              id,
              full_name, 
              email,
              avatar_url
            )
          `
      )
      .eq("hackathon_id", hackathonId)
      .eq("status", "pending")
      .contains("roles", ["mentor"]);

    const reformedActiveMentors =
      activeMentors?.map((mentor) => ({
        ...mentor.hackathon_vips,
        invitation: false,
      })) || [];

    const reformedPendingMentors =
      pendingInvites?.map((invite) => ({
        ...invite,
        invitation: true,
      })) || [];

    return [...reformedActiveMentors, ...reformedPendingMentors];
  }

  /**
   * Get the application questions for a hackathon
   *
   * @param hackathonId The ID of the hackathon
   * @returns Array of application questions for the specified hackathon
   */
  async get_hackathon_application_questions(
    hackathonId: number
  ): Promise<HackathonApplicationQuestions[]> {
    const { data, error } = await this.supabase
      .from("hackathon_application_questions")
      .select("*")
      .eq("hackathon_id", hackathonId)
      .order("order", { ascending: true });

    if (error) {
      throw new Error(
        `Error fetching application questions for hackathon ${hackathonId}: ${error.message}`
      );
    }

    return data || [];
  }

  /**
   * Submit application answers for a hackathon
   *
   * @param participantId The ID of the participant submitting the answers
   * @param answers Array of answers with corresponding question IDs
   * @returns The inserted application answers
   */
  async answer_hackathon_application_questions(
    hackathonId: number,
    participantId: string,
    answers: { questionId: number; answer: string }[]
  ): Promise<HackathonApplicationAnswers[]> {
    const { data: validQuestions, error: questionsError } = await this.supabase
      .from("hackathon_application_questions")
      .select("id")
      .eq("hackathon_id", hackathonId);

    if (questionsError) {
      throw new Error(
        `Error fetching valid questions for hackathon ${hackathonId}: ${questionsError.message}`
      );
    }

    const validQuestionIds = (validQuestions || []).map((q) => q.id);

    for (const a of answers) {
      if (!validQuestionIds.includes(a.questionId)) {
        throw new Error(
          `Invalid question ID ${a.questionId} submitted for hackathon ${hackathonId}`
        );
      }
    }

    const { data, error } = await this.supabase
      .from("hackathon_application_answers")
      .insert(
        answers.map((a) => ({
          participant_id: participantId,
          question_id: a.questionId,
          answer: a.answer,
        }))
      )
      .select("*");

    if (error) {
      throw new Error(
        `Error submitting application answers for participant ${participantId}: ${error.message}`
      );
    }

    return data || [];
  }

  /**
   * Get all FAQs f`or a hackathon
   *
   * @param hackathonId The ID of the hackathon
   * @param options Query modifier options for filtering, sorting, and pagination
   * @returns Array of FAQs for the specified hackathon
   */
  async get_hackathon_faqs(hackathonId: number) {
    const { data, error } = await this.supabase
      .from("hackathon_faqs")
      .select("*")
      .eq("hackathon_id", hackathonId);

    if (error) {
      throw new Error(`Error fetching FAQs for hackathon ${hackathonId}: ${error.message}`);
    }

    return data;
  }
  async handle_click_hackathon_faq(faqId: number) {
    const { data: currentFaq, error: fetchError } = await this.supabase
      .from("hackathon_faqs")
      .select("clicks")
      .eq("id", faqId)
      .single();

    if (fetchError) {
      throw new Error(`Error fetching faq ${faqId}: ${fetchError.message}`);
    }

    const currentClicks = currentFaq?.clicks || 0;

    const { data, error } = await this.supabase
      .from("hackathon_faqs")
      .update({ clicks: currentClicks + 1 })
      .eq("id", faqId)
      .select(`*`)
      .single();

    if (error) {
      throw new Error(`Error updating resource click count for faq ${faqId}: ${error.message}`);
    }

    return data;
  }

  /**
   * Get resources for hackathons
   *
   * @param options Query modifier options for filtering, sorting, and pagination
   * @returns Array of resources for hackathons
   */
  async get_hackathon_resources(hackathonId: number) {
    const { data, error } = await this.supabase
      .from("hackathon_resources")
      .select(
        `
        *,
        hackathon_resource_challenges (
          challenge_id,
          hackathon_challenges ( challenge_name )
        )
      `
      )
      .eq("hackathon_id", hackathonId);

    if (error) {
      throw new Error(`Error fetching resources for hackathon ${hackathonId}: ${error.message}`);
    }

    // reshape to return challenge names directly
    const reshapedData = data.map((resource: any) => ({
      ...resource,
      challenges: resource.hackathon_resource_challenges.map(
        (link: any) => link.hackathon_challenges.challenge_name
      ),
    }));

    return reshapedData;
  }

  async get_hackathon_sponsors(hackathonId: number) {
    const { data, error } = await this.supabase
      .from("hackathon_challenges")
      .select(
        `
          *,
          prizes:hackathon_challenge_bounties(
            id,
            title,
            rank,
            prize_usd,
            prize_tokens, 
            prize_custom,
            company_partner_logo
          )
        `
      )
      .eq("hackathon_id", hackathonId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Error fetching resources for hackathon ${hackathonId}: ${error.message}`);
    }

    const formattedData = Object.values(
      data.reduce(
        (acc, item) => {
          const sponsor = item.sponsors?.[0] as unknown as Sponsor;
          if (!sponsor) return acc;

          const totalPrizes = item.prizes.reduce((sum, prize) => sum + (prize.prize_usd || 0), 0);

          if (acc[sponsor.name]) {
            acc[sponsor.name].totalPrizes += totalPrizes;
          } else {
            acc[sponsor.name] = {
              ...sponsor,
              totalPrizes,
              website: sponsor.website ?? "",
              tier: sponsor.tier ?? "",
            };
          }

          return acc;
        },
        {} as Record<string, { totalPrizes: number } & Sponsor>
      )
    );

    return formattedData;
  }

  async get_hackathon_community_partners(hackathonId: number) {
    const { data, error } = await this.supabase
      .from("hackathon_community_partners")
      .select(`*`)
      .eq("hackathon_id", hackathonId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(
        `Error fetching community partners for hackathon ${hackathonId}: ${error.message}`
      );
    }

    return data;
  }

  async handle_click_hackathon_resource(resourceId: number) {
    // First get current clicks value
    const { data: currentResource, error: fetchError } = await this.supabase
      .from("hackathon_resources")
      .select("clicks")
      .eq("id", resourceId)
      .single();

    if (fetchError) {
      throw new Error(`Error fetching resource ${resourceId}: ${fetchError.message}`);
    }

    const currentClicks = currentResource?.clicks || 0;

    // Update with incremented clicks
    const { data, error } = await this.supabase
      .from("hackathon_resources")
      .update({ clicks: currentClicks + 1 })
      .eq("id", resourceId)
      .select(`*`)
      .single();

    if (error) {
      throw new Error(
        `Error updating resource click count for resource ${resourceId}: ${error.message}`
      );
    }

    return data;
  }

  /**
   * Get upcoming sessions for a hackathon
   *
   * @param hackathonId The ID of the hackathon
   * @param options Query modifier options for filtering, sorting, and pagination
   * @returns Array of upcoming sessions for the specified hackathon
   */
  async get_hackathon_upcoming_session(hackathonId: number) {
    const nowIso = new Date().toISOString();

    const { data: session, error } = await this.supabase
      .from("hackathon_sessions")
      .select("*")
      .eq("hackathon_id", hackathonId)
      .gt("start_time", nowIso)
      .maybeSingle();

    if (error) {
      throw new Error(`Error fetching sessions for hackathon ${hackathonId}: ${error.message}`);
    }

    return session;
  }

  /**
   * Get a participants application status for a hackathon
   *
   * @param hackathonId The ID of the hackathon
   * @param participantId The ID of the participant
   * @returns The application status or null if not found
   */
  async get_participant_application_status(hackathon_id: number, participant_id: string) {
    const { data, error } = await this.supabase
      .from("hackathon_participants")
      .select("application_status")
      .eq("hackathon_id", hackathon_id)
      .eq("participant_id", participant_id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Error fetching application status: ${error.message}`);
    }

    return data?.application_status || null;
  }

  async send_team_up_request_to_participant(
    sender_id: string,
    receiver_id: string,
    hackathon_id: number,
    origin: string
  ) {
    const novu = new Novu({ secretKey: process.env.NOVU_API_KEY! });

    // 1) Parallel-fetch hackathon, sender & receiver
    const [hackRes, senderRes, receiverRes] = await Promise.all([
      this.supabase.from("hackathons").select("id, name").eq("id", hackathon_id).single(),
      this.supabase.from("users").select("id, full_name, email").eq("id", sender_id).single(),
      this.supabase.from("users").select("id, full_name, email").eq("id", receiver_id).single(),
    ]);

    if (hackRes.error || !hackRes.data) {
      throw new Error(`Hackathon ${hackathon_id} not found`);
    }
    if (senderRes.error || !senderRes.data) {
      throw new Error(`Sender ${sender_id} not found`);
    }
    if (receiverRes.error || !receiverRes.data) {
      throw new Error(`Receiver ${receiver_id} not found`);
    }

    const { data: hackathon } = hackRes;
    const { data: sender } = senderRes;
    const { data: receiver } = receiverRes;

    // 2) Try to insert; if conflict, ignore but we can tell if it was new
    const { data: upserted, error: upsertError } = await this.supabase
      .from("team_up_requests")
      .upsert(
        {
          hackathon_id,
          sender_id,
          receiver_id,
        },
        {
          onConflict: "hackathon_id,sender_id,receiver_id",
          ignoreDuplicates: true,
        }
      )
      .select("id"); // ask it to return rows

    if (upsertError) {
      throw new Error("Could not create or detect existing team-up request");
    }

    // If nothing was returned, it was a duplicate
    if (!upserted || upserted.length === 0) {
      throw new Error(
        "You already have a pending team-up request for this participant in this hackathon."
      );
    }

    // 3) Fire off your notifications without awaiting
    void novu.trigger({
      workflowId: "team-up-flow-sender",
      to: {
        subscriberId: sender_id,
        firstName: sender.full_name ?? undefined,
        email: sender.email ?? undefined,
      },
      payload: {
        receiver_id,
        receiver_name: receiver.full_name,
        receiver_profile: `${origin}/en/profile/${receiver.id}`,
        hackathon_id,
        hackathon_name: hackathon.name,
        hackathon_profile: `${origin}/en/hackathons/${hackathon.id}`,
      },
    });

    void novu.trigger({
      workflowId: "team-up-flow-receiver",
      to: {
        subscriberId: receiver_id,
        firstName: receiver.full_name ?? undefined,
        email: receiver.email ?? undefined,
      },
      payload: {
        sender_id,
        sender_name: sender.full_name,
        sender_profile: `${origin}/en/profile/${sender.id}`,
        hackathon_id,
        hackathon_name: hackathon.name,
        hackathon_profile: `${origin}/en/hackathons/${hackathon.id}`,
      },
    });

    // 4) Return immediately
    return { success: true };
  }

  async get_hackathon_prizes(hackathonId: number, options?: Partial<QueryModifierOptions>) {
    // If challenge_id is provided, get prizes for that specific challenge
    if (options?.filter && "challenge_id" in options.filter) {
      const { data, error } = await this.supabase
        .from("hackathon_challenge_bounties")
        .select(
          `
            *,
            challenge:hackathon_challenges (
              id,
              challenge_name,
              description,
              technologies,
              sponsors
            )
          `
        )
        .eq("challenge_id", options.filter!.challenge_id)
        .order("rank", { ascending: true });

      if (error) {
        throw new Error(`Error fetching prizes: ${error.message}`);
      }

      return data || [];
    }

    // Otherwise, get all challenges for the hackathon first
    const { data: challenges, error: challengesError } = await this.supabase
      .from("hackathon_challenges")
      .select("id")
      .eq("hackathon_id", hackathonId);

    if (challengesError) {
      throw new Error(`Error fetching challenges: ${challengesError.message}`);
    }

    if (!challenges || challenges.length === 0) {
      return [];
    }

    const challengeIds = challenges.map((c) => c.id);

    const { data, error } = await this.supabase
      .from("hackathon_challenge_bounties")
      .select(
        `
          *,
          challenge:hackathon_challenges (
            id,
            challenge_name,
            description,
            technologies,
            sponsors
          )
        `
      )
      .in("challenge_id", challengeIds)
      .order("rank", { ascending: true });

    if (error) {
      throw new Error(`Error fetching prizes: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create a prize for a challenge
   *
   * @param challengeId The ID of the challenge to create the prize for
   * @param prizeData The prize data to create
   * @returns The created prize
   */
  async create_challenge_prize(
    challengeId: number,
    prizeData: {
      title: string;
      rank: number;
      prize_usd?: number;
      prize_tokens?: number;
      prize_custom?: string;
      company_partner_logo?: string;
    }
  ) {
    // First verify the challenge exists and belongs to the hackathon
    const { data: challenge, error: challengeError } = await this.supabase
      .from("hackathon_challenges")
      .select("id")
      .eq("id", challengeId)
      .single();

    if (challengeError) {
      throw new Error(`Error verifying challenge: ${challengeError.message}`);
    }

    if (!challenge) {
      throw new Error(`Challenge with ID ${challengeId} not found`);
    }

    // Create the prize
    const { data: prize, error: prizeError } = await this.supabase
      .from("hackathon_challenge_bounties")
      .insert({
        challenge_id: challengeId,
        title: prizeData.title,
        rank: prizeData.rank,
        prize_usd: prizeData.prize_usd || null,
        prize_tokens: prizeData.prize_tokens || null,
        prize_custom: prizeData.prize_custom || null,
        company_partner_logo: prizeData.company_partner_logo || "",
      })
      .select()
      .single();

    if (prizeError) {
      throw new Error(`Error creating prize: ${prizeError.message}`);
    }

    return prize;
  }

  async get_available_teammates(hackathon_id: number, search_term?: string) {
    // 1. fetch all project IDs in this hackathon
    const { data: projects, error: projErr } = await this.supabase
      .from("projects")
      .select("id, hackathons (multi_projects)")
      .eq("hackathon_id", hackathon_id);

    if (projErr) throw new Error(projErr.message);
    const hackProjects = projects.map((p) => p.id);

    // 2. fetch all user_ids already on any of those projects
    const { data: allMembers, error: memErr } = await this.supabase
      .from("project_team_members")
      .select("user_id")
      .in("project_id", hackProjects)
      .eq("status", "confirmed");

    if (memErr) throw new Error(memErr.message);
    const takenUserIds = allMembers.map((m) => m.user_id);

    // 3. build the users query
    let usersQuery = this.supabase
      .from("users")
      .select(
        `
              *,
              roles:user_participant_roles!inner(
                is_primary,
                participant_roles(*)
              ),
              profile:participant_profile(*),
              participants:hackathon_participants!left(
                hackathon_id,
                looking_for_teammates
              )
          `
      )
      .eq("roles.is_primary", true)
      .limit(20);

    if (search_term && search_term.trim() !== "") {
      usersQuery = usersQuery.ilike("full_name", `%${search_term}%`);
    }

    // If hackathon doesn't allow multiple projects per user, exclude users who already have projects
    if (!projects[0]?.hackathons.multi_projects && takenUserIds.length > 0) {
      usersQuery = usersQuery.not("id", "in", `(${takenUserIds.join(",")})`);
    }

    // 4. execute
    const { data: available, error: userErr } = await usersQuery;
    if (userErr) throw new Error(userErr.message);

    const filteredUsers = available
      .map((u) => {
        const profile = Array.isArray(u.profile) ? u.profile[0] : u.profile;
        const participants = Array.isArray(u.participants) ? u.participants[0] : u.participants;

        if (participants && !participants.looking_for_teammates) return null;

        return {
          ...u,
          profile,
          participants,
          in_hackathon: Boolean(participants),
          main_role: u.roles?.[0]?.participant_roles.name,
        };
      })
      .filter((user): user is NonNullable<typeof user> => user !== null);

    return filteredUsers;
  }

  async get_hackathon_projects_search(hackathonId: number) {
    const { data, error } = await this.supabase
      .from("projects")
      .select(
        `
          id,
          name,
          logo_url,
          judging_entries:judging_entries (
            challenge_id,
            hackathon_challenges:challenge_id (
              id,
              challenge_name,
              sponsors
            )
          )
        `
      )
      .eq("hackathon_id", hackathonId);

    if (error) {
      throw new Error(`Error fetching projects with challenges: ${error.message}`);
    }

    const formatted = data.map((project: any) => ({
      id: project.id,
      name: project.name,
      logo_url: project.logo_url,
      challenges: project.judging_entries.map((entry: any) => entry.hackathon_challenges),
    }));

    return formatted;
  }

  async get_hackathon_challenges_search(hackathonId: number) {
    const { data, error } = await this.supabase
      .from("hackathon_challenges")
      .select("id, challenge_name, sponsors")
      .eq("hackathon_id", hackathonId);

    if (error) {
      throw new Error(`Error fetching projects with challenges: ${error.message}`);
    }

    return data;
  }

  async get_hackathon_judges_search(hackathonId: number) {
    const { data, error } = await this.supabase
      .from("judgings")
      .select(
        `
          user_id,
          users (
            full_name,
            avatar_url
          )
        `
      )
      .eq("hackathon_id", hackathonId);

    if (error) {
      throw new Error(`Error fetching judges: ${error.message}`);
    }

    const judges = data.map((entry: any) => ({
      name: entry.users.full_name,
      logo: entry.users.avatar_url ?? null,
    }));

    return judges;
  }

  async get_user_hackathon_feedback(hackathon_id: number, user_id: string) {
    const { data, error: update_error } = await this.supabase
      .from("hackathon_challenge_feedback")
      .select("*")
      .eq("hackathon_id", hackathon_id)
      .eq("user_id", user_id);

    if (update_error) {
      throw new Error(`Could not fetch Project Feedbacks: ${update_error.message}`);
    }

    return data;
  }

  async submit_user_hackathon_feedback(
    hackathon_id: number,
    user_id: string,
    body: FeedbackPayload
  ) {
    const tokenService = new TokenService(this.supabase);

    const rows = body.challengeFeedbacks.map((fb) => ({
      hackathon_id,
      user_id,
      challenge_id: fb.challenge_id,
      docs_rating: fb.docs_rating,
      challenge_recommendation_rating: fb.challenge_recommendation_rating,
      overall_rating: fb.overall_rating,
      support_rating: fb.support_rating,
      comments: fb.comments,
    }));

    const { data, error } = await this.supabase.from("hackathon_challenge_feedback").upsert(rows, {
      onConflict: "hackathon_id,challenge_id,user_id",
    });

    const { error: hackathonError } = await this.supabase.from("global_hackathon_feedback").upsert(
      {
        hackathon_id,
        user_id,
        overall_hackathon_rating: body.hackathonFeedback.question1_rating,
        recommend_hackathon_rating: body.hackathonFeedback.question2_rating,
        overall_devspot_rating: body.hackathonFeedback.question3_rating,
        recommend_devspot_rating: body.hackathonFeedback.question4_rating,
        comments: body?.hackathonFeedback?.comments,
      },
      {
        onConflict: "hackathon_id,user_id",
      }
    );

    if (error || hackathonError) {
      throw new Error(
        `Could not save Project Feedbacks: ${error?.message} ${hackathonError?.message}`
      );
    }

    await tokenService.awardTokens({
      userId: user_id,
      amount: 25,
      category: "post_hack_survey",
      referenceId: `post_hack_survey_${user_id}`,
    });

    return data;
  }

  async get_hackathon_leaderboard(
    hackathonId: number,
    sortBy: "standing" | "score" | "challenge" = "standing"
  ) {
    const { data: projectChallenges, error: projectError } = await this.supabase
      .from("project_challenges")
      .select(
        `
        project_id,
        challenge_id,
        rank,
        prize_id,
        projects (
          *,
          project_team_members (
            id,
            is_project_manager,
            status,
            users (
              id,
              full_name,
              email,
              avatar_url
            )
          )
        ),
        hackathon_challenges!inner (
          challenge_name,
          sponsors,
          hackathon_id
        )
      `
      )
      .eq("hackathon_challenges.hackathon_id", hackathonId)
      .not("prize_id", "is", null);

    if (projectError) throw new Error(`Failed to fetch projects: ${projectError.message}`);

    // Get judging entries for each project-challenge combination
    const { data: judgingEntries, error: judgingError } = await this.supabase
      .from("judging_entries")
      .select(
        `
            project_id, 
            challenge_id, 
            score, 
            general_comments_summary, 
            judgings (
              users (
                full_name,
                avatar_url
              )
            )
          `
      )
      .in(
        "project_id",
        projectChallenges.map((pc) => pc.project_id)
      );

    if (judgingError) throw new Error(`Failed to fetch judging entries: ${judgingError.message}`);

    // Transform data keeping each project-challenge combination separate
    let leaderboardData = projectChallenges.map((pc) => {
      // Get judging entries specific to this project-challenge combination
      const relevantEntries = judgingEntries.filter(
        (entry) => entry.project_id === pc.project_id && entry.challenge_id === pc.challenge_id
      );

      const validScores = relevantEntries.filter((entry) => entry.score !== null);
      const averageScore = validScores.length
        ? Math.round(validScores.reduce((sum, entry) => sum + entry.score, 0) / validScores.length)
        : 0;

      const randomComments = () => {
        if (relevantEntries.length <= 0) {
          return {
            comments: "",
            judge: null,
          };
        }

        const randomNumber = Math.floor(Math.random() * relevantEntries.length);

        const entry = relevantEntries[randomNumber];

        return {
          comments: entry.general_comments_summary,
          judge: {
            name: entry.judgings?.users.full_name,
            avatar_url: entry.judgings?.users.avatar_url,
          },
        };
      };

      const comment = randomComments();

      return {
        projectId: pc.project_id,
        challengeId: pc.challenge_id,
        projectName: pc.projects.name,
        projectDescription: pc.projects.description,
        challengeName: pc.hackathon_challenges.challenge_name,
        rank: pc.rank,
        averageScore,
        project: pc.projects,
        comments: comment?.comments,
        commentJudge: comment?.judge,
      };
    });

    switch (sortBy) {
      case "standing":
        leaderboardData.sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity));
        break;
      case "score":
        leaderboardData.sort((a, b) => b.averageScore - a.averageScore);
        break;
      case "challenge":
        leaderboardData.sort((a, b) => a.challengeName.localeCompare(b.challengeName));
        break;
    }

    const { data } = await this.supabase
      .from("hackathons")
      .select("show_leaderboard_comments, show_leaderboard_score, leaderboard_standing_by")
      .eq("id", hackathonId)
      .maybeSingle();

    const leaderboardOptions = {
      show_leaderboard_comments: data?.show_leaderboard_comments ?? false,
      show_leaderboard_score: data?.show_leaderboard_score ?? false,
      leaderboard_standing_by: data?.leaderboard_standing_by ?? "standing",
    };

    return {
      projects: leaderboardData,
      options: leaderboardOptions,
    };
  }

  async update_hackathon_leaderboard_options(
    hackathonId: number,
    options: HackathonLeaderboardOptions
  ) {
    const { data: hackathon, error: hackathonUpdateError } = await this.supabase
      .from("hackathons")
      .update({
        show_leaderboard_comments: options.comments,
        show_leaderboard_score: options.score,
        leaderboard_standing_by: options.sortBy,
      })
      .eq("id", hackathonId);

    if (hackathonUpdateError)
      throw new Error(`Failed to update hackathon: ${hackathonUpdateError.message}`);

    return hackathon;
  }

  async user_accept_vip_invitation(hackathon_id: number, user_id: string, transactionId: string) {
    const novu = new Novu({ secretKey: process.env.NOVU_API_KEY! });

    const invitation = await this.getPendingInvitation(hackathon_id, user_id);
    if (!invitation) {
      try {
        await novu.messages.deleteByTransactionId(transactionId);
      } catch (error) {
        console.log(error);
      }

      throw new Error("Invalid Invitation");
    }

    const vipMember = await this.updateInvitation(hackathon_id, user_id, "approve");

    const { full_name, email } = vipMember.users || {};
    const notificationData = await this.getNotificationData(transactionId);
    const payload = Object.assign({}, notificationData?.payload, {
      status: "accepted",
    });
    await novu.messages.deleteByTransactionId(transactionId);
    await novu.trigger({
      workflowId: "invite-user-to-vip-flow-receiver",
      to: {
        subscriberId: user_id,
        firstName: full_name ?? undefined,
        email: email ?? undefined,
      },
      payload,
    });

    return null;
  }

  async user_reject_vip_invitation(hackathon_id: number, user_id: string, transactionId: string) {
    const novu = new Novu({ secretKey: process.env.NOVU_API_KEY! });

    const invitation = await this.getPendingInvitation(hackathon_id, user_id);
    if (!invitation) {
      try {
        await novu.messages.deleteByTransactionId(transactionId);
      } catch (error) {
        console.log(error);
      }

      throw new Error("Invalid Invitation");
    }

    const vipMember = await this.updateInvitation(hackathon_id, user_id, "reject");
    const { full_name, email } = vipMember.users || {};
    const notificationData = await this.getNotificationData(transactionId);
    const payload = Object.assign({}, notificationData?.payload, {
      status: "rejected",
    });

    await novu.messages.deleteByTransactionId(transactionId);
    await novu.trigger({
      workflowId: "invite-user-to-vip-flow-receiver",
      to: {
        subscriberId: user_id,
        firstName: full_name ?? undefined,
        email: email ?? undefined,
      },
      payload,
    });

    return null;
  }

  private async getPendingInvitation(hackathon_id: number, user_id: string) {
    const { data, error } = await this.supabase
      .from("hackathon_vips")
      .select("*")
      .eq("hackathon_id", hackathon_id)
      .eq("user_id", user_id)
      .eq("status", "pending")
      .single();

    if (error) {
      console.error("Invitation fetch error:", error.message);
      return null;
    }

    return data;
  }

  public async updateInvitation(
    hackathon_id: number,
    user_id: string,
    status: "approve" | "reject"
  ) {
    // 1) flip the one invitation
    const { data, error } = await this.supabase
      .from("hackathon_vips")
      .update({ status: status === "approve" ? "accepted" : "rejected" })
      .eq("hackathon_id", hackathon_id)
      .eq("user_id", user_id)
      .select(
        `
          *,
          users (
            id,
            full_name,
            email,
            main_role
          )
        `
      )
      .single();

    if (error) {
      throw new Error(`Failed to ${status} invitation: ${error.message}`);
    }

    return data;
  }

  private async getNotificationData(transactionId: string) {
    const { data, error } = await this.supabase
      .from("hackathon_notification_data")
      .select("*")
      .eq("transaction_id", transactionId)
      .single();

    if (error) throw new Error(`Error fetching notification: ${error.message}`);
    return data;
  }
}

export default ReadHackathonService;
