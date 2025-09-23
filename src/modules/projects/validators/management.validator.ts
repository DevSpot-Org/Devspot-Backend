import * as yup from "yup";

export const updateProjectAllocationSchema = yup.object().shape({
  projectId: yup.string().required("Project ID is required"),
  allocationData: yup
    .array()
    .of(
      yup.object({
        user_id: yup.string().required("User ID is required"),
        prize_allocation: yup
          .number()
          .required("Prize allocation is required")
          .min(0, "Prize allocation must be at least 0")
          .max(100, "Prize allocation cannot exceed 100"),
      })
    )
    .required("Allocation data is required")
    .min(1, "At least one allocation is required"),
});

export const submitProjectSchema = yup.object().shape({
  projectId: yup.string().required("Project ID is required"),
});
