import { deleteAccountController } from "@/modules/auth/controllers";
import {
  getAuthUserProfileController,
  updateParticipantProfileController,
} from "@/modules/user/controllers/profile.controller";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  return await getAuthUserProfileController();
};

export const PUT = async (request: NextRequest) => {
  const body = await request.json();

  return await updateParticipantProfileController(body);
};

export const DELETE = async (request: NextRequest) => {
  return await deleteAccountController();
};
