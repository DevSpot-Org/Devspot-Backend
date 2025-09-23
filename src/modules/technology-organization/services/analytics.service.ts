import { SupabaseClient } from "@/lib/supabase";
import ReadHackathonService from "@/modules/hackathon/services/read.service";
import ApiBaseService from "@/utils/baseService";
import { TokenService } from "@/utils/tokenService";
import {
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  format,
  parseISO,
} from "date-fns";

interface CountItem {
  label: string;
  count: number;
}

interface SkillItem {
  name: string;
  percentage: number;
}

interface EventItem {
  title: string;
  datetime: string;
  rsvps: number;
}

export interface DashboardData {
  commonSkills: SkillItem[];
  faqs: CountItem[];
  resources: CountItem[];
  upcomingEvents: EventItem[];
}

interface SkillsData {
  experience?: string[];
  technology?: string[];
}

export type Granularity = "day" | "week" | "month" | "year";
const ALL_BUCKETS: Granularity[] = ["day", "week", "month", "year"];

class AnalyticsService extends ApiBaseService {
  constructor(supabase: SupabaseClient) {
    super(supabase);
  }

  async get_hackathon_participants_TO(hackathon_id: number, options: any) {
    const hackathonService = new ReadHackathonService(this.supabase);
    const tokenService = new TokenService(this.supabase);

    const allParticipants = await hackathonService.get_hackathon_participants(
      hackathon_id,
      options
    );

    if (!allParticipants.items?.length) {
      return allParticipants;
    }

    // Extract user IDs for batch operations
    const userIds = allParticipants.items.map((item) => item.users.id);

    // Batch fetch projects for all users in a single query
    const { data: projectData, error: projectError } = await this.supabase
      .from("project_team_members")
      .select("user_id, projects (name, id)")
      .in("user_id", userIds);

    if (projectError) {
      console.error("Error fetching projects:", projectError);
    }

    // Create a lookup map for projects by user_id
    const projectsByUserId = new Map<string, any[]>();
    projectData?.forEach((item) => {
      const userId = item.user_id;
      if (!projectsByUserId.has(userId)) {
        projectsByUserId.set(userId, []);
      }
      if (item.projects) {
        projectsByUserId.get(userId)!.push(item.projects);
      }
    });

    // Batch fetch token balances for all users
    const tokenBalances = await Promise.all(
      userIds.map((userId) => tokenService.getBalance(userId))
    );

    // Create token balance lookup map
    const tokenBalanceMap = new Map<string, any>();
    userIds.forEach((userId, index) => {
      tokenBalanceMap.set(userId, tokenBalances[index]);
    });

    // Transform items using the lookup maps
    const newItems = allParticipants.items.map((item) => {
      const userId = item.users.id;
      const projects = projectsByUserId.get(userId) || [];
      const tokenBalance = tokenBalanceMap.get(userId);

      return {
        ...item,
        projects,
        following: false,
        tokenBalance,
      };
    });

    return {
      ...allParticipants,
      items: newItems,
    };
  }

  async get_hackathon_analytics_overview(hackathon_id: number) {
    const { data } = await this.supabase
      .from("hackathon_participants")
      .select("id")
      .eq("hackathon_id", hackathon_id);

    const { data: projectSubmissions } = await this.supabase
      .from("projects")
      .select("*")
      .eq("hackathon_id", hackathon_id)
      .eq("submitted", true);

    const { data: pageViews } = await this.supabase
      .from("page_views")
      .select("*")
      .eq("page_type", "hackathon")
      .eq("page_identifier", hackathon_id.toString());

    return {
      registrations: data?.length ?? 0,
      pageViews: pageViews?.length ?? 0,
      profileViews: 0,
      followersGained: 0,
      projectSubmissions: projectSubmissions?.length ?? 0,
    };
  }

  async get_hackathon_attrition_analytics(hackathon_id: number) {
    const { data: participants } = await this.supabase
      .from("hackathon_participants")
      .select("id, participant_id")
      .eq("hackathon_id", hackathon_id);

    const registrations = participants?.length ?? 0;

    const { data: projectIds } = await this.supabase
      .from("projects")
      .select("id")
      .eq("hackathon_id", hackathon_id)
      .eq("submitted", true);

    const projectIdList = projectIds?.map((p) => p.id) ?? [];

    if (projectIdList.length === 0) {
      return {
        registrations,
        participantsWithProject: 0,
        attritionPercentage: 100,
      };
    }

    const { data: teamMembers } = await this.supabase
      .from("project_team_members")
      .select("user_id")
      .in("project_id", projectIdList);

    const userIdsInProjects = new Set(teamMembers?.map((tm) => tm.user_id));

    // 4. Match against participant_id to get how many participants created/joined a project
    const participantsWithProject =
      participants?.filter((p) => userIdsInProjects.has(p.participant_id!)).length ?? 0;

    // 5. Attrition
    const attritionPercentage =
      registrations > 0 ? ((registrations - participantsWithProject) / registrations) * 100 : 0;

    return {
      registrations,
      attritionPercentage: Math.round(attritionPercentage),
      participantsWithProject,
    };
  }

  async get_hackathon_faq_analytics(hackathon_id: number): Promise<CountItem[]> {
    const { data } = await this.supabase
      .from("hackathon_faqs")
      .select("question, clicks")
      .eq("hackathon_id", hackathon_id);

    return (
      data?.map((item) => ({
        label: item.question,
        count: item.clicks ?? 0,
      })) || []
    );
  }

