import TechnologyOwnerService from "@/lib/services/technology_owner/services/technology_owner.service";
import { build_response } from "@/lib/services/utils/buildResponse";
import { createClient } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/modules/auth/utils";
import { errorResponse, successResponse } from "@/utils/response-helpers";
import { type NextRequest } from "next/server";
import * as yup from "yup";

const removeJudgingEntryFlagSchema = yup.object({
  judging_entry_id: yup.number().required(),
});

const removeProjectFlagSchema = yup.object({
  project_id: yup.number().required(),
  challenge_id: yup.number().required(),
});

const removeFlagsSchema = yup
  .mixed()
  .test("is-valid-flag-removal", "Invalid flag removal data", function (value) {
    return (
      removeJudgingEntryFlagSchema.isValidSync(value) || removeProjectFlagSchema.isValidSync(value)
    );
  });

type RemoveflagsProps =
  | { judging_entry_id: number }
  | {
      project_id: number;
      challenge_id: number;
    };

export const POST = async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const technology_owner_id = parseInt(params.id);

    if (!technology_owner_id || isNaN(technology_owner_id)) {
      return errorResponse("Invalid Technology Owner ID", 400);
    }

    const supabase = await createClient();
    const { error: authError } = await getAuthenticatedUser();
    if (authError) return authError;

    const service = new TechnologyOwnerService(supabase);

    const body = await request.json();
    const validatedOptions = await removeFlagsSchema.validate(body);

    const data = await service.remove_flags(validatedOptions as RemoveflagsProps);

    const response = build_response("Flag removed Successfully", data);
    return successResponse(response);
  } catch (error: any) {
    return errorResponse(error?.message ?? "Failed to remove Flag");
  }
};
