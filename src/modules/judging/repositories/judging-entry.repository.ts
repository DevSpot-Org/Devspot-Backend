import { SupabaseClient } from "@/lib/supabase";

interface JudgingEntryRepositoryInterface {
  findByJudgingAndProject(
    judging_id: number,
    project_id: number,
    challenge_id: number
  ): Promise<any | null>;
  getProjectDetails(
    judging_id: number,
    project_id: number,
    challenge_id: number
  ): Promise<any | null>;
  checkJudgingOwnership(judging_id: number, user_id: string): Promise<boolean>;
  updateFlagStatus(
    judging_id: number,
    project_id: number,
    challenge_id: number,
    flag_reason: string,
    flag_comments?: string,
    status?: "unflag"
  ): Promise<{ message: string }>;
  submitJudgingEntry(entryData: {
    judging_id: number;
    project_id: number;
    challenge_id: number;
    score: number;
    technical_feedback: string;
    technical_score: number;
    business_feedback: string;
    business_score: number;
    innovation_feedback: string;
    innovation_score: number;
    ux_feedback: string;
    ux_score: number;
    general_comments: string;
  }): Promise<any>;
  updateJudgingEntry(
    judging_id: number,
    project_id: number,
    challenge_id: number,
    updates: {
      score?: number;
      technical_feedback?: string;
      business_feedback?: string;
      innovation_feedback?: string;
      ux_feedback?: string;
      general_comments?: string;
      business_score?: number;
      innovation_score?: number;
      ux_score?: number;
      technical_score?: number;
      judging_status?: "judged" | "needs_review";
    }
  ): Promise<any>;
  getJudgingProgress(judging_id: number): Promise<{
    total: number;
    judged: number;
    flagged: number;
  }>;
  getJudgingProjects(judging_id: number): Promise<any>;
}

export class JudgingEntryRepository implements JudgingEntryRepositoryInterface {
  private table = "judging_entries" as const;

  constructor(private supabase: SupabaseClient) {}

  async findByJudgingAndProject(
    judging_id: number,
    project_id: number,
    challenge_id: number
  ): Promise<any | null> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("judging_id", judging_id)
      .eq("project_id", project_id)
      .eq("challenge_id", challenge_id)
      .single();

    if (error) throw new Error(error.message);