  async get_hackathon_resources_analytics(hackathon_id: number): Promise<CountItem[]> {
    const { data } = await this.supabase
      .from("hackathon_resources")
      .select("title, clicks")
      .eq("hackathon_id", hackathon_id);

    return (
      data?.map((item) => ({
        label: item.title,
        count: item.clicks ?? 0,
      })) || []
    );
  }

  async get_hackathon_sessions_analytics(hackathon_id: number): Promise<EventItem[]> {
    const { data: sessions = [] } = await this.supabase
      .from("hackathon_sessions")
      .select("*")
      .eq("is_milestone", false)
      .eq("hackathon_id", hackathon_id);

    if (!sessions || sessions?.length === 0) return [];

    const sessionIds = sessions.map((s) => s.id);

    const { data: rsvps = [] } = await this.supabase
      .from("hackathon_user_session_rsvp")
      .select("session_id")
      .eq("status", true)
      .in("session_id", sessionIds);

    const rsvpCountMap = new Map<number, number>();

    rsvps?.forEach(({ session_id }) => {
      rsvpCountMap.set(session_id, (rsvpCountMap.get(session_id) || 0) + 1);
    });

    return sessions.map((session) => ({
      title: session.title,
      datetime: session.start_time,
      rsvps: rsvpCountMap.get(session.id) || 0,
    }));
  }
  async get_hackathon_common_skills_analytics(hackathon_id: number): Promise<SkillItem[]> {
    const { data: participants } = await this.supabase
      .from("hackathon_participants")
      .select("participant_id")
      .eq("hackathon_id", hackathon_id)
      .not("participant_id", "is", null);

    if (!participants?.length) return [];

    const BATCH_SIZE = 100;
    const skillToParticipants = new Map<string, Set<string>>();
    let totalParticipantsWithSkills = 0;

    const ids = participants.map((p) => p.participant_id).filter((id): id is string => !!id);

    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      const batch = ids.slice(i, i + BATCH_SIZE);
      const { data: profiles } = await this.supabase
        .from("participant_profile")
        .select("participant_id, skills")
        .in("participant_id", batch)
        .not("skills", "is", null);

      if (!profiles?.length) continue;
      totalParticipantsWithSkills += profiles.length;

      for (const { participant_id, skills } of profiles) {
        const skillData: SkillsData = typeof skills === "string" ? JSON.parse(skills) : skills;

        for (const skill of skillData.technology ?? []) {
          if (!skill || typeof skill !== "string") continue;
          const trimmed = skill.trim();
          if (!trimmed) continue;

          if (!skillToParticipants.has(trimmed)) {
            skillToParticipants.set(trimmed, new Set());
          }
          skillToParticipants.get(trimmed)!.add(participant_id);
        }
      }
    }

    return Array.from(skillToParticipants.entries())
      .map(([name, set]) => ({
        name,
        percentage: Number(((set.size / totalParticipantsWithSkills) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 6);
  }

  async get_hackathon_registration_analytics(hackathon_id: number, granularity: Granularity) {
    // ————— 0) sanity check: is this even one of the four? —————
    if (!ALL_BUCKETS.includes(granularity as Granularity)) {
      throw new Error(
        `Invalid granularity "${granularity}".  Must be one of: ${ALL_BUCKETS.join(", ")}.`
      );
    }
    const gran = granularity as Granularity;

    // ————— 1) fetch hackathon start_date —————
    const { data: hack, error: hackErr } = await this.supabase
      .from("hackathons")
      .select("start_date, created_at")
      .eq("id", hackathon_id)
      .single();
    if (hackErr || !hack) throw new Error(hackErr?.message || "Hackathon not found");
    const startDate = new Date(hack.created_at);
    const now = new Date();

    // ————— 2) compute which buckets make sense —————
    const days = differenceInDays(now, startDate);
    const months = differenceInMonths(now, startDate);
    const years = differenceInYears(now, startDate);

    // day + week are always available once you have at least 1 day
    const valid: Granularity[] = ["day", "week"];
    if (months >= 1) valid.push("month");
    if (years >= 1) valid.push("year");

    // ————— 3) reject “too big” requests —————
    if (!valid.includes(gran)) {
      throw new Error(
        `Granularity "${gran}" not yet available (hackathon only ${days} days old). ` +
          `Valid options are: ${valid.join(", ")}.`
      );
    }

    // ————— 4) call the fast RPC —————
    const { data, error } = await this.supabase.rpc("get_registration_stats", {
      p_hackathon_id: hackathon_id,
      p_gran: gran,
      p_start_date: hack.created_at, // pass the original timestamptz string
    });
    if (error) throw error;

    // ————— 5) format and return —————
    return {
      validGranularity: valid,
      response: (data as Array<{ bucket: string; registrations: number }>).map((row) => ({
        date: format(
          parseISO(row.bucket),
          gran === "day"
            ? "MMM d"
            : gran === "week"
              ? "wo 'w/k of' MMM yyyy"
              : gran === "month"
                ? "MMM yyyy"
                : "yyyy"
        ),
        registrations: row.registrations,
      })),
    };
  }
}

export default AnalyticsService;
