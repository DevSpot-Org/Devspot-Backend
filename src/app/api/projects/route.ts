import {
  createProjectController,
  getAllSubmittedProjectsController,
} from "@/modules/projects/controllers/projects.controller";
import { projectSchema } from "@/modules/projects/validators/project.validator";
import { type NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  return await getAllSubmittedProjectsController();
};

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();

    const validated_body = await projectSchema.validate(body);

    return await createProjectController(validated_body);
  } catch (error: any) {
    if (error.name === "ValidationError") {
      return Response.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
};
