import { NextRequest } from "next/server";

import { createAIProjectController } from "@/modules/projects/controllers/projects.controller";
import { aiProjectSchema } from "@/modules/projects/validators/ai-project.validator";

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();

    const validated_body = await aiProjectSchema.validate(body);

    return await createAIProjectController(validated_body);
  } catch (error: any) {
    if (error.name === "ValidationError") {
      return Response.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
};
