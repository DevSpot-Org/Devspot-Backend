import { SupabaseClient } from "@/lib/supabase";
import { Hackathons } from "@/types/entities";
import { ApplicationAndStakingPayload } from "../../projects/types";
import { Sponsor } from "../types";

export class HackathonsRepository {
  private table = "hackathons" as const;

  constructor(private supabase: SupabaseClient) {}

  private buildSelect<T extends keyof Hackathons>(fields?: T[]): string {
    return fields?.length ? fields.map((field) => this.toSnakeCase(String(field))).join(", ") : "*";
  }

  private toSnakeCase(field: string): string {
    return field.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  // Get leaderboard options for a hackathon
  async getLeaderboardOptions(hackathonId: number): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("show_leaderboard_comments, show_leaderboard_score, leaderboard_standing_by")
      .eq("id", hackathonId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch hackathon leaderboard options: ${error.message}`);
    }

    return data;
  }

  async findById<T extends keyof Hackathons>(
    id: number,
    fields?: T[]
  ): Promise<Pick<Hackathons, T> | null> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(this.buildSelect(fields))
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);

    return data as unknown as Pick<Hackathons, T> | null;
  }

  async getHackathonForValidation(hackathonId: number): Promise<any> {
    const { data: hackathon, error: hackathonError } = await this.supabase
      .from("hackathons")
      .select("*")
      .eq("id", hackathonId)
      .single();

    if (hackathonError) {
      throw new Error(`Could not fetch hackathon: ${hackathonError.message}`);
    }

    return hackathon;
  }

  async getDiscoverHackathons(now: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(
        `
            *,
            organizer:technology_owners(*),
            participants:hackathon_participants(count)
        `
      )
      .neq("status", "draft")
      .order("deadline_to_submit", { ascending: true })
      .limit(10);

    if (error) {
      throw new Error(`Failed to fetch discover hackathons: ${error.message}`);
    }

    return data || [];
  }

  async getHackathonsCount(filters?: Record<string, any>): Promise<number> {
    let query = this.supabase.from("hackathons").select("*", { count: "exact", head: true });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      });
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to count hackathons: ${error.message}`);
    }

