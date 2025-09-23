import * as yup from "yup";

export const projectSchema = yup.object({
  name: yup.string().default("Untitled project").required("Project name is required"),
  projectUrl: yup.string().url("Must be a valid URL").nullable(),
  hackathonId: yup.number().required("Hackathon ID is required"),
  projectCodeType: yup
    .string()
    .oneOf(
      ["fresh_code", "existing_code"],
      "Project code type must be either 'fresh_code' or 'existing_code'"
    )
    .required("Project code type is required"),
  challengeIds: yup
    .array()
    .of(yup.number().required())
    .min(1, "At least one challenge ID is required")
    .required(),
  logo_url: yup.string().required("Default logo required"),
});