    return data;
  }

  async getProjectDetails(
    judging_id: number,
    project_id: number,
    challenge_id: number
  ): Promise<any | null> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(
        `
      *,
      judging_bot_scores:judging_bot_scores_id (
        ai_judged
      ),
      projects(
        *,
        hackathons(name, team_limit),
        project_challenges (*, hackathon_challenges(*)),
        project_team_members(
          id,
          is_project_manager,
          prize_allocation,
          status,
          user_id,
          users(id, full_name, email, avatar_url)
        )
      )
      `
      )
      .eq("judging_id", judging_id)
      .eq("project_id", project_id)
      .eq("challenge_id", challenge_id);

    if (error) throw new Error(error.message);

    const entry = Array.isArray(data) ? (data[0] ?? null) : data;
    return entry;
  }

  async checkJudgingOwnership(judging_id: number, user_id: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("judgings")
      .select("user_id")
      .eq("id", judging_id)
      .single();

    if (error || !data) {
      throw new Error("Judging not found");
    }

    return data.user_id === user_id;
  }

  async updateFlagStatus(
    judging_id: number,
    project_id: number,
    challenge_id: number,
    flag_reason: string,
    flag_comments?: string,
    status?: "unflag"
  ): Promise<{ message: string }> {
    const updates: Record<string, any> =
      status === "unflag"
        ? {
            flagged_reason: null,
            flagged_comments: null,
            judging_status: "needs_review",
          }
        : {
            flagged_reason: flag_reason,
            judging_status: "flagged",
            ...(flag_comments !== undefined && {
              flagged_comments: flag_comments,
            }),
          };

    const { data, error } = await this.supabase
      .from(this.table)
      .update(updates)
      .eq("judging_id", judging_id)
      .eq("project_id", project_id)
      .eq("challenge_id", challenge_id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to flag judging entry: ${error.message}`);
    }

    return {
      message: status === "unflag" ? "Successfully unflagged." : "Successfully flagged.",
    };
  }

  async submitJudgingEntry(entryData: {
    judging_id: number;
    project_id: number;
    challenge_id: number;
    score: number;
    technical_feedback: string;
    technical_score: number;
    business_feedback: string;
    business_score: number;
    innovation_feedback: string;
    innovation_score: number;
    ux_feedback: string;
    ux_score: number;
    general_comments: string;
  }): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .insert({
        ...entryData,
        judging_status: "needs_review",
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to submit judging entry: ${error.message}`);
    }

    return data;
  }

  async updateJudgingEntry(
    judging_id: number,
    project_id: number,
    challenge_id: number,
    updates: {
      score?: number;
      technical_feedback?: string;
      business_feedback?: string;
      innovation_feedback?: string;
      ux_feedback?: string;
      general_comments?: string;
      business_score?: number;
      innovation_score?: number;
      ux_score?: number;
      technical_score?: number;
      judging_status?: "judged" | "needs_review";
    }
  ): Promise<any> {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.score !== undefined) updateData.score = updates.score;
    if (updates.technical_feedback !== undefined)
      updateData.technical_feedback = updates.technical_feedback;
    if (updates.business_feedback !== undefined)
      updateData.business_feedback = updates.business_feedback;
    if (updates.innovation_feedback !== undefined)
      updateData.innovation_feedback = updates.innovation_feedback;
    if (updates.ux_feedback !== undefined) updateData.ux_feedback = updates.ux_feedback;
    if (updates.general_comments !== undefined)
      updateData.general_comments = updates.general_comments;
    if (updates.judging_status !== undefined) updateData.judging_status = updates.judging_status;
    if (updates.business_score !== undefined) updateData.business_score = updates.business_score;
    if (updates.innovation_score !== undefined)
      updateData.innovation_score = updates.innovation_score;
    if (updates.ux_score !== undefined) updateData.ux_score = updates.ux_score;
    if (updates.technical_score !== undefined) updateData.technical_score = updates.technical_score;

    const { data, error } = await this.supabase
      .from(this.table)
      .update(updateData)
      .eq("judging_id", judging_id)
      .eq("project_id", project_id)
      .eq("challenge_id", challenge_id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update judging entry: ${error.message}`);
    }

    return data;
  }

  async getJudgingProgress(judging_id: number): Promise<{
    total: number;
    judged: number;
    flagged: number;
  }> {
    const { count: total, error: totalError } = await this.supabase
      .from(this.table)
      .select("*", { count: "exact", head: true })
      .eq("judging_id", judging_id);

    const { count: judged, error: judgedError } = await this.supabase
      .from(this.table)
      .select("*", { count: "exact", head: true })
      .eq("judging_id", judging_id)
      .eq("judging_status", "judged");

    const { count: flagged, error: flaggedError } = await this.supabase
      .from(this.table)
      .select("*", { count: "exact", head: true })
      .eq("judging_id", judging_id)
      .eq("judging_status", "flagged");

    if (totalError || judgedError || flaggedError) {
      throw new Error(totalError?.message || judgedError?.message || flaggedError?.message);
    }

    return {
      total: total || 0,
      judged: judged || 0,
      flagged: flagged || 0,
    };
  }

  async getJudgingProjects(judging_id: number): Promise<any> {
    // Get judging entries for this judging_id
    const { data: entries, error: entriesError } = await this.supabase
      .from(this.table)
      .select(
        `
        id,
        judging_status,
        judging_id,
        project_id,
        challenge_id,
        score,
        project_hidden,
        judging_bot_scores:judging_bot_scores_id (
          id,
          ai_judged,
          score
        ),
        projects!inner(
          *,
          hackathons (
            name,
            organizer:technology_owners(*)
          ),
          project_challenges (
            id,
            challenge_id,
            hackathon_challenges (
              id,
              challenge_name
            )
          ),
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
        )
      `
      )
      .eq("judging_id", judging_id)
      .eq("projects.submitted", true)
      .is("project_hidden", false);

    if (entriesError) {
      throw new Error(`Failed to get judging projects: ${entriesError.message}`);
    }

    // Get all challenge_ids for this judging_id
    const { data: judgeChallenges, error: challengesError } = await this.supabase
      .from("judging_challenges")
      .select("challenge_id")
      .eq("judging_id", judging_id);

    if (challengesError) {
      throw new Error(`Failed to get judging challenges: ${challengesError.message}`);
    }

    const challengeIds = judgeChallenges.map((jc) => jc.challenge_id);

    // Get all projects submitted for those challenges from project_challenges
    const { data: projectChallengeRows, error: projChallengeError } = await this.supabase
      .from("project_challenges")
      .select("project_id, challenge_id")
      .in("challenge_id", challengeIds);

    if (projChallengeError) {
      throw new Error(`Failed to get project challenges: ${projChallengeError.message}`);
    }

    const projectIds = projectChallengeRows.map((pc) => pc.project_id);

    //Get projects with submitted = false and their relationships
    const { data: unsubmittedProjects, error: unsubmittedError } = await this.supabase
      .from("projects")
      .select(
        `
        *,
        hackathons (
          name,
          organizer:technology_owners(*)
        ),
        project_challenges (
          id,
          challenge_id,
          hackathon_challenges (
            id,
            challenge_name
          )
        ),
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
      `
      )
      .in("id", projectIds)
      .eq("submitted", false);

    if (unsubmittedError) {
      throw new Error(`Failed to get unsubmitted projects: ${unsubmittedError.message}`);
    }

    // Group entries by challenge
    const groupedByChallenge: { [key: string]: any[] } = {};

    entries.forEach((entry) => {
      const challengeName =
        entry.projects?.project_challenges?.[0]?.hackathon_challenges?.challenge_name;
      if (challengeName) {
        if (!groupedByChallenge[challengeName]) {
          groupedByChallenge[challengeName] = [];
        }
        groupedByChallenge[challengeName].push(entry);
      }
    });

    // 6️⃣ Add unsubmitted projects to their respective challenges
    unsubmittedProjects.forEach((project) => {
      const challengeName = project.project_challenges?.[0]?.hackathon_challenges?.challenge_name;
      if (challengeName && groupedByChallenge[challengeName]) {
        groupedByChallenge[challengeName].push({
          id: null,
          judging_status: "not_submitted",
          judging_id,
          project_id: project.id,
          challenge_id: project.project_challenges?.[0]?.challenge_id,
          score: null,
          project_hidden: false,
          judging_bot_scores: null,
          projects: project,
        });
      }
    });

    return groupedByChallenge;
  }

  private canBeEdited(entries: any, ai_judged?: boolean): boolean {
    // If bot hasn't judged, cannot be edited
    if (ai_judged) return false;

    const fieldsToCheck: string[] = [
      "business_feedback",
      "business_score",
      "business_summary",
      "general_comments",
      "general_comments_summary",
      "innovation_feedback",
      "innovation_score",
      "innovation_summary",
      "score",
      "technical_feedback",
      "technical_score",
      "technical_summary",
      "ux_feedback",
      "ux_score",
      "ux_summary",
    ];

    return fieldsToCheck.some((field) => {
      const value = entries?.[field];

      if (typeof value === "string") {
        return value.trim() !== "";
      }

      if (typeof value === "number") {
        return value !== 0;
      }

      return false;
    });
  }

  async getJudgingProjectsUngrouped(judging_id: number): Promise<any> {
    // Get judging entries for this judging_id
    const { data: entries, error: entriesError } = await this.supabase
      .from(this.table)
      .select(
        `
        id,
        judging_status,
        judging_id,
        project_id,
        challenge_id,
        score,
        project_hidden,
        judging_bot_scores:judging_bot_scores_id (
          id,
          ai_judged,
          score
        ),
        projects!inner(
          *,
          hackathons (
            name,
            organizer:technology_owners(*)
          ),
          project_challenges (
            id,
            challenge_id,
            hackathon_challenges (
              id,
              challenge_name
            )
          ),
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
        )
      `
      )
      .eq("judging_id", judging_id)
      .eq("projects.submitted", true)
      .is("project_hidden", false);

    if (entriesError) {
      throw new Error(`Failed to get judging entries: ${entriesError.message}`);
    }

    // Get all challenge_ids for this judging_id
    const { data: judgeChallenges, error: challengesError } = await this.supabase
      .from("judging_challenges")
      .select("challenge_id")
      .eq("judging_id", judging_id);

    if (challengesError) {
      throw new Error(`Failed to get judging challenges: ${challengesError.message}`);
    }

    const challengeIds = judgeChallenges.map((jc) => jc.challenge_id);

    // Get all projects submitted for those challenges from project_challenges
    const { data: projectChallengeRows, error: projChallengeError } = await this.supabase
      .from("project_challenges")
      .select("project_id, challenge_id")
      .in("challenge_id", challengeIds);

    if (projChallengeError) {
      throw new Error(`Failed to get project challenges: ${projChallengeError.message}`);
    }

    // Flatten judging_entries projects
    const flattenedEntries = entries.map((entry) => {
      const { projects, challenge_id, ...judgingFields } = entry;
      const { project_challenges, project_team_members, ...projFields } = projects;

      const confirmedTeamMembers = project_team_members.filter(
        (member) => member.status === "confirmed"
      );

      const matchedChallenge = project_challenges?.find((ch) => ch.challenge_id === challenge_id);

      return {
        ...judgingFields,
        challenge_id,
        can_be_edited: this.canBeEdited(entry as any, judgingFields?.judging_bot_scores?.ai_judged),
        projects: {
          ...projFields,
          project_team_members: confirmedTeamMembers,
          project_challenge: matchedChallenge ?? null,
        },
      };
    });

    // Sort and combine all projects based on status priority
    const needsReviewProjects = flattenedEntries.filter(
      (entry) => entry.judging_status === "needs_review"
    );
    const judgedProjects = flattenedEntries.filter((entry) => entry.judging_status === "judged");

    return [...judgedProjects, ...needsReviewProjects];
  }
}
