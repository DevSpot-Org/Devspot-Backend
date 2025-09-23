import * as yup from "yup";

export const teamMemberFormSchema = yup.array().of(
  yup.object({
    user_id: yup.string().required("User ID is required"),
    is_project_manager: yup.boolean().required(),
    is_new: yup.boolean().required(),
    is_deleted: yup.boolean().required(),
  })
);
