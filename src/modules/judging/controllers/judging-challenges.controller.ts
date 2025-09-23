import { buildResponse } from "@/utils/buildResponse";
import {
  addChallengesToJudging,
  getJudgingChallengesService,
  removeChallengesFromJudging,
} from "../services";
import { validateUpdateJudgingChallenges } from "../validators";

export const updateJudgingChallengesController = async (body: any, params: any) => {
  try {
    const judgingId = parseInt(params?.judgingId);
    if (isNaN(judgingId)) throw new Error("Invalid judging ID");

    validateUpdateJudgingChallenges(body);

    const newChallengeIds = body.challenge_ids;

    const currentChallenges = await getJudgingChallengesService({
      judging_id: judgingId,
    });
    const currentChallengeIds = currentChallenges.map((c: any) => c.id);

    const challengesToAdd = newChallengeIds.filter(
      (id: number) => !currentChallengeIds.includes(id)
    );
    const challengesToRemove = currentChallengeIds.filter(
      (id: number) => !newChallengeIds.includes(id)
    );

    let addResult = null;
    let removeResult = null;

    if (challengesToAdd.length > 0) {
      addResult = await addChallengesToJudging(judgingId, challengesToAdd);
    }

    if (challengesToRemove.length > 0) {
      removeResult = await removeChallengesFromJudging(judgingId, challengesToRemove);
    }

    return buildResponse({
      message: "Updated Judges Successfully",
      data: {
        judging_id: judgingId,
        challenges_added: challengesToAdd.length,
        challenges_removed: challengesToRemove.length,
        total_challenges: newChallengeIds.length,
        add_result: addResult,
        remove_result: removeResult,
      },
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to update judges",
      data: error,
      isError: true,
      status: 400,
    });
  }
};
