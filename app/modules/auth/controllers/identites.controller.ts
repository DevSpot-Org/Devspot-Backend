import { NextResponse } from "next/server";
import {
  getUserIdentitiesService,
  linkUserIdentityService,
  unlinkUserIdentityService,
} from "../services/identities.service";
import { getAuthenticatedUser } from "../utils";
import { buildResponse } from "@/utils/buildResponse";

export const getUserIdentitiesController = async () => {
  try {
    const result = await getUserIdentitiesService();

    return buildResponse({
      message: "Identities Retrieved Successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get user identities",
      data: err,
    });
  }
};

export const unlinkUserIdentityController = async (provider: string) => {
  try {
    if (!provider) {
      return buildResponse({
        data: null,
        message: "Please pass in a valid Provider",
        isError: true,
        status: 400,
      });
    }

    const { user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return buildResponse({
        data: null,
        message: "User is Not authenticated, Please Log In",
        isError: true,
        status: 400,
      });
    }

    const result = await unlinkUserIdentityService(user?.id, provider);

    return buildResponse({
      data: result,
      message: "Identities Unlinked Successfully",
    });
  } catch (err: unknown) {
    const error = err as Error;

    return buildResponse({
      message: error?.message ?? "Failed to unlink user identities",
      data: err,
      isError: true,
    });
  }
};

export const linkUserIdentityController = async (
  provider: string,
  redirect: string,
  origin: string | null
) => {
  const { user } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  try {
    const result = await linkUserIdentityService(provider, redirect, origin);

    return buildResponse({
      message: "Identity Linked Successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to link user identit",
      data: err,
    });
  }
};
