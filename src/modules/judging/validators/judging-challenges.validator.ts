import * as Yup from "yup";

export const validateUpdateJudgingChallenges = (body: any) => {
  const schema = Yup.object({
    challenge_ids: Yup.array()
      .of(Yup.number().required("Challenge ID must be a number"))
      .required("challenge_ids is required"),
  });

  return schema.validateSync(body);
};

export const validateAssignWinnersForChallengesPayload = (body: any) => {
  const schema = Yup.object().shape({
    winners: Yup.array()
      .of(
        Yup.object().shape({
          challenge_id: Yup.number().required("Challenge ID is required"),
          project_id: Yup.number().required("Project ID is required"),
          prize_id: Yup.number().required("Prize ID is required"),
        })
      )
      .required("Winners array is required"),
  });

  return schema.validateSync(body);
};
