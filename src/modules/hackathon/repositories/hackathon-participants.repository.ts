import { SupabaseClient } from "@/lib/supabase";

export class HackathonParticipantsRepository {
  private supabase: SupabaseClient;
  private table = "hackathon_participants" as const;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  // Check if user is a hackathon participant
  async checkParticipantStatus(participantId: string, hackathonId: number): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("id")
      .eq("participant_id", participantId)
      .eq("hackathon_id", hackathonId)
      .single();

    if (error) {
      throw new Error(`Failed to check participant status: ${error.message}`);
    }

    return data;
  }

  async validateParticipantForProjectCreation(
    hackathonId: number,
    participantId: string
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("id")
      .eq("hackathon_id", hackathonId)
      .eq("participant_id", participantId)
      .eq("application_status", "accepted")
      .single();

    if (error) {
      throw new Error(`User is not registered or not yet accepted: ${error.message}`);
    }

    return data;
  }
}
