import { createClient } from "@/lib/supabase";
import { HackathonsRepository } from "@/modules/hackathon/repositories/hackathons.repository";
import { ProjectsRepository } from "@/modules/projects/repositories/projects.repository";
import { TechnologyOwnerUserFollowingRepository } from "../repositories/technology-owner-user-following.repository";
import { TechnologyOwnersRepository } from "../repositories/technology-owners.repository";

export const getTechnologyOwnerByIdService = async (technologyOwnerId: number, userId?: string) => {
  const supabase = await createClient();
  const technologyOwnersRepository = new TechnologyOwnersRepository(supabase);
  const technologyOwnerUserFollowingRepository = new TechnologyOwnerUserFollowingRepository(
    supabase
  );

  // Get technology owner with relations
  const technologyOwner = await technologyOwnersRepository.findByIdWithRelations(technologyOwnerId);

  if (!technologyOwner) {
    throw new Error("Technology Owner not found");
  }

  // Filter and sort upcoming hackathons
  const upcomingHackathons = technologyOwner?.hackathons
    ?.sort((a: any, b: any) => {
      const aDate = a.registration_start_date
        ? new Date(a.registration_start_date)
        : new Date(a.start_date);
      const bDate = b.registration_start_date
        ? new Date(b.registration_start_date)
        : new Date(b.start_date);
      return aDate.getTime() - bDate.getTime();
    })
    .slice(0, 10)
    .map((hackathon: any) => ({
      ...hackathon,
      number_of_participants: hackathon.hackathon_participants?.[0]?.count ?? 0,
      hackathon_participants: undefined,
    }));

  let is_following = false;

  if (userId) {
    is_following = await technologyOwnerUserFollowingRepository.findFollowStatus(
      technologyOwnerId,
      userId
    );
  }

  return {
    ...technologyOwner,
    hackathons: upcomingHackathons,
    is_following,
  };
};

export const getAllTechnologyOwnersService = async (): Promise<any[]> => {
  const supabase = await createClient();
  const technologyOwnersRepository = new TechnologyOwnersRepository(supabase);

  // Get all technology owners with hackathons
  const technologyOwners = await technologyOwnersRepository.findAll();

  // Process each owner to add upcoming hackathon count
  const ownersWithUpcomingCount = technologyOwners.map((owner) => {
    const upcomingHackathons =
      owner.hackathons?.filter((hackathon: any) => {
        const startDate = new Date(hackathon.start_date);
        const registrationDate = hackathon.registration_start_date
          ? new Date(hackathon.registration_start_date)
          : startDate;
        const now = new Date();
        return registrationDate > now;
      }) || [];

    return {
      ...owner,
      no_of_upcoming_hackathons: upcomingHackathons.length,
      hackathons: undefined,
    };
  });

  // Sort the array so that owner with id 1 comes first
  return ownersWithUpcomingCount.sort((a, b) => {
    if (a.id === 1) return -1;
    if (b.id === 1) return 1;
    return 0;
  });
};

export const getTechnologyOwnerHackathonsService = async (
  technologyOwnerId: number,
  options: any
): Promise<any> => {
  const supabase = await createClient();
  const hackathonsRepository = new HackathonsRepository(supabase);

  // Get hackathons for the specific technology owner
  const hackathons = await hackathonsRepository.findByTechnologyOwnerId(technologyOwnerId);
  const totalCount = await hackathonsRepository.countByTechnologyOwnerId(technologyOwnerId);

  // Process hackathons to add participant count
  const mappedHackathons = hackathons.map((hackathon: any) => ({
    ...hackathon,
    number_of_participants: hackathon?.participants?.[0]?.count ?? 0,
  }));

  const page = parseInt(options?.page) || 1;
  const pageSize = parseInt(options?.page_size) || 30;
  const totalPages = Math.ceil(totalCount / pageSize);

  const data = {
    items: mappedHackathons,
    pageNumber: page,
    totalPages: totalPages,
    totalItems: totalCount,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };

  return data;
};

export const getTechnologyOwnerProjectsService = async (
  technologyOwnerId: number
): Promise<any> => {
  const supabase = await createClient();
  const projectsRepository = new ProjectsRepository(supabase);

  // Get projects for the specific technology owner
  const projects = await projectsRepository.findByTechnologyOwnerId(technologyOwnerId);

  return projects;
};

export const toggleFollowTechnologyOwnerService = async (
  technologyOwnerId: number,
  userId: string
): Promise<any> => {
  const supabase = await createClient();
  const technologyOwnerUserFollowingRepository = new TechnologyOwnerUserFollowingRepository(
    supabase
  );

  // Toggle follow status
  const result = await technologyOwnerUserFollowingRepository.toggleFollow(
    technologyOwnerId,
    userId
  );

  return result;
};

export const updateTechnologyOwnerService = async (
  technologyOwnerId: number,
  formData: FormData
): Promise<any> => {
  const supabase = await createClient();
  const technologyOwnersRepository = new TechnologyOwnersRepository(supabase);

  // Validate technology owner ID
  if (!technologyOwnerId || isNaN(technologyOwnerId)) {
    throw new Error("Invalid Technology Owner ID");
  }

  // Build the raw object for validation
  const raw = {
    name: formData.get("name")?.toString(),
    description: formData.get("description")?.toString(),
    domain: formData.get("domain")?.toString(),
    location: formData.get("location")?.toString(),
    num_employees: formData.get("num_employees")?.toString(),
    company_industry: formData.get("company_industry")?.toString(),
    tagline: formData.get("tagline")?.toString(),
    link: formData.get("link")?.toString(),
    discord_url: formData.get("discord_url")?.toString(),
    facebook_url: formData.get("facebook_url")?.toString(),
    instagram_url: formData.get("instagram_url")?.toString(),
    linkedin_url: formData.get("linkedin_url")?.toString(),
    slack_url: formData.get("slack_url")?.toString(),
    telegram_url: formData.get("telegram_url")?.toString(),
    x_url: formData.get("x_url")?.toString(),
    youtube_url: formData.get("youtube_url")?.toString(),
    technologies: formData.get("technologies")
      ? formData.get("technologies")!.toString().split(",")
      : undefined,
    logo: formData.get("logo") ?? undefined,
    banner_url: formData.get("banner_url") ?? undefined,
  };

  // Import the validator
  const { updateTechnologyOwnerSchema } = await import(
    "../validators/tech-owner-profile.validator"
  );

  // Validate (abortEarly: false to collect all errors)
  const params = await updateTechnologyOwnerSchema.validate(raw, {
    abortEarly: false,
  });

  // Clean params (remove undefined values)
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined)
  );

  // Update the technology owner
  const result = await technologyOwnersRepository.update(technologyOwnerId, cleanParams);

  return result;
};

export const searchTechnologyOwnersService = async (searchTerm: string): Promise<any> => {
  const supabase = await createClient();
  const technologyOwnersRepository = new TechnologyOwnersRepository(supabase);

  // Validate search term
  if (!searchTerm) {
    throw new Error("Invalid Search Term");
  }

  // Search technology owners by name
  const results = await technologyOwnersRepository.searchByName(searchTerm);

  return results;
};
