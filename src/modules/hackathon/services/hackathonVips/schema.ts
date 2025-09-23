import * as yup from "yup";

type VIPRole = "mentor" | "judge" | "sponsor" | "speaker";

const vipSchema = yup
  .object({
    id: yup.string(),
    email: yup.string().email("Must be a valid email"),
    invitation: yup.boolean().optional(),
    roles: yup
      .array()
      .of(
        yup
          .mixed<VIPRole>()
          .oneOf(
            ["mentor", "judge", "speaker", "sponsor"],
            "Each role must be either mentor or judge"
          )
          .required("Role is Required")
      )
      .min(1, "At least one role is required")
      .required("Roles are required"),

    is_featured: yup.boolean().optional().default(false),
    office_hours: yup.string().optional().nullable(),
    challengeIds: yup.array().optional().default([]),
  })
  .test(
    "id-or-email-required",
    "Either ID or email must be provided",
    function (value) {
      if (!value.id && !value.email) {
        return this.createError({
          message: "Either ID or email must be provided",
          path: !value.id ? "id" : "email",
        });
      }
      return true;
    }
  );

const vipArraySchema = yup
  .array()
  .of(vipSchema)
  .min(1, "At least one entry is required")
  .required();

// Custom validation function with detailed error messages
const vipArrayCustomValidation = (vips: any[]): string[] => {
  const errors: string[] = [];

  if (!Array.isArray(vips) || vips.length === 0) {
    errors.push("At least one VIP entry is required");
    return errors;
  }

  vips.forEach((vip, index) => {
    const identifier = vip.email || vip.id || `Record ${index + 1}`;

    // Check if either id or email is provided
    if (!vip.id && !vip.email) {
      errors.push(`${identifier}: Either ID or email must be provided`);
    }

    // Validate email format if provided
    if (vip.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vip.email)) {
      errors.push(`${identifier}: Must be a valid email address`);
    }

    // Check roles
    if (!vip.roles || !Array.isArray(vip.roles) || vip.roles.length === 0) {
      errors.push(`${identifier}: At least one role is required`);
    } else {
      // Validate each role
      const validRoles = ["mentor", "judge", "speaker", "sponsor"];
      const invalidRoles = vip.roles.filter(
        (role: string) => !validRoles.includes(role)
      );
      if (invalidRoles.length > 0) {
        errors.push(
          `${identifier}: Invalid role(s): ${invalidRoles.join(
            ", "
          )}. Must be one of: ${validRoles.join(", ")}`
        );
      }
    }

    // Validate boolean fields
    if (vip.invitation !== undefined && typeof vip.invitation !== "boolean") {
      errors.push(`${identifier}: Invitation field must be a boolean`);
    }

    if (vip.is_featured !== undefined && typeof vip.is_featured !== "boolean") {
      errors.push(`${identifier}: is_featured field must be a boolean`);
    }
  });

  return errors;
};

export { vipArrayCustomValidation, vipArraySchema, vipSchema, type VIPRole };
