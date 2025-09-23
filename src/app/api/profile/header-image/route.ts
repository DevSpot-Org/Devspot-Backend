import {
  remove_header_image,
  update_header_image,
} from "@/lib/services/profile";
import { NextRequest } from "next/server";

export const POST = async (request: NextRequest) => {
  const formData = await request.formData();
  return await update_header_image(formData);
};

export const DELETE = async () => {
  return await remove_header_image();
};
