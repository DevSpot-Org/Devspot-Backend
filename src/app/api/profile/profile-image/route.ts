import {
  remove_profile_image,
  update_profile_image,
} from "@/lib/services/profile";
import { NextRequest } from "next/server";

export const POST = async (request: NextRequest) => {
  const formData = await request.formData();
  return await update_profile_image(formData);
};

export const DELETE = async () => {
  return await remove_profile_image();
};
