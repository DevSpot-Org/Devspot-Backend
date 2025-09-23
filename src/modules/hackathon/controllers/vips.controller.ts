import { buildResponse } from "@/utils/buildResponse";
import VipInvitationService from "../services/hackathonVips";
import { removeVipInviteService } from "../services/vips.service";
import {
  validateRemoveVipInviteParams,
  validateResendVipInviteParams,
} from "../validators/vips.validator";
import { createClient } from "@/lib/supabase";

export const removeVipInviteController = async (
  hackathon_id: string,
  identifier: string | null
) => {
  try {
    validateRemoveVipInviteParams({ hackathonId: hackathon_id, identifier });

    const hackathonId = parseInt(hackathon_id);

    const result = await removeVipInviteService(hackathonId, identifier!);

    return buildResponse({
      message: "Hackathon Invite deleted successfully",
      data: result,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to delete hackathon invite",
      data: error,
      isError: true,
      status: 400,
    });
  }
};

export const resendVipInviteController = async (
  hackathon_id: string,
  identifier: string | null
) => {
  try {
    validateResendVipInviteParams({ hackathonId: hackathon_id, identifier });

    const hackathonId = parseInt(hackathon_id);
    const supabase = await createClient();
    const vipInvitationService = new VipInvitationService(supabase);

    const data = await vipInvitationService.resendHackathonVipNotification(
      hackathonId,
      identifier!
    );

    return buildResponse({
      message: "Hackathon Judge Invitation Resent successfully",
      data,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to resend hackathon judge invitation",
      data: error,
      isError: true,
      status: 400,
    });
  }
};
