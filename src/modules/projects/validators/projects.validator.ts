import * as yup from "yup";

export const getProjectByIdSchema = yup.object().shape({
  projectId: yup.string().required("Project ID is required"),
});

export const updateProjectSchema = yup.object().shape({
  name: yup.string().optional(),
  description: yup.string().optional(),
  video_url: yup.string().url("Invalid video URL").optional(),
  demo_url: yup.string().url("Invalid demo URL").optional(),
  project_url: yup.string().url("Invalid project URL").optional(),
  logo_url: yup.string().url("Invalid logo URL").optional(),
  header_url: yup.string().url("Invalid header URL").optional(),
  submitted: yup.boolean().optional(),
  technologies: yup.array().of(yup.string()).optional(),
  challenge_ids: yup.array().of(yup.number()).optional(),
  project_code_type: yup.string().oneOf(["fresh_code", "existing_code"]).optional(),
});

export const deleteProjectSchema = yup.object().shape({
  projectId: yup.string().required("Project ID is required"),
});
