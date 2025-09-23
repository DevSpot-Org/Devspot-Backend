import { SupabaseClient } from "@/lib/supabase";
import { Judgings } from "@/types/entities";
import { CreateJudgingResponse } from "../types";

interface JudgingRepositoryInterface {
  findByUserAndHackathon(
    user_id: string,
    hackathon_id: number
  ): Promise<CreateJudgingResponse | null>;
  create(user_id: string, hackathon_id: number): Promise<CreateJudgingResponse>;
  submitJudging(judging_id: number): Promise<any>;
  checkJudgingOwnership(judging_id: number, user_id: string): Promise<boolean>;
  getJudgingChallenges(judging_id: number): Promise<any[]>;
  getUserJudgings(user_id: string): Promise<any[]>;
}

export class JudgingRepository implements JudgingRepositoryInterface {
  private table = "judgings" as const;

  constructor(private supabase: SupabaseClient) {}

  async findByUserAndHackathon(
    user_id: string,
    hackathon_id: number
  ): Promise<CreateJudgingResponse | null> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("user_id", user_id)
      .eq("hackathon_id", hackathon_id)
      .maybeSingle();

    if (error) throw new Error(error.message);

    return data as CreateJudgingResponse | null;
  }

  async create(user_id: string, hackathon_id: number): Promise<CreateJudgingResponse> {
    const { data, error } = await this.supabase
      .from(this.table)
      .insert([{ user_id, hackathon_id, is_submitted: false }])
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data as CreateJudgingResponse;
  }

  async submitJudging(judging_id: number): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .update({ is_submitted: true })
      .eq("id", judging_id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to submit judging: ${error.message}`);
    }

    return data;
  }

  async checkJudgingOwnership(judging_id: number, user_id: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("user_id")
      .eq("id", judging_id)
      .single();

    if (error || !data) {
      throw new Error("Judging not found");
    }

    return data.user_id === user_id;
  }

  async getJudgingChallenges(judging_id: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("judging_challenges")
      .select(
        `
        id,
        challenge_id,
        hackathon_challenges (
          id,
          challenge_name,
          sponsors
        )
      `
      )
      .eq("judging_id", judging_id);

    if (error) {
      throw new Error(`Failed to get judging challenges: ${error.message}`);
    }

    return data.map((challenge) => ({
      id: challenge.challenge_id,
      challenge_name: challenge.hackathon_challenges.challenge_name,
      sponsors: challenge.hackathon_challenges.sponsors,
    }));
  }

  async getUserJudgings(user_id: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(
        `
        *,
        hackathons (
          id,
          name,
          organizer:technology_owners (
            id,
            name,
            logo_url
          ),
          number_of_participants
        )
      `
      )
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get user judgings: ${error.message}`);
    }

    return data || [];
  }

  async getHackathonChallengesJudgesProgress(
    hackathonId: number,
    judging_id: number
  ): Promise<any[]> {
    // Verify the hackathon belongs to the technology owner
    const { data: hackathon, error: hackathonError } = await this.supabase
      .from("hackathons")
      .select("id, start_date, deadline_to_submit")
      .eq("id", hackathonId)
      .single();

    if (hackathonError) {
      throw new Error(`Failed to verify hackathon: ${hackathonError.message}`);
    }

    // Get all challenges for the hackathon
    const { data: challenges, error: challengesError } = await this.supabase
      .from("hackathon_challenges")
      .select(
        `
        id,
        challenge_name,
        description
      `
      )
      .eq("hackathon_id", hackathonId);

    if (challengesError) {
      throw new Error(`Error fetching challenges: ${challengesError.message}`);
    }

    const currentDate = new Date().toISOString();
    const isJudgingLive =
      hackathon.deadline_to_submit &&
      new Date(hackathon.deadline_to_submit) <= new Date(currentDate);

    // Process each challenge
    const challengesWithPrizes = await Promise.all(
      challenges.map(async (challenge) => {
        // Get judges for this challenge
        const { data: judges, error: judgesError } = await this.supabase
          .from("judgings")
          .select(
            `
            id,
            user_id,
            is_submitted,
            users (
              id,
              full_name,
              avatar_url
            ),
            judging_challenges (
              id,
              challenge_id,
              is_winner_assigner
            )
          `
          )
          .eq("hackathon_id", hackathonId)
          .neq("id", judging_id);

        if (judgesError) {
          throw new Error(`Error fetching judges for hackathon: ${judgesError.message}`);
        }

        // Filter judges who are assigned to this specific challenge
        const challengeJudges = judges.filter((judge) =>
          judge.judging_challenges.some((jc) => jc.challenge_id === challenge.id)
        );

        // Process judges and calculate progress
        const processedJudges = await Promise.all(
          challengeJudges.map(async (judge) => {
            // Get the judging_challenge record for this specific challenge
            const judgingChallenge = judge.judging_challenges.find(
              (jc) => jc.challenge_id === challenge.id
            );

            let status: string;

            // Always calculate progress percentage first
            const { count: totalEntries, error: totalError } = await this.supabase
              .from("judging_entries")
              .select("*", { count: "exact", head: true })
              .eq("judging_id", judge.id)
              .eq("challenge_id", challenge.id);

            const { count: judgedEntries, error: judgedError } = await this.supabase
              .from("judging_entries")
              .select("*", { count: "exact", head: true })
              .eq("judging_id", judge.id)
              .eq("challenge_id", challenge.id)
              .eq("judging_status", "judged");

            if (totalError || judgedError) {
              throw new Error(`Error calculating progress for judge ${judge.id}`);
            }

            const progressPercentage =
              (totalEntries || 0) > 0
                ? Math.round(((judgedEntries || 0) / (totalEntries || 1)) * 1000) / 10
                : 0;

            // Determine status
            if (!isJudgingLive) {
              status = "Judging not live";
            } else if (judge.is_submitted) {
              status = "Submitted";
            } else {
              status = "In progress";
            }

            return {
              id: judge.user_id,
              name: judge.users.full_name || "Unknown",
              avatar_url: judge.users.avatar_url,
              is_prize_allocator: judgingChallenge?.is_winner_assigner || false,
              status,
              progress_percentage: progressPercentage,
            };
          })
        );

        // Sort judges: prize allocator first, then alphabetically
        processedJudges.sort((a, b) => {
          if (a.is_prize_allocator && !b.is_prize_allocator) return -1;
          if (!a.is_prize_allocator && b.is_prize_allocator) return 1;
          return (a.name || "").localeCompare(b.name || "");
        });

        return {
          id: challenge.id,
          challenge_name: challenge.challenge_name,
          description: challenge.description,
          judges: processedJudges,
        };
      })
    );

    return challengesWithPrizes;
  }

  async getHackathonJudgesSearch(hackathonId: number): Promise<any[]> {
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

  async findById(judgingId: number): Promise<Judgings> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("id", judgingId)
      .single();

    if (error) throw new Error("Failed to fetch judging");
    return data;
  }

  async updateIsSubmitted(judgingId: number, isSubmitted: boolean) {
    const { error } = await this.supabase
      .from(this.table)
      .update({ is_submitted: isSubmitted })
      .eq("id", judgingId);

    if (error) throw new Error("Failed to update judging status");
  }

  async getUserById(judging_id: number) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("user_id")
      .eq("id", judging_id)
      .single();

    if (error) throw new Error(error.message);

    return data;
  }
}
