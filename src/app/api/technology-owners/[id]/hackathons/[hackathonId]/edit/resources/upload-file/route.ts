import { upload_resource_file } from "@/lib/services/technology_owner";
import { NextRequest } from "next/server";

export const POST = async (request: NextRequest) => {
  const formData = await request.formData();

  return await upload_resource_file(formData);
};
