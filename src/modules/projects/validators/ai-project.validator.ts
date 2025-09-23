import * as yup from "yup";

export const aiProjectSchema = yup.object({
  name: yup.string().nullable(),
  projectUrl: yup.string().url("Must be a valid URL").required("Project url is required"),
  hackathonId: yup.number().required("Hackathon ID is required"),
});
