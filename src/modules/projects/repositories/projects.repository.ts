import { fetch_paginated_data, QueryModifierOptions } from "../../../utils/query-helpers";

import { SupabaseClient } from "@/lib/supabase";
import { Projects } from "@/types/entities";
import { ProjectMediaRepositoryInterface, ProjectsRepositoryInterface } from "../types";

export class ProjectsRepository
  implements ProjectsRepositoryInterface, ProjectMediaRepositoryInterface
{
  private table = "projects" as const;

  constructor(private supabase: SupabaseClient) {}

  private buildSelect<T extends keyof Projects>(fields?: T[]): string {
    return fields?.length ? fields.map((field) => this.toSnakeCase(String(field))).join(", ") : "*";
  }

  private toSnakeCase(field: string): string {
    return field.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  async findByHackathonId<T extends keyof Projects>(
    id: number,
    fields?: T[]
  ): Promise<Pick<Projects, T>[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(this.buildSelect(fields))
      .eq("hackathon_id", id);

    if (error) throw new Error(error.message);

    return data as unknown as Pick<Projects, T>[];
  }

  // Core project methods
  async findById(id: number): Promise<any | null> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(
        `
        *,
        hackathons (name, team_limit, deadline_to_submit),
        project_challenges (*, hackathon_challenges(*)),
        project_team_members (
          id,
          is_project_manager,
          prize_allocation,
          status,
          user_id,
          users (
            id,
            full_name,
            email,
            avatar_url
          )
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error finding project by ID:", error);
      return null;
    }
    return data;
  }

  async update(projectId: number, updateData: any): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .update(updateData)
      .eq("id", projectId)
      .select()
      .maybeSingle();

    if (error) {
      console.log({ error });
      throw new Error(`Failed to update project: ${error.message}`);
    }

    const { data: all } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("id", projectId)
      .maybeSingle();
    console.log({ all });
    return data;
  }

  async delete(id: number): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .delete()
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }

    return data;
  }

  // Media-related methods
  async updateHeaderImage(projectId: number, imageUrl: string): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .update({
        header_url: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update header image: ${error.message}`);
    }
    return data;
  }

  async updateLogo(projectId: number, logoUrl: string): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .update({
        logo_url: logoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update logo: ${error.message}`);
    }
    return data;
  }

  async updateVideo(projectId: number, videoUrl: string): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .update({
        video_url: videoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update video: ${error.message}`);
    }
    return data;
  }

  async deleteHeaderImage(projectId: number): Promise<any> {
    const { error } = await this.supabase
      .from(this.table)
      .update({
        header_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (error) {
      throw new Error(`Failed to delete header image: ${error.message}`);
    }

    return { success: true };
  }

  async deleteLogo(projectId: number): Promise<any> {
    const { error } = await this.supabase
      .from(this.table)
      .update({
        logo_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (error) {
      throw new Error(`Failed to delete logo: ${error.message}`);
    }

    return { success: true };
  }

  async deleteVideo(projectId: number): Promise<any> {
    const { error } = await this.supabase
      .from(this.table)
      .update({
        video_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (error) {
      throw new Error(`Failed to delete video: ${error.message}`);
    }

    return { success: true };
  }

  async getProjectById(projectId: number): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("id", projectId)
      .single();

    if (error) {
      throw new Error(`Failed to get project: ${error.message}`);
    }
    return data;
  }

  async submitProjectWithChallenges(projectId: number): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .update({ submitted: true })
      .eq("id", projectId)
      .select(
        `
            *,
            project_challenges (
                challenge_id,
                hackathon_challenges (*)
            )
        `
      )
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to submit project: ${error.message}`);
    }

    return data;
  }

  async getAllSubmittedProjects(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(
        `
          *, 
          hackathons (name, organizer:technology_owners(*)),

          project_team_members (
            id,
            is_project_manager,
            status,
            users (
              id,
              full_name,
              email,
              avatar_url,
              participant_wallets (
                wallet_address,
                primary_wallet
              )
            )
          )
        `
      )
      .eq("submitted", true)
      .eq("project_team_members.status", "confirmed");

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    return data ?? [];
  }

  async getDiscoverProjects(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(
        `
          *, 
          hackathons (name, organizer:technology_owners(*)),
          project_team_members!inner (
            id,
            is_project_manager,
            users (
              id,
              full_name,
              avatar_url
            )
          ),
          project_challenges (
            hackathon_challenges (
              id,
              challenge_name
            )
          )
        `
      )
      .order("created_at", { ascending: false })
      .eq("submitted", true)
      .eq("project_team_members.status", "confirmed")
      .limit(10);

    if (error) {
      throw new Error(`Failed to fetch discover project: ${error.message}`);
    }

    return data || [];
  }

  async getProjectsCount(): Promise<number> {
    let query = this.supabase.from("projects").select("*", { count: "exact", head: true });

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to count hackathons: ${error.message}`);
    }

    return count ?? 0;
  }

  async getUserProjects(userId: string, isOwner: boolean): Promise<any[]> {
    let query = this.supabase
      .from(this.table)
      .select(
        `
      *,
      hackathons (
        name, organizer:technology_owners(*)
      ),
      project_challenges (
        hackathon_challenges (
          id,
          challenge_name
        )
      ),
      project_team_members!inner (
        id,
        is_project_manager,
        user_id,              
        users (
          id,
          full_name,
          email,
          avatar_url
        )
      )
    `
      )
      .eq("project_team_members.user_id", userId)
      .eq("project_team_members.status", "confirmed");

    if (!isOwner) {
      query = query.eq("submitted", true);
    }

    const { data, error: fetch_error } = await query;

    if (fetch_error) {
      throw new Error(`Failed to fetch user's projects: ${fetch_error.message}`);
    }

    return data ?? [];
  }

  async getHackathonProjects(
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

    const paginatedData = await fetch_paginated_data<any>(query, options);

    if (user_id) {
      const updated = paginatedData.items.map((project: any) => ({
        ...project,
        is_owner: project.project_team_members.some((member: any) => member.user_id === user_id),
      }));

      return { ...paginatedData, items: updated };
    }

    return paginatedData;
  }

  // Legacy-style header image update method (exact same as legacy implementation)
  async updateProjectHeaderUrl(projectId: number, headerUrl: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.table)
      .update({ header_url: headerUrl })
      .eq("id", projectId);

    if (error) {
      throw new Error(`Failed to update header Image: ${error.message}`);
    }
  }

  // Legacy-style header image delete method (exact same as legacy implementation)
  async deleteProjectHeaderUrl(projectId: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.table)
      .update({ header_url: null })
      .eq("id", projectId);

    if (error) {
      throw new Error(`Failed to update project Header: ${error.message}`);
    }
  }

  // Legacy-style logo update method (exact same as legacy implementation)
  async updateProjectLogoUrl(projectId: number, logoUrl: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.table)
      .update({ logo_url: logoUrl })
      .eq("id", projectId);

    if (error) {
      throw new Error(`Failed to update project logo: ${error.message}`);
    }
  }

  // Legacy-style logo delete method (exact same as legacy implementation)
  async deleteProjectLogoUrl(projectId: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.table)
      .update({ logo_url: null })
      .eq("id", projectId);

    if (error) {
      throw new Error(`Failed to update project logo: ${error.message}`);
    }
  }

  // Legacy-style video update method (exact same as legacy implementation)
  async updateProjectVideoUrl(projectId: number, videoUrl: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.table)
      .update({ video_url: videoUrl })
      .eq("id", projectId);

    if (error) {
      throw new Error(`Failed to update project Video: ${error.message}`);
    }
  }

  // Legacy-style video delete method (exact same as legacy implementation)
  async deleteProjectVideoUrl(projectId: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.table)
      .update({ video_url: null })
      .eq("id", projectId);

    if (error) {
      throw new Error(`Failed to update project video: ${error.message}`);
    }
  }

  // Check if project exists and get project data
  async findProjectById(projectId: number): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("id", projectId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch project: ${error.message}`);
    }

    return data;
  }

  // Get project with hackathon info (for team updates)
  async findProjectWithHackathon(projectId: number): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("id, name, hackathons (id, name)")
      .eq("id", projectId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch project: ${error.message}`);
    }

    return data;
  }

  async getHackathonProjectsSearch(hackathonId: number): Promise<any> {
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

  async insertProject(projectData: any): Promise<any> {
    const { data: insertedProject, error: projectError } = await this.supabase
      .from(this.table)
      .insert(projectData)
      .select("*, hackathons (id, name, organizer:technology_owners(*))")
      .single();

    if (projectError) {
      throw new Error(`Failed to insert project: ${projectError.message}`);
    }

    return insertedProject;
  }

  async searchHackathonProjects(
    hackathon_id: number,
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ projects: any[]; total: number }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await this.supabase
      .from(this.table)
      .select(
        `
        *,
        project_team_members(
          id,
          is_project_manager,
          status,
          users(id, full_name, avatar_url)
        ),
        project_challenges(
          id,
          hackathon_challenges(id, challenge_name)
        )
      `,
        { count: "exact" }
      )
      .eq("hackathon_id", hackathon_id)
      .eq("submitted", true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to search hackathon projects: ${error.message}`);
    }

    return {
      projects: data || [],
      total: count || 0,
    };
  }
  async findByTechnologyOwnerId(technologyOwnerId: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(
        `
        *,
        hackathons (
          id,
          name
        ),
        project_team_members (
          id,
          users (
            id,
            full_name,
            avatar_url
          )
        ),
        project_challenges (
          hackathon_challenges (
            id,
            challenge_name
          )
        )
      `
      )
      .eq("hackathons.organizer_id", technologyOwnerId)
      .eq("submitted", true);

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    return data ?? [];
  }

  // Get hackathon project statistics for recap analytics
  async getHackathonProjectStats(hackathonId: number): Promise<{
    total_projects_submitted: number;
    total_project_challenge_pairs: number;
  }> {
    // Get total submitted projects for this hackathon
    const { count: submittedCount, error: submittedError } = await this.supabase
      .from(this.table)
      .select("*", { count: "exact", head: true })
      .eq("hackathon_id", hackathonId)
      .eq("submitted", true);

    if (submittedError) {
      throw new Error(`Failed to count submitted projects: ${submittedError.message}`);
    }

    // Get total project-challenge pairs for submitted projects
    const { data: submittedProjects, error: projectsError } = await this.supabase
      .from(this.table)
      .select("id")
      .eq("hackathon_id", hackathonId)
      .eq("submitted", true);

    if (projectsError) {
      throw new Error(`Failed to fetch submitted projects: ${projectsError.message}`);
    }

    const submittedProjectIds = submittedProjects?.map((p) => p.id) || [];

    let totalProjectChallengePairs = 0;
    if (submittedProjectIds.length > 0) {
      const { count: pairsCount, error: pairsError } = await this.supabase
        .from("project_challenges")
        .select("*", { count: "exact", head: true })
        .in("project_id", submittedProjectIds);

      if (pairsError) {
        throw new Error(`Failed to count project-challenge pairs: ${pairsError.message}`);
      }

      totalProjectChallengePairs = pairsCount || 0;
    }

    return {
      total_projects_submitted: submittedCount || 0,
      total_project_challenge_pairs: totalProjectChallengePairs,
    };
  }

  // Get hackathon project type breakdown for recap analytics
  async getHackathonProjectTypeBreakdown(hackathonId: number): Promise<{
    fresh_code: number;
    existing_code: number;
    null_type: number;
  }> {
    // Get all projects for this hackathon
    const { data: projects, error: projectsError } = await this.supabase
      .from(this.table)
      .select("project_code_type")
      .eq("hackathon_id", hackathonId);

    if (projectsError) {
      throw new Error(`Failed to fetch projects: ${projectsError.message}`);
    }

    // Count projects by type
    let fresh_code = 0;
    let existing_code = 0;
    let null_type = 0;

    projects?.forEach((project) => {
      if (project.project_code_type === "fresh_code") {
        fresh_code++;
      } else if (project.project_code_type === "existing_code") {
        existing_code++;
      } else {
        null_type++;
      }
    });

    return {
      fresh_code,
      existing_code,
      null_type,
    };
  }

  // Get hackathon submissions per challenge for recap projects
  async getHackathonSubmissionsPerChallenge(hackathonId: number): Promise<
    {
      challenge_name: string;
      submitted_projects: number;
    }[]
  > {
    const { data, error } = await this.supabase
      .from("hackathon_challenges")
      .select(
        `
        challenge_name,
        project_challenges!inner(
          project_id,
          projects!inner(
            id,
            submitted
          )
        )
      `
      )
      .eq("hackathon_id", hackathonId)
      .eq("project_challenges.projects.submitted", true);

    if (error) {
      throw new Error(`Failed to fetch submissions per challenge: ${error.message}`);
    }

    // Process the data to count distinct projects per challenge
    const challengeCounts = new Map<string, Set<number>>();

    data?.forEach((challenge) => {
      const challengeName = challenge.challenge_name;
      if (!challengeCounts.has(challengeName)) {
        challengeCounts.set(challengeName, new Set());
      }

      challenge.project_challenges?.forEach((pc: any) => {
        if (pc.projects?.submitted) {
          challengeCounts.get(challengeName)!.add(pc.project_id);
        }
      });
    });

    // Convert to the expected format and sort by submitted_projects DESC
    const result = Array.from(challengeCounts.entries())
      .map(([challenge_name, projectIds]) => ({
        challenge_name,
        submitted_projects: projectIds.size,
      }))
      .sort((a, b) => b.submitted_projects - a.submitted_projects);

    return result;
  }

  // Get hackathon technologies count for recap analytics
  async getHackathonTechnologiesCount(hackathonId: number): Promise<
    {
      technology: string;
      usage_count: number;
      usage_percentage: number;
    }[]
  > {
    // Get all projects for this hackathon with their technologies
    const { data: projects, error: projectsError } = await this.supabase
      .from(this.table)
      .select("technologies")
      .eq("hackathon_id", hackathonId);

    if (projectsError) {
      throw new Error(`Failed to fetch projects technologies: ${projectsError.message}`);
    }

    // Count technology usage
    const technologyCounts = new Map<string, number>();
    let totalTechnologies = 0;

    projects?.forEach((project) => {
      if (project.technologies && Array.isArray(project.technologies)) {
        project.technologies.forEach((tech: string) => {
          if (tech && tech.trim()) {
            const normalizedTech = tech.trim();
            technologyCounts.set(normalizedTech, (technologyCounts.get(normalizedTech) || 0) + 1);
            totalTechnologies++;
          }
        });
      }
    });

    // Convert to array with percentages and sort by usage count DESC
    const result = Array.from(technologyCounts.entries())
      .map(([technology, usage_count]) => ({
        technology,
        usage_count,
        usage_percentage:
          totalTechnologies > 0 ? Number(((usage_count / totalTechnologies) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.usage_count - a.usage_count);

    return result;
  }

  // Get hackathon technologies used for recap analytics
  async getHackathonTechnologiesUsed(hackathonId: number): Promise<string[]> {
    // Get all projects for this hackathon with their technologies
    const { data: projects, error: projectsError } = await this.supabase
      .from(this.table)
      .select("technologies")
      .eq("hackathon_id", hackathonId);

    if (projectsError) {
      throw new Error(`Failed to fetch projects technologies: ${projectsError.message}`);
    }

    // Collect all unique technologies
    const technologiesSet = new Set<string>();

    projects?.forEach((project) => {
      if (project.technologies && Array.isArray(project.technologies)) {
        project.technologies.forEach((tech: string) => {
          if (tech && tech.trim()) {
            technologiesSet.add(tech.trim());
          }
        });
      }
    });

    // Convert to sorted array
    return Array.from(technologiesSet).sort();
  }

  // Get hackathon judging criteria scores for recap analytics
  async getHackathonJudgingCriteriaScores(
    hackathonId: number,
    challengeIds: number[]
  ): Promise<
    {
      challenge_id: number;
      challenge_name: string;
      avg_technical: number;
      avg_ux: number;
      avg_innovation: number;
      avg_business: number;
      avg_overall_score: number;
      total_project_submissions: number;
    }[]
  > {
    const { data, error } = await this.supabase
      .from("judging_entries")
      .select(
        `
              challenge_id,
              hackathon_challenges!inner(challenge_name, hackathon_id),
              technical_score,
              ux_score,
              innovation_score,
              business_score,
              score,
              project_id,
              judging_status
            `
      )
      .eq("judging_status", "judged")
      .eq("hackathon_challenges.hackathon_id", hackathonId)
      .in("challenge_id", challengeIds);

    if (error) {
      throw new Error(`Failed to fetch judging entries: ${error.message}`);
    }

    // Group by challenge_id and calculate averages
    const challengeGroups = new Map<
      number,
      {
        challenge_name: string;
        technical_scores: number[];
        ux_scores: number[];
        innovation_scores: number[];
        business_scores: number[];
        overall_scores: number[];
        project_ids: Set<number>;
      }
    >();

    data?.forEach((entry) => {
      const challengeId = entry.challenge_id;
      const challengeName = entry.hackathon_challenges?.challenge_name;

      if (!challengeGroups.has(challengeId)) {
        challengeGroups.set(challengeId, {
          challenge_name: challengeName || "",
          technical_scores: [],
          ux_scores: [],
          innovation_scores: [],
          business_scores: [],
          overall_scores: [],
          project_ids: new Set(),
        });
      }

      const group = challengeGroups.get(challengeId)!;

      // Parse numeric values and add to arrays
      if (entry.technical_score !== null && entry.technical_score !== undefined) {
        const val = parseFloat(entry.technical_score.toString());
        if (!isNaN(val)) group.technical_scores.push(val);
      }

      if (entry.ux_score !== null && entry.ux_score !== undefined) {
        const val = parseFloat(entry.ux_score.toString());
        if (!isNaN(val)) group.ux_scores.push(val);
      }

      if (entry.innovation_score !== null && entry.innovation_score !== undefined) {
        const val = parseFloat(entry.innovation_score.toString());
        if (!isNaN(val)) group.innovation_scores.push(val);
      }

      if (entry.business_score !== null && entry.business_score !== undefined) {
        const val = parseFloat(entry.business_score.toString());
        if (!isNaN(val)) group.business_scores.push(val);
      }

      if (entry.score !== null && entry.score !== undefined) {
        const val = parseFloat(entry.score.toString());
        if (!isNaN(val)) group.overall_scores.push(val);
      }

      group.project_ids.add(entry.project_id);
    });

    // Calculate averages and return results
    const result = Array.from(challengeGroups.entries())
      .map(([challenge_id, group]) => ({
        challenge_id,
        challenge_name: group.challenge_name,
        avg_technical:
          group.technical_scores.length > 0
            ? Number(
                (
                  group.technical_scores.reduce((sum, val) => sum + val, 0) /
                  group.technical_scores.length
                ).toFixed(2)
              )
            : 0,
        avg_ux:
          group.ux_scores.length > 0
            ? Number(
                (
                  group.ux_scores.reduce((sum, val) => sum + val, 0) / group.ux_scores.length
                ).toFixed(2)
              )
            : 0,
        avg_innovation:
          group.innovation_scores.length > 0
            ? Number(
                (
                  group.innovation_scores.reduce((sum, val) => sum + val, 0) /
                  group.innovation_scores.length
                ).toFixed(2)
              )
            : 0,
        avg_business:
          group.business_scores.length > 0
            ? Number(
                (
                  group.business_scores.reduce((sum, val) => sum + val, 0) /
                  group.business_scores.length
                ).toFixed(2)
              )
            : 0,
        avg_overall_score:
          group.overall_scores.length > 0
            ? Number(
                (
                  group.overall_scores.reduce((sum, val) => sum + val, 0) /
                  group.overall_scores.length
                ).toFixed(2)
              )
            : 0,
        total_project_submissions: group.project_ids.size,
      }))
      .sort((a, b) => a.challenge_name.localeCompare(b.challenge_name));

    return result;
  }

  // Get hackathon prizes per winning projects for recap analytics
  async getHackathonPrizesPerWinningProjects(hackathonId: number): Promise<
    {
      project_name: string;
      prizes_won: number;
    }[]
  > {
    const { data, error } = await this.supabase
      .from("project_challenges")
      .select(
        `
              prize_id,
              projects!inner(
                name,
                hackathon_id
              )
            `
      )
      .not("prize_id", "is", null)
      .eq("projects.hackathon_id", hackathonId);

    if (error) {
      throw new Error(`Failed to fetch prizes per winning projects: ${error.message}`);
    }

    // Group by project name and count prizes
    const projectGroups = new Map<string, number>();

    data?.forEach((entry) => {
      const projectName = entry.projects?.name;
      if (projectName) {
        projectGroups.set(projectName, (projectGroups.get(projectName) || 0) + 1);
      }
    });

    // Convert to array and sort by prizes won (descending)
    const result = Array.from(projectGroups.entries())
      .map(([project_name, prizes_won]) => ({
        project_name,
        prizes_won,
      }))
      .sort((a, b) => b.prizes_won - a.prizes_won);

    return result;
  }

  // Get hackathon winning project per prize for recap analytics
  async getHackathonWinningProjectPerPrize(
    hackathonId: number,
    challengeIds: number[]
  ): Promise<
    {
      challenge_name: string;
      prize_title: string;
      company_partner_logo: string | null;
      prize_usd: number | null;
      rank: number | null;
      prize_custom: string | null;
      project_name: string | null;
      project_picture: string | null;
      project_score: number | null;
    }[]
  > {
    const { data, error } = await this.supabase
      .from("hackathon_challenge_bounties")
      .select(
        `
              title,
              company_partner_logo,
              prize_usd,
              rank,
              prize_custom,
              challenge_id,
              hackathon_challenges!inner(
                challenge_name,
                hackathon_id
              ),
              project_challenges(
                projects(
                  id,
                  name,
                  project_url
                )
              )
            `
      )
      .eq("hackathon_challenges.hackathon_id", hackathonId)
      .in("hackathon_challenges.id", challengeIds);

    if (error) {
      throw new Error(`Failed to fetch winning project per prize: ${error.message}`);
    }

    // Get judging entries separately for projects that won prizes
    const projectIds =
      data?.flatMap(
        (entry) => entry.project_challenges?.map((pc) => pc.projects?.id).filter(Boolean) || []
      ) || [];

    let judgingEntries: any[] = [];
    if (projectIds.length > 0) {
      const { data: judgingData, error: judgingError } = await this.supabase
        .from("judging_entries")
        .select(
          `
                score,
                project_id,
                challenge_id,
                judging_status
              `
        )
        .eq("judging_status", "judged")
        .in("project_id", projectIds)
        .in("challenge_id", challengeIds);

      if (judgingError) {
        throw new Error(`Failed to fetch judging entries: ${judgingError.message}`);
      }
      judgingEntries = judgingData || [];
    }

    // Transform the data to match the expected format
    const result =
      data?.map((entry) => {
        const projectChallenge = entry.project_challenges?.[0];
        const project = projectChallenge?.projects;
        const judgingEntry = judgingEntries.find(
          (je) => je.project_id === project?.id && je.challenge_id === entry.challenge_id
        );

        return {
          challenge_name: entry.hackathon_challenges?.challenge_name || "",
          prize_title: entry.title || "",
          company_partner_logo: entry.company_partner_logo,
          prize_usd: entry.prize_usd,
          rank: entry.rank,
          prize_custom: entry.prize_custom,
          project_name: project?.name || null,
          project_picture: project?.project_url || null,
          project_score: judgingEntry?.score || null,
        };
      }) || [];

    // Sort by challenge name and rank
    return result.sort((a, b) => {
      if (a.challenge_name !== b.challenge_name) {
        return a.challenge_name.localeCompare(b.challenge_name);
      }
      return (a.rank || 0) - (b.rank || 0);
    });
  }

  // Get hackathon prize and payment analytics
  async getHackathonPrizeAndPayment(
    hackathonId: number,
    challengeIds: number[]
  ): Promise<{
    overview_text: string;
    total_teams_receiving_prize: number;
    total_individuals_receiving_prize: number;
  }> {
    // Replace with AI generated text retrieved from bot
    const overviewText =
      "Track how your bounty money moved through the system — who got paid, when, and in what currency. Also includes payout logistics to help you track future compliance and finance workflows.";

    // Get total teams receiving prizes for the specified challenges
    const { data: teamsData, error: teamsError } = await this.supabase
      .from("project_challenges")
      .select(
        `
        project_id,
        projects!inner(
          hackathon_id
        ),
        hackathon_challenges!inner(
          id
        )
      `
      )
      .not("prize_id", "is", null)
      .eq("projects.hackathon_id", hackathonId)
      .in("hackathon_challenges.id", challengeIds);

    if (teamsError) {
      throw new Error(`Failed to fetch teams receiving prizes: ${teamsError.message}`);
    }

    // Count distinct project IDs
    const uniqueProjectIds = new Set(teamsData?.map((entry) => entry.project_id) || []);
    const totalTeamsReceivingPrize = uniqueProjectIds.size;

    // Get total individuals receiving prizes for the specified challenges
    const { data: individualsData, error: individualsError } = await this.supabase
      .from("project_challenges")
      .select(
        `
        project_id,
        projects!inner(
          hackathon_id,
          project_team_members!inner(
            user_id
          )
        ),
        hackathon_challenges!inner(
          id
        )
      `
      )
      .not("prize_id", "is", null)
      .eq("projects.hackathon_id", hackathonId)
      .in("hackathon_challenges.id", challengeIds);

    if (individualsError) {
      throw new Error(`Failed to fetch individuals receiving prizes: ${individualsError.message}`);
    }

    // Count distinct user IDs
    const uniqueUserIds = new Set();
    individualsData?.forEach((entry) => {
      entry.projects?.project_team_members?.forEach((member: any) => {
        if (member.user_id) {
          uniqueUserIds.add(member.user_id);
        }
      });
    });
    const totalIndividualsReceivingPrize = uniqueUserIds.size;

    return {
      overview_text: overviewText,
      total_teams_receiving_prize: totalTeamsReceivingPrize,
      total_individuals_receiving_prize: totalIndividualsReceivingPrize,
    };
  }

  // Get hackathon project submissions analytics
  async getHackathonProjectSubmissions(hackathonId: number): Promise<{
    overview_text: string;
    total_projects_submitted: number;
    total_project_challenge_pairs: number;
    most_used_technology: string;
    avg_projects_per_participant: number;
    challenge_with_most_submissions: string;
  }> {
    // Replace with AI generated text retrieved from bot
    const overviewText =
      "This is the core of your hackathon: what builders created. Track the volume, variety, and quality of submissions. You'll also get a sense of how many builders aligned with your bounties and product goals.";

    // Get total projects submitted for this hackathon
    const { count: totalProjectsSubmitted, error: projectsError } = await this.supabase
      .from(this.table)
      .select("*", { count: "exact", head: true })
      .eq("hackathon_id", hackathonId)
      .eq("submitted", true);

    if (projectsError) {
      throw new Error(`Failed to count submitted projects: ${projectsError.message}`);
    }

    // Get total project-challenge pairs for submitted projects
    const { data: submittedProjects, error: submittedProjectsError } = await this.supabase
      .from(this.table)
      .select("id")
      .eq("hackathon_id", hackathonId)
      .eq("submitted", true);

    if (submittedProjectsError) {
      throw new Error(`Failed to fetch submitted projects: ${submittedProjectsError.message}`);
    }

    const submittedProjectIds = submittedProjects?.map((p) => p.id) || [];
    let totalProjectChallengePairs = 0;

    if (submittedProjectIds.length > 0) {
      const { count: pairsCount, error: pairsError } = await this.supabase
        .from("project_challenges")
        .select("*", { count: "exact", head: true })
        .in("project_id", submittedProjectIds);

      if (pairsError) {
        throw new Error(`Failed to count project-challenge pairs: ${pairsError.message}`);
      }

      totalProjectChallengePairs = pairsCount || 0;
    }

    // Get most used technology
    const { data: technologiesData, error: technologiesError } = await this.supabase
      .from(this.table)
      .select("technologies")
      .eq("hackathon_id", hackathonId);

    if (technologiesError) {
      throw new Error(`Failed to fetch technologies: ${technologiesError.message}`);
    }

    const technologyCounts = new Map<string, number>();
    technologiesData?.forEach((project) => {
      if (project.technologies && Array.isArray(project.technologies)) {
        project.technologies.forEach((tech: string) => {
          if (tech && tech.trim()) {
            const normalizedTech = tech.trim();
            technologyCounts.set(normalizedTech, (technologyCounts.get(normalizedTech) || 0) + 1);
          }
        });
      }
    });

    const mostUsedTechnology =
      technologyCounts.size > 0
        ? Array.from(technologyCounts.entries()).sort((a, b) => b[1] - a[1])[0][0]
        : "No technologies found";

    // Get average projects per participant
    const { data: participantsData, error: participantsError } = await this.supabase
      .from("project_team_members")
      .select(
        `
        user_id,
        projects!inner(
          hackathon_id,
          submitted
        )
      `
      )
      .eq("projects.hackathon_id", hackathonId)
      .eq("projects.submitted", true)
      .eq("status", "confirmed");

    if (participantsError) {
      throw new Error(`Failed to fetch participants: ${participantsError.message}`);
    }

    const participantProjectCounts = new Map<string, number>();
    participantsData?.forEach((member) => {
      const userId = member.user_id;
      participantProjectCounts.set(userId, (participantProjectCounts.get(userId) || 0) + 1);
    });

    const avgProjectsPerParticipant =
      participantProjectCounts.size > 0
        ? Number(
            (
              Array.from(participantProjectCounts.values()).reduce((sum, count) => sum + count, 0) /
              participantProjectCounts.size
            ).toFixed(2)
          )
        : 0;

    // Get challenge with most submissions
    const { data: challengeData, error: challengeError } = await this.supabase
      .from("hackathon_challenges")
      .select(
        `
        challenge_name,
        project_challenges!inner(
          project_id,
          projects!inner(
            hackathon_id,
            submitted
          )
        )
      `
      )
      .eq("hackathon_id", hackathonId)
      .eq("project_challenges.projects.submitted", true);

    if (challengeError) {
      throw new Error(`Failed to fetch challenge submissions: ${challengeError.message}`);
    }

    const challengeCounts = new Map<string, Set<number>>();
    challengeData?.forEach((challenge) => {
      const challengeName = challenge.challenge_name;
      if (!challengeCounts.has(challengeName)) {
        challengeCounts.set(challengeName, new Set());
      }

      challenge.project_challenges?.forEach((pc: any) => {
        if (pc.projects?.submitted) {
          challengeCounts.get(challengeName)!.add(pc.project_id);
        }
      });
    });

    const challengeWithMostSubmissions =
      challengeCounts.size > 0
        ? Array.from(challengeCounts.entries()).sort((a, b) => b[1].size - a[1].size)[0][0]
        : "No challenges found";

    return {
      overview_text: overviewText,
      total_projects_submitted: totalProjectsSubmitted || 0,
      total_project_challenge_pairs: totalProjectChallengePairs,
      most_used_technology: mostUsedTechnology,
      avg_projects_per_participant: avgProjectsPerParticipant,
      challenge_with_most_submissions: challengeWithMostSubmissions,
    };
  }

  // Get hackathon judging and winners analytics
  async getHackathonJudgingAndWinners(
    hackathonId: number,
    challengeIds: number[]
  ): Promise<{
    overview_text: string;
    judged_project_challenge_pairs: number;
    number_of_judges: number;
    average_score_stats: {
      mean: number;
      median: number;
      mode: number;
    };
    judgebot_vs_judge_score_difference: number;
  }> {
    // Replace with AI generated text retrieved from bot
    const overviewText =
      "Who rose to the top? This section outlines how projects were judged and what stood out to the experts. Use this to assess signal from the noise and recognize the value created by top teams.";

    // Get number of project-challenge pairs for the given challenges
    // This should count all project-challenge pairs that exist for the specified challenges
    const { data: projectChallengePairsData, error: projectChallengePairsError } =
      await this.supabase
        .from("project_challenges")
        .select(
          `
        project_id,
        challenge_id,
        projects!inner(
          hackathon_id,
          submitted
        ),
        hackathon_challenges!inner(
          hackathon_id
        )
      `
        )
        .eq("projects.hackathon_id", hackathonId)
        .eq("projects.submitted", true)
        .eq("hackathon_challenges.hackathon_id", hackathonId)
        .in("challenge_id", challengeIds);

    if (projectChallengePairsError) {
      throw new Error(
        `Failed to fetch project-challenge pairs: ${projectChallengePairsError.message}`
      );
    }

    // Count distinct project-challenge pairs
    const projectChallengePairsSet = new Set();
    projectChallengePairsData?.forEach((entry) => {
      projectChallengePairsSet.add(`${entry.project_id}-${entry.challenge_id}`);
    });
    const judgedProjectChallengePairs = projectChallengePairsSet.size;

    // Get number of judges for the given challenges using judgings and judging_challenges tables
    const { data: judgesData, error: judgesError } = await this.supabase
      .from("judgings")
      .select(
        `
        user_id,
        judging_challenges!inner(
          challenge_id
        )
      `
      )
      .eq("hackathon_id", hackathonId)
      .in("judging_challenges.challenge_id", challengeIds);

    if (judgesError) {
      throw new Error(`Failed to fetch judges: ${judgesError.message}`);
    }

    // Count distinct judges
    const judgesSet = new Set();
    judgesData?.forEach((entry) => {
      if (entry.user_id) {
        judgesSet.add(entry.user_id);
      }
    });
    const numberOfJudges = judgesSet.size;

    // Get average score stats (mean, median, mode) across submissions
    const { data: scoresData, error: scoresError } = await this.supabase
      .from("judging_entries")
      .select(
        `
        score,
        hackathon_challenges!inner(
          hackathon_id
        )
      `
      )
      .eq("judging_status", "judged")
      .eq("hackathon_challenges.hackathon_id", hackathonId)
      .in("challenge_id", challengeIds);

    if (scoresError) {
      throw new Error(`Failed to fetch scores: ${scoresError.message}`);
    }

    const scores =
      scoresData
        ?.map((entry) => parseFloat(entry.score.toString()))
        .filter((score) => !isNaN(score)) || [];

    let mean = 0;
    let median = 0;
    let mode = 0;

    if (scores.length > 0) {
      // Calculate mean
      mean = Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2));

      // Calculate median
      const sortedScores = [...scores].sort((a, b) => a - b);
      const mid = Math.floor(sortedScores.length / 2);
      median =
        sortedScores.length % 2 === 0
          ? Number(((sortedScores[mid - 1] + sortedScores[mid]) / 2).toFixed(2))
          : Number(sortedScores[mid].toFixed(2));

      // Calculate mode
      const scoreCounts = new Map<number, number>();
      scores.forEach((score) => {
        scoreCounts.set(score, (scoreCounts.get(score) || 0) + 1);
      });
      const maxCount = Math.max(...scoreCounts.values());
      const modeScores = Array.from(scoreCounts.entries())
        .filter(([_, count]) => count === maxCount)
        .map(([score, _]) => score);
      mode = Number(modeScores[0].toFixed(2));
    }

    // Get judge scores for the JudgeBot comparison
    const { data: judgeScoresData, error: judgeScoresError } = await this.supabase
      .from("judging_entries")
      .select(
        `
        challenge_id,
        project_id,
        score,
        hackathon_challenges!inner(
          hackathon_id
        )
      `
      )
      .eq("judging_status", "judged")
      .eq("hackathon_challenges.hackathon_id", hackathonId)
      .in("challenge_id", challengeIds);

    if (judgeScoresError) {
      throw new Error(`Failed to fetch judge scores: ${judgeScoresError.message}`);
    }

    // Get JudgeBot vs Judge score difference
    // Try to get all JudgeBot scores for the hackathon first, then filter
    const { data: judgeBotData, error: judgeBotError } = await this.supabase
      .from("judging_bot_scores")
      .select(
        `
        project_id,
        challenge_id,
        score,
        hackathon_challenges!inner(
          hackathon_id
        )
      `
      )
      .eq("hackathon_challenges.hackathon_id", hackathonId)
      .in("challenge_id", challengeIds);

    if (judgeBotError) {
      throw new Error(`Failed to fetch JudgeBot scores: ${judgeBotError.message}`);
    }

    // Get judge scores for the same project-challenge pairs
    const judgeBotPairs = new Map<string, number>();
    judgeBotData?.forEach((entry) => {
      const key = `${entry.project_id}-${entry.challenge_id}`;
      judgeBotPairs.set(key, parseFloat(entry.score.toString()));
    });

    const judgePairs = new Map<string, number>();
    judgeScoresData?.forEach((entry) => {
      const key = `${entry.project_id}-${entry.challenge_id}`;
      const score = parseFloat(entry.score?.toString() || "0");
      if (!isNaN(score)) {
        judgePairs.set(key, score);
      }
    });

    // Calculate average difference
    let judgebotVsJudgeScoreDifference = 0;
    const commonPairs = Array.from(judgeBotPairs.keys()).filter((key) => judgePairs.has(key));

    if (commonPairs.length > 0) {
      const differences = commonPairs.map((key) => {
        const botScore = judgeBotPairs.get(key) || 0;
        const judgeScore = judgePairs.get(key) || 0;
        return botScore - judgeScore;
      });

      judgebotVsJudgeScoreDifference = Number(
        (differences.reduce((sum, diff) => sum + diff, 0) / differences.length).toFixed(2)
      );
    }

    return {
      overview_text: overviewText,
      judged_project_challenge_pairs: judgedProjectChallengePairs,
      number_of_judges: numberOfJudges,
      average_score_stats: {
        mean,
        median,
        mode,
      },
      judgebot_vs_judge_score_difference: judgebotVsJudgeScoreDifference,
    };
  }

  // Get hackathon total per score summary analytics
  async getHackathonTotalPerScoreSummary(
    hackathonId: number,
    challengeIds: number[]
  ): Promise<
    {
      challenge_id: number;
      total_project_submissions: number;
      judge_mean_score: number;
      judge_median_score: number;
      judge_mode_score: number;
      bot_mean_score: number;
      bot_median_score: number;
      bot_mode_score: number;
    }[]
  > {
    // Get challenge projects (submitted projects for given challenges)
    const { data: challengeProjectsData, error: challengeProjectsError } = await this.supabase
      .from("project_challenges")
      .select(
        `
        challenge_id,
        projects!inner(
          id,
          hackathon_id,
          submitted
        )
      `
      )
      .eq("projects.hackathon_id", hackathonId)
      .eq("projects.submitted", true)
      .in("challenge_id", challengeIds);

    if (challengeProjectsError) {
      throw new Error(`Failed to fetch challenge projects: ${challengeProjectsError.message}`);
    }

    // Group by challenge_id and collect project IDs
    const challengeProjectMap = new Map<number, Set<number>>();
    challengeProjectsData?.forEach((entry) => {
      const challengeId = entry.challenge_id;
      const projectId = entry.projects?.id;

      if (!challengeProjectMap.has(challengeId)) {
        challengeProjectMap.set(challengeId, new Set());
      }

      if (projectId) {
        challengeProjectMap.get(challengeId)!.add(projectId);
      }
    });

    // Get judge scores for all project-challenge pairs
    const { data: judgeScoresData, error: judgeScoresError } = await this.supabase
      .from("judging_entries")
      .select(
        `
        challenge_id,
        project_id,
        score,
        judging_status
      `
      )
      .eq("judging_status", "judged")
      .in("challenge_id", challengeIds);

    if (judgeScoresError) {
      throw new Error(`Failed to fetch judge scores: ${judgeScoresError.message}`);
    }

    // Get bot scores for all project-challenge pairs
    const { data: botScoresData, error: botScoresError } = await this.supabase
      .from("judging_bot_scores")
      .select(
        `
        challenge_id,
        project_id,
        score
      `
      )
      .in("challenge_id", challengeIds);

    if (botScoresError) {
      throw new Error(`Failed to fetch bot scores: ${botScoresError.message}`);
    }

    // Group scores by challenge_id
    const judgeScoresByChallenge = new Map<number, number[]>();
    const botScoresByChallenge = new Map<number, number[]>();

    judgeScoresData?.forEach((entry) => {
      const challengeId = entry.challenge_id;
      const score = parseFloat(entry.score?.toString() || "0");

      if (!isNaN(score)) {
        if (!judgeScoresByChallenge.has(challengeId)) {
          judgeScoresByChallenge.set(challengeId, []);
        }
        judgeScoresByChallenge.get(challengeId)!.push(score);
      }
    });

    botScoresData?.forEach((entry) => {
      const challengeId = entry.challenge_id;
      const score = parseFloat(entry.score?.toString() || "0");

      if (!isNaN(score)) {
        if (!botScoresByChallenge.has(challengeId)) {
          botScoresByChallenge.set(challengeId, []);
        }
        botScoresByChallenge.get(challengeId)!.push(score);
      }
    });

    // Calculate statistics for each challenge
    const result = Array.from(challengeProjectMap.entries()).map(([challenge_id, projectIds]) => {
      const totalProjectSubmissions = projectIds.size;
      const judgeScores = judgeScoresByChallenge.get(challenge_id) || [];
      const botScores = botScoresByChallenge.get(challenge_id) || [];

      // Calculate judge statistics
      let judgeMeanScore = 0;
      let judgeMedianScore = 0;
      let judgeModeScore = 0;

      if (judgeScores.length > 0) {
        judgeMeanScore = Number(
          (judgeScores.reduce((sum, score) => sum + score, 0) / judgeScores.length).toFixed(2)
        );

        const sortedJudgeScores = [...judgeScores].sort((a, b) => a - b);
        const mid = Math.floor(sortedJudgeScores.length / 2);
        judgeMedianScore =
          sortedJudgeScores.length % 2 === 0
            ? Number(((sortedJudgeScores[mid - 1] + sortedJudgeScores[mid]) / 2).toFixed(2))
            : Number(sortedJudgeScores[mid].toFixed(2));

        const judgeScoreCounts = new Map<number, number>();
        judgeScores.forEach((score) => {
          judgeScoreCounts.set(score, (judgeScoreCounts.get(score) || 0) + 1);
        });
        const maxJudgeCount = Math.max(...judgeScoreCounts.values());
        const judgeModeScores = Array.from(judgeScoreCounts.entries())
          .filter(([_, count]) => count === maxJudgeCount)
          .map(([score, _]) => score);
        judgeModeScore = Number(judgeModeScores[0].toFixed(2));
      }

      // Calculate bot statistics
      let botMeanScore = 0;
      let botMedianScore = 0;
      let botModeScore = 0;

      if (botScores.length > 0) {
        botMeanScore = Number(
          (botScores.reduce((sum, score) => sum + score, 0) / botScores.length).toFixed(2)
        );

        const sortedBotScores = [...botScores].sort((a, b) => a - b);
        const mid = Math.floor(sortedBotScores.length / 2);
        botMedianScore =
          sortedBotScores.length % 2 === 0
            ? Number(((sortedBotScores[mid - 1] + sortedBotScores[mid]) / 2).toFixed(2))
            : Number(sortedBotScores[mid].toFixed(2));

        const botScoreCounts = new Map<number, number>();
        botScores.forEach((score) => {
          botScoreCounts.set(score, (botScoreCounts.get(score) || 0) + 1);
        });
        const maxBotCount = Math.max(...botScoreCounts.values());
        const botModeScores = Array.from(botScoreCounts.entries())
          .filter(([_, count]) => count === maxBotCount)
          .map(([score, _]) => score);
        botModeScore = Number(botModeScores[0].toFixed(2));
      }

      return {
        challenge_id,
        total_project_submissions: totalProjectSubmissions,
        judge_mean_score: judgeMeanScore,
        judge_median_score: judgeMedianScore,
        judge_mode_score: judgeModeScore,
        bot_mean_score: botMeanScore,
        bot_median_score: botMedianScore,
        bot_mode_score: botModeScore,
      };
    });

    // Sort by challenge_id
    return result.sort((a, b) => a.challenge_id - b.challenge_id);
  }

  // Get hackathon total per score chart analytics
  async getHackathonTotalPerScoreChart(
    hackathonId: number,
    challengeIds: number[]
  ): Promise<
    {
      challenge_id: number;
      score_distribution: {
        score_range: string;
        judge_count: number;
        bot_count: number;
      }[];
    }[]
  > {
    // Get challenge projects (submitted projects for given challenges)
    const { data: challengeProjectsData, error: challengeProjectsError } = await this.supabase
      .from("project_challenges")
      .select(
        `
        challenge_id,
        projects!inner(
          id,
          hackathon_id,
          submitted
        )
      `
      )
      .eq("projects.hackathon_id", hackathonId)
      .eq("projects.submitted", true)
      .in("challenge_id", challengeIds);

    if (challengeProjectsError) {
      throw new Error(`Failed to fetch challenge projects: ${challengeProjectsError.message}`);
    }

    // Group by challenge_id and collect project IDs
    const challengeProjectMap = new Map<number, Set<number>>();
    challengeProjectsData?.forEach((entry) => {
      const challengeId = entry.challenge_id;
      const projectId = entry.projects?.id;

      if (!challengeProjectMap.has(challengeId)) {
        challengeProjectMap.set(challengeId, new Set());
      }

      if (projectId) {
        challengeProjectMap.get(challengeId)!.add(projectId);
      }
    });

    // Get judge scores for all project-challenge pairs
    const { data: judgeScoresData, error: judgeScoresError } = await this.supabase
      .from("judging_entries")
      .select(
        `
        challenge_id,
        project_id,
        score,
        judging_status
      `
      )
      .eq("judging_status", "judged")
      .in("challenge_id", challengeIds);

    if (judgeScoresError) {
      throw new Error(`Failed to fetch judge scores: ${judgeScoresError.message}`);
    }

    // Get bot scores for all project-challenge pairs
    const { data: botScoresData, error: botScoresError } = await this.supabase
      .from("judging_bot_scores")
      .select(
        `
        challenge_id,
        project_id,
        score
      `
      )
      .in("challenge_id", challengeIds);

    if (botScoresError) {
      throw new Error(`Failed to fetch bot scores: ${botScoresError.message}`);
    }

    // Group scores by challenge_id
    const judgeScoresByChallenge = new Map<number, number[]>();
    const botScoresByChallenge = new Map<number, number[]>();

    judgeScoresData?.forEach((entry) => {
      const challengeId = entry.challenge_id;
      const score = parseFloat(entry.score?.toString() || "0");

      if (!isNaN(score)) {
        if (!judgeScoresByChallenge.has(challengeId)) {
          judgeScoresByChallenge.set(challengeId, []);
        }
        judgeScoresByChallenge.get(challengeId)!.push(score);
      }
    });

    botScoresData?.forEach((entry) => {
      const challengeId = entry.challenge_id;
      const score = parseFloat(entry.score?.toString() || "0");

      if (!isNaN(score)) {
        if (!botScoresByChallenge.has(challengeId)) {
          botScoresByChallenge.set(challengeId, []);
        }
        botScoresByChallenge.get(challengeId)!.push(score);
      }
    });

    // Helper function to count scores in a range
    const countScoresInRange = (scores: number[], min: number, max: number): number => {
      return scores.filter((score) => score >= min && score < max).length;
    };

    // Generate score ranges (0-1, 1-2, 2-3, ..., 9-10)
    const scoreRanges: { min: number; max: number; label: string }[] = [];
    for (let i = 0; i < 10; i++) {
      scoreRanges.push({
        min: i,
        max: i + 1,
        label: `${i}-${i + 1}`,
      });
    }

    // Calculate score distribution for each challenge
    const result = Array.from(challengeProjectMap.entries()).map(([challenge_id, projectIds]) => {
      const judgeScores = judgeScoresByChallenge.get(challenge_id) || [];
      const botScores = botScoresByChallenge.get(challenge_id) || [];

      const scoreDistribution = scoreRanges.map((range) => ({
        score_range: range.label,
        judge_count: countScoresInRange(judgeScores, range.min, range.max),
        bot_count: countScoresInRange(botScores, range.min, range.max),
      }));

      return {
        challenge_id,
        score_distribution: scoreDistribution,
      };
    });

    // Sort by challenge_id
    return result.sort((a, b) => a.challenge_id - b.challenge_id);
  }
}
