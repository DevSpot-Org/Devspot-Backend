import { ConnectedAccount } from "@/types/profile";
import { UserProfileRepository } from "../../user/repositories/profile.repository";
import { createClient } from "@/lib/supabase";

const getUserIdentitiesService = async () => {
  const supabase = await createClient();

  const { data, error: identitiesError } =
    await supabase.auth.getUserIdentities();

  if (identitiesError) {
    throw identitiesError;
  }

  return data.identities;
};

const unlinkUserIdentityService = async (userId: string, provider: string) => {
  const supabase = await createClient();

  const { data: identitiesData, error: identitiesError } =
    await supabase.auth.getUserIdentities();

  if (identitiesError) {
    throw identitiesError;
  }

  const identities = identitiesData.identities;
  if (identities.length <= 1) {
    throw new Error("You must have at least one identity connected");
  }

  const providerIdentity = identities.find((i) => i.provider === provider);
  if (!providerIdentity) {
    throw new Error(`No identity found for provider '${provider}'`);
  }

  const { data: unlinkData, error: unlinkError } =
    await supabase.auth.unlinkIdentity(providerIdentity);

  if (unlinkError) {
    throw unlinkError;
  }

  const profileRepository = new UserProfileRepository(supabase);

  try {
    const profile = await profileRepository.findByUserId(userId, [
      "connected_accounts",
    ]);

    if (!profile) return;

    const connectedAccounts = (profile.connected_accounts ||
      []) as ConnectedAccount[];
    const idx = connectedAccounts.findIndex(
      (acc) => Object.keys(acc)[0] === provider
    );

    if (idx !== -1) {
      connectedAccounts.splice(idx, 1);

      await profileRepository.updateByUserId(userId, {
        connected_accounts: connectedAccounts,
      });
    }
  } catch (error) {
    console.error("Could not load profile:", error);
  }

  return unlinkData;
};

const linkUserIdentityService = async (
  provider: string,
  redirect: string,
  origin: string | null
) => {
  const supabase = await createClient();

  const getProviderScopes = (provider: string): string => {
    switch (provider) {
      case "github":
        return "read:user";
      case "gitlab":
        return "read_user";
      case "linkedin_oidc":
        return "profile openid email";
      case "spotify":
        return "user-read-private user-read-email user-top-read user-read-currently-playing user-read-recently-played playlist-read-private";
      default:
        return "";
    }
  };

  const { data, error } = await supabase.auth.linkIdentity({
    provider: provider as "github" | "gitlab" | "linkedin_oidc",
    options: {
      redirectTo: `${origin}/auth/callback?linked=true&provider=${provider}&redirect=${redirect}`,
      scopes: getProviderScopes(provider),
    },
  });

  if (error) throw error;

  if (!data || !data.url) {
    throw new Error("No OAuth URL returned");
  }

  return {
    url: data.url,
  };
};

export {
  getUserIdentitiesService,
  linkUserIdentityService,
  unlinkUserIdentityService,
};
