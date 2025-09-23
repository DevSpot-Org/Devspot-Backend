import * as yup from "yup";

export const validateRemoveVipInviteParams = (params: {
  hackathonId: string;
  identifier: string | null;
}) => {
  const schema = yup.object().shape({
    hackathonId: yup
      .string()
      .required("Hackathon Id is required")
      .test(
        "is-valid-number",
        "Invalid Hackathon Id",
        (val) => !isNaN(parseInt(val ?? ""))
      ),
    identifier: yup.string().required("Identifier is required"),
  });

  return schema.validateSync(params);
};

export const validateResendVipInviteParams = (params: {
  hackathonId: string;
  identifier: string | null;
}) => {
  const schema = yup.object().shape({
    hackathonId: yup
      .string()
      .required("Hackathon Id is required")
      .test(
        "is-valid-number",
        "Invalid Hackathon Id",
        (val) => !isNaN(parseInt(val ?? ""))
      ),

    identifier: yup.string().required("Identifier is required"),
  });

  return schema.validateSync(params);
};