    return count ?? 0;
  }

  async getParticipantStatuses(
    hackathonIds: number[],
    participantId: string
  ): Promise<Record<number, string | null>> {
    if (!participantId || hackathonIds.length === 0) return {};

    const { data, error } = await this.supabase
      .from("hackathon_participants")
      .select("hackathon_id, application_status")
      .in("hackathon_id", hackathonIds)
      .eq("participant_id", participantId);

    if (error) {
      throw new Error(`Failed to fetch participant statuses: ${error.message}`);
    }

    const result = data || [];

    const response = result.reduce(
      (
        acc: Record<number, string | null>,
        curr: { hackathon_id: number; application_status: string | null }
      ) => {
        acc[curr.hackathon_id] = curr.application_status;
        return acc;
      },
      {} as Record<number, string | null>
    );

    return response;
  }

  async getHackathons(
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<{ hackathons: Hackathons[]; total: number }> {
    const offset = (page - 1) * limit;
    let query = this.supabase
      .from(this.table)
      .select(
        `
            *,
            organizer:technology_owners(*),
            participants:hackathon_participants(count)
        `,
        { count: "exact" }
      )
      .neq("status", "draft");

    if (status && status !== "all") {
      const now = new Date().toISOString();
      switch (status) {
        case "active":
          query = query.lte("start_date", now).gte("end_date", now);
          break;
        case "upcoming":
          query = query.gt("start_date", now);
          break;
        case "past":
          query = query.lt("end_date", now);
          break;
      }
    }

    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch hackathons: ${error.message}`);
    }

    return {
      hackathons: data || [],
      total: count || 0,
    };
  }

  async findByTechnologyOwnerId(technologyOwnerId: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*, organizer:technology_owners(*), participants:hackathon_participants(count)")
      .eq("organizer_id", technologyOwnerId);

    if (error) throw new Error(error.message);

    return data || [];
  }

  async countByTechnologyOwnerId(technologyOwnerId: number): Promise<number> {
    const { count, error } = await this.supabase
      .from(this.table)
      .select("*", { count: "exact", head: true })
      .eq("organizer_id", technologyOwnerId);

    if (error) throw new Error(error.message);

    return count || 0;
  }

  // Get hackathon basic info for recap analytics
  async getHackathonBasicInfo(hackathonId: number): Promise<{
    start_date: string;
    end_date: string;
  }> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("start_date, end_date")
      .eq("id", hackathonId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch hackathon basic info: ${error.message}`);
    }

    return data;
  }

  // Get number of challenges for a hackathon
  async getHackathonChallengesCount(hackathonId: number): Promise<number> {
    const { count, error } = await this.supabase
      .from("hackathon_challenges")
      .select("*", { count: "exact", head: true })
      .eq("hackathon_id", hackathonId);

    if (error) {
      throw new Error(`Failed to count hackathon challenges: ${error.message}`);
    }

    return count || 0;
  }

  // Get total registrations for a hackathon
  async getHackathonTotalRegistrations(hackathonId: number): Promise<number> {
    const { count, error } = await this.supabase
      .from("hackathon_participants")
      .select("*", { count: "exact", head: true })
      .eq("hackathon_id", hackathonId)
      .eq("application_status", "accepted");

    if (error) {
      throw new Error(`Failed to count hackathon registrations: ${error.message}`);
    }

    return count || 0;
  }

  // Get new to DevSpot participants count (users who joined during hackathon duration)
  async getNewToDevSpotCount(hackathonId: number): Promise<number> {
    // First get hackathon dates
    const { data: hackathon, error: hackathonError } = await this.supabase
      .from("hackathons")
      .select("start_date, end_date")
      .eq("id", hackathonId)
      .single();

    if (hackathonError || !hackathon) {
      throw new Error(`Failed to fetch hackathon dates: ${hackathonError?.message}`);
    }

    const { count, error } = await this.supabase
      .from("hackathon_participants")
      .select(
        `
        *,
        users!inner(created_at)
      `,
        { count: "exact", head: true }
      )
      .eq("hackathon_id", hackathonId)
      .eq("application_status", "accepted")
      .gte("users.created_at", hackathon.start_date)
      .lte("users.created_at", hackathon.end_date);

    if (error) {
      throw new Error(`Failed to count new to DevSpot participants: ${error.message}`);
    }

    return count || 0;
  }

  // Get top 3 geographies for a hackathon
  async getTopGeographies(
    hackathonId: number
  ): Promise<Array<{ location: string; count: number }>> {
    const { data, error } = await this.supabase
      .from("hackathon_participants")
      .select(
        `
        users!inner(
          participant_profile(location)
        )
      `
      )
      .eq("hackathon_id", hackathonId)
      .eq("application_status", "accepted");

    if (error) {
      throw new Error(`Failed to fetch participant geographies: ${error.message}`);
    }

    // Group by location and count
    const locationCounts: Record<string, number> = {};
    data?.forEach((participant: any) => {
      // participant_profile is an array, so we need to get the first element
      const profile = participant.users?.participant_profile?.[0];
      const location = profile?.location;
      if (location && location.trim() !== "") {
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      }
    });

    // Sort by count and return top 3
    return Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }

  // Get team statistics for a hackathon
  async getHackathonTeamStats(hackathonId: number): Promise<{
    number_of_solo_hackers: number;
    number_of_teams: number;
    average_team_size: number;
  }> {
    // Get all projects for this hackathon
    const { data: projects, error: projectsError } = await this.supabase
      .from("projects")
      .select(
        `
        id,
        project_team_members!inner(
          id,
          status
        )
      `
      )
      .eq("hackathon_id", hackathonId)
      .eq("submitted", true)
      .eq("project_team_members.status", "confirmed");

    if (projectsError) {
      throw new Error(`Failed to fetch hackathon projects: ${projectsError.message}`);
    }

    // Calculate team statistics
    const teamSizes = projects?.map((project: any) => project.project_team_members.length) || [];
    const number_of_teams = teamSizes.length;
    const number_of_solo_hackers = teamSizes.filter((size) => size === 1).length;
    const average_team_size =
      number_of_teams > 0
        ? Number((teamSizes.reduce((sum, size) => sum + size, 0) / number_of_teams).toFixed(2))
        : 0;

    return {
      number_of_solo_hackers,
      number_of_teams,
      average_team_size,
    };
  }

  // Get sign-ups by location for a hackathon (participants who joined this specific hackathon)
  async getSignUpsByLocation(hackathonId: number): Promise<
    Array<{
      country_name: string;
      signup_count: number;
    }>
  > {
    const { data, error } = await this.supabase
      .from("hackathon_participants")
      .select(
        `
        users!inner(
          participant_profile(location)
        )
      `
      )
      .eq("hackathon_id", hackathonId)
      .eq("application_status", "accepted");

    if (error) {
      throw new Error(`Failed to fetch sign-ups by location: ${error.message}`);
    }

    // Group by country and count
    const countryCounts: Record<string, number> = {};
    data?.forEach((participant: any) => {
      // participant_profile is an array, so we need to get the first element
      const profile = participant.users?.participant_profile?.[0];
      const location = profile?.location;
      if (location && location.trim() !== "") {
        // Extract country name from location (handle cases like "Lagos, Lagos State, Nigeria")
        const countryName = this.extractCountryName(location);
        if (countryName) {
          countryCounts[countryName] = (countryCounts[countryName] || 0) + 1;
        }
      }
    });

    // Sort by count and return all countries
    return Object.entries(countryCounts)
      .map(([country_name, signup_count]) => ({ country_name, signup_count }))
      .sort((a, b) => b.signup_count - a.signup_count);
  }

  // Helper method to extract country name from location string
  private extractCountryName(location: string): string | null {
    if (!location || location.trim() === "") return null;

    // Common country names to look for
    const commonCountries = [
      "Nigeria",
      "India",
      "United States",
      "United Kingdom",
      "Canada",
      "Australia",
      "Germany",
      "France",
      "Brazil",
      "Mexico",
      "Argentina",
      "South Africa",
      "Kenya",
      "Ghana",
      "Egypt",
      "Morocco",
      "Tunisia",
      "Algeria",
      "China",
      "Japan",
      "South Korea",
      "Singapore",
      "Malaysia",
      "Thailand",
      "Philippines",
      "Indonesia",
      "Vietnam",
      "Bangladesh",
      "Pakistan",
      "Russia",
      "Ukraine",
      "Poland",
      "Italy",
      "Spain",
      "Netherlands",
      "Sweden",
      "Norway",
      "Denmark",
      "Finland",
      "Switzerland",
      "Austria",
    ];

    // First, try to find exact country match
    for (const country of commonCountries) {
      if (location.toLowerCase().includes(country.toLowerCase())) {
        return country;
      }
    }

    // If no exact match, try to extract the last part (usually country)
    const parts = location.split(",").map((part) => part.trim());
    if (parts.length > 0) {
      const lastPart = parts[parts.length - 1];
      // If it looks like a country (not a state/province), return it
      if (
        lastPart.length > 2 &&
        !lastPart.toLowerCase().includes("state") &&
        !lastPart.toLowerCase().includes("province")
      ) {
        return lastPart;
      }
    }

    // Fallback: return the original location if we can't extract country
    return location;
  }

  // Get most common skills amongst hackathon participants
  async getMostCommonSkills(hackathonId: number): Promise<
    Array<{
      skill_name: string;
      count: number;
      percentage: number;
    }>
  > {
    const { data, error } = await this.supabase
      .from("hackathon_participants")
      .select(
        `
        users!inner(
          participant_profile(skills)
        )
      `
      )
      .eq("hackathon_id", hackathonId)
      .eq("application_status", "accepted");

    if (error) {
      throw new Error(`Failed to fetch most common skills: ${error.message}`);
    }

    // Count all skills across all participants
    const skillCounts: Record<string, number> = {};
    let totalParticipants = 0;

    data?.forEach((participant: any) => {
      const profile = participant.users?.participant_profile?.[0];
      const skills = profile?.skills;

      if (skills && typeof skills === "object") {
        totalParticipants++;

        // Handle different skill structures
        if (skills.technology && Array.isArray(skills.technology)) {
          skills.technology.forEach((skill: any) => {
            if (typeof skill === "string") {
              skillCounts[skill] = (skillCounts[skill] || 0) + 1;
            } else if (skill && skill.name) {
              skillCounts[skill.name] = (skillCounts[skill.name] || 0) + 1;
            }
          });
        }

        if (skills.experience && Array.isArray(skills.experience)) {
          skills.experience.forEach((skill: any) => {
            if (typeof skill === "string") {
              skillCounts[skill] = (skillCounts[skill] || 0) + 1;
            } else if (skill && skill.name) {
              skillCounts[skill.name] = (skillCounts[skill.name] || 0) + 1;
            }
          });
        }
      }
    });

    // Calculate percentages and sort by count
    return Object.entries(skillCounts)
      .map(([skill_name, count]) => ({
        skill_name,
        count,
        percentage:
          totalParticipants > 0 ? Number(((count / totalParticipants) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }

  // Get attrition data for hackathon participants
  async getAttritionData(hackathonId: number): Promise<{
    number_of_signups: number;
    participants_who_created_project: number;
    attrition_percentage: number;
  }> {
    // Get total signups (people who registered to hackathon)
    const { count: totalSignups, error: signupsError } = await this.supabase
      .from("hackathon_participants")
      .select("*", { count: "exact", head: true })
      .eq("hackathon_id", hackathonId)
      .eq("application_status", "accepted");

    if (signupsError) {
      throw new Error(`Failed to fetch total signups: ${signupsError.message}`);
    }

    // Get participants who created projects by joining projects with project_team_members
    const { data: projectParticipants, error: projectsError } = await this.supabase
      .from("projects")
      .select(
        `
        id,
        project_team_members!inner(user_id)
      `
      )
      .eq("hackathon_id", hackathonId);

    if (projectsError) {
      throw new Error(`Failed to fetch project participants: ${projectsError.message}`);
    }

    // Count unique participants who created projects
    const participantsWithProjects = new Set<string>();
    projectParticipants?.forEach((project: any) => {
      if (project.project_team_members && Array.isArray(project.project_team_members)) {
        project.project_team_members.forEach((member: any) => {
          if (member.user_id) {
            participantsWithProjects.add(member.user_id);
          }
        });
      }
    });

    const participantsWhoCreatedProject = participantsWithProjects.size;
    const signups = totalSignups || 0;

    // Calculate attrition percentage
    const attritionPercentage =
      signups > 0
        ? Number((((signups - participantsWhoCreatedProject) / signups) * 100).toFixed(2))
        : 0;

    return {
      number_of_signups: signups,
      participants_who_created_project: participantsWhoCreatedProject,
      attrition_percentage: attritionPercentage,
    };
  }

  // Get participant feedback averages for hackathon
  async getParticipantFeedbackAverages(hackathonId: number): Promise<{
    overall_hackathon_experience: number;
    likeliness_to_recommend_hackathon: number;
    overall_devspot_experience: number;
    likeliness_to_recommend_devspot: number;
  }> {
    const { data, error } = await this.supabase
      .from("global_hackathon_feedback")
      .select(
        `
        overall_hackathon_rating,
        recommend_hackathon_rating,
        overall_devspot_rating,
        recommend_devspot_rating
      `
      )
      .eq("hackathon_id", hackathonId);

    if (error) {
      throw new Error(`Failed to fetch participant feedback: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return {
        overall_hackathon_experience: 0,
        likeliness_to_recommend_hackathon: 0,
        overall_devspot_experience: 0,
        likeliness_to_recommend_devspot: 0,
      };
    }

    // Calculate averages
    const totalResponses = data.length;
    const overallHackathonSum = data.reduce(
      (sum, feedback) => sum + (feedback.overall_hackathon_rating || 0),
      0
    );
    const recommendHackathonSum = data.reduce(
      (sum, feedback) => sum + (feedback.recommend_hackathon_rating || 0),
      0
    );
    const overallDevSpotSum = data.reduce(
      (sum, feedback) => sum + (feedback.overall_devspot_rating || 0),
      0
    );
    const recommendDevSpotSum = data.reduce(
      (sum, feedback) => sum + (feedback.recommend_devspot_rating || 0),
      0
    );

    return {
      overall_hackathon_experience: Number((overallHackathonSum / totalResponses).toFixed(2)),
      likeliness_to_recommend_hackathon: Number(
        (recommendHackathonSum / totalResponses).toFixed(2)
      ),
      overall_devspot_experience: Number((overallDevSpotSum / totalResponses).toFixed(2)),
      likeliness_to_recommend_devspot: Number((recommendDevSpotSum / totalResponses).toFixed(2)),
    };
  }

  // Get hackathon sponsors for engagement partners analytics
  async getHackathonSponsors(hackathonId: number): Promise<Sponsor[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("sponsors")
      .eq("id", hackathonId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch hackathon sponsors: ${error.message}`);
    }

    return (data?.sponsors as unknown as Sponsor[]) || [];
  }

  // Get hackathon role breakdown for analytics
  async getHackathonRoleBreakdown(
    hackathonId: number
  ): Promise<Array<{ role: string; count: number; percentage: number }>> {
    const { data, error } = await this.supabase
      .from("hackathon_participants")
      .select(
        `
        participant_id,
        users!inner(
          user_participant_roles!inner(
            participant_roles!inner(
              name
            )
          )
        )
      `
      )
      .eq("hackathon_id", hackathonId)
      .eq("application_status", "accepted");

    if (error) {
      throw new Error(`Failed to fetch hackathon role breakdown: ${error.message}`);
    }

    // Count roles
    const roleCounts: Record<string, number> = {};
    let totalParticipants = 0;

    data?.forEach((participant: any) => {
      totalParticipants++;
      participant.users?.user_participant_roles?.forEach((role: any) => {
        if (role.participant_roles?.name) {
          const roleName = role.participant_roles.name;
          roleCounts[roleName] = (roleCounts[roleName] || 0) + 1;
        }
      });
    });

    // Convert to array with percentages
    const roleBreakdown = Object.entries(roleCounts).map(([role, count]) => ({
      role,
      count,
      percentage:
        totalParticipants > 0 ? Number(((count / totalParticipants) * 100).toFixed(2)) : 0,
    }));

    return roleBreakdown;
  }

  // Get hackathon engagement funnel for analytics
  async getHackathonEngagementFunnel(hackathonId: number): Promise<{
    registered: number;
    created_project: number;
    submitted_project: number;
  }> {
    // Get count of people who registered (accepted participants)
    const { data: registered, error: registeredError } = await this.supabase
      .from("hackathon_participants")
      .select("participant_id", { count: "exact" })
      .eq("hackathon_id", hackathonId)
      .eq("application_status", "accepted");

    if (registeredError) {
      throw new Error(`Failed to fetch registered participants: ${registeredError.message}`);
    }

    // Get count of people who created a project
    const { data: createdProject, error: createdProjectError } = await this.supabase
      .from("projects")
      .select("id", { count: "exact" })
      .eq("hackathon_id", hackathonId);

    if (createdProjectError) {
      throw new Error(`Failed to fetch created projects: ${createdProjectError.message}`);
    }

    // Get count of people who submitted a project (only projects with submitted = true)
    const { data: submittedProject, error: submittedProjectError } = await this.supabase
      .from("projects")
      .select("id", { count: "exact" })
      .eq("hackathon_id", hackathonId)
      .eq("submitted", true);

    if (submittedProjectError) {
      throw new Error(`Failed to fetch submitted projects: ${submittedProjectError.message}`);
    }

    return {
      registered: registered?.length || 0,
      created_project: createdProject?.length || 0,
      submitted_project: submittedProject?.length || 0,
    };
  }
  async isOrganizer(hackathonId: number, technologyOwnerId: number): Promise<boolean> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("id")
      .eq("id", hackathonId)
      .eq("organizer_id", technologyOwnerId)
      .maybeSingle();

    if (error) {
      console.error("Failed to verify hackathon ownership:", error.message);
      throw new Error("A database error occurred while verifying ownership.");
    }

    return !!data;
  }
  async updateDescription(hackathonId: number, description: string): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .update({ description })
      .eq("id", hackathonId);

    if (error) {
      console.error("Failed to update hackathon description:", error.message);
      throw new Error("A database error occurred while updating the description.");
    }

    return data;
  }
  async updateApplicationAndStaking(
    hackathonId: number,
    payload: ApplicationAndStakingPayload
  ): Promise<any> {
    const { questions, ...rest } = payload;

    // 1. Update the main hackathon table
    const { data: updatedHackathon, error: updateError } = await this.supabase
      .from(this.table)
      .update({ ...rest })
      .eq("id", hackathonId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Could not update hackathon settings: ${updateError.message}`);
    }

    // 2. Replace the application questions if they are provided
    let finalQuestions: any[] = [];
    if (questions) {
      // First, delete all existing questions for this hackathon
      const { error: deleteError } = await this.supabase
        .from("hackathon_application_questions")
        .delete()
        .eq("hackathon_id", hackathonId);

      if (deleteError) {
        throw new Error(`Failed to remove old application questions: ${deleteError.message}`);
      }

      // Then, insert the new ones, if the array is not empty
      if (questions.length > 0) {
        const { data: insertedQuestions, error: insertError } = await this.supabase
          .from("hackathon_application_questions")
          .insert(
            questions.map((question, index) => ({
              hackathon_id: hackathonId,
              question,
              order: index,
            }))
          )
          .select();

        if (insertError) {
          throw new Error(`Could not insert new application questions: ${insertError.message}`);
        }
        finalQuestions = insertedQuestions;
      }
    }

    return { ...updatedHackathon, questions: finalQuestions };
  }
  async getWithCompletionData(hackathonId: number): Promise<any> {
    const { data: hackathon, error } = await this.supabase
      .from("hackathons")
      .select(
        `
        description,
        registration_start_date,
        deadline_to_join,
        vips:hackathon_vips(count),
        resources:hackathon_resources(count),
        faqs:hackathon_faqs(count),
        sessions:hackathon_sessions(count)
        `
      )
      .eq("id", hackathonId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch hackathon data for completion check: ${error.message}`);
    }

    return hackathon;
  }
  async updateDetails(hackathonId: number, payload: Partial<Hackathons>): Promise<any> {
    const { data, error } = await this.supabase
      .from("hackathons")
      .update(payload)
      .eq("id", hackathonId)
      .select() // Select the updated row to return it
      .single();

    if (error) {
      throw new Error(`Could not update hackathon details: ${error.message}`);
    }

    return data;
  }
}
