import { createClient } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/modules/auth/utils";
import { ProjectTeamMembersRepository } from "@/modules/projects/repositories/project-team-members.repository";
import { UsersRepository } from "../repositories";

export const getPeopleDiscoverPageService = async () => {
  const supabase = await createClient();
  const { user } = await getAuthenticatedUser();

  const peopleRepo = new UsersRepository(supabase);
  const projectTeamRepo = new ProjectTeamMembersRepository(supabase);
  const topUsers = await peopleRepo.getTopUsers(user?.id);

  // 2. Enrich with profile + project count
  const processed = await Promise.all(
    topUsers.map(async (u: any) => {
      const profile = Array.isArray(u.profile) ? u.profile[0] : u.profile;

      const projectCount = await projectTeamRepo.countByUserId(u.id);

      return {
        ...u,
        profile,
        project_count: projectCount,
      };
    })
  );

  // 3. Get total people count
  const totalCount = await peopleRepo.getPeopleCount();

  return {
    data: processed,
    count: totalCount,
  };
};
