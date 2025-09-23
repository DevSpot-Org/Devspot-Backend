import { SupabaseClient } from "@/lib/supabase";

interface ScheduleRepositoryInterface {
  getHackathonSchedule(hackathon_id: number): Promise<any[]>;
  createSessionRsvp(
    hackathon_id: number,
    session_id: number,
    user_id: string,
    attending: boolean
  ): Promise<any>;
  updateSessionRsvp(
    hackathon_id: number,
    session_id: number,
    user_id: string,
    attending: boolean
  ): Promise<any>;
  getUpcomingSession(hackathon_id: number): Promise<any>;
}

export class ScheduleRepository implements ScheduleRepositoryInterface {
  private scheduleTable = "hackathon_schedule" as const;
  private rsvpTable = "hackathon_sessions" as const;

  constructor(private supabase: SupabaseClient) {}

  async getHackathonSchedule(hackathon_id: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.rsvpTable)
      .select(
        `
        *,
      `
      )
      .eq("hackathon_id", hackathon_id)
      .eq("is_active", true)
      .order("start_time", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch hackathon schedule: ${error.message}`);
    }

    return data || [];
  }

  async createSessionRsvp(
    hackathon_id: number,
    session_id: number,
    user_id: string,
    attending: boolean
  ): Promise<any> {
    return {};
  }

  async updateSessionRsvp(
    hackathon_id: number,
    session_id: number,
    user_id: string,
    attending: boolean
  ): Promise<any> {
    return {};
  }

  async getUpcomingSession(hackathon_id: number): Promise<any> {
    const now = new Date().toISOString();

    return {};
  }
}
