import * as Yup from "yup";
import {
  AssignProjectsRequest,
  CreateJudgingRequest,
  GetJudgingChallengesParams,
  GetJudgingProgressParams,
  SubmitJudgingParams,
} from "../types";
import { VIPRole } from "@/modules/hackathon/services/hackathonVips/schema";

export const validateCreateJudgingBody = (body: any): CreateJudgingRequest => {
  if (!body.user_id || typeof body.user_id !== "string") {
    throw new Error("user_id is required and must be a string");
  }

  if (!body.hackathon_id || typeof body.hackathon_id !== "number") {
    throw new Error("hackathon_id is required and must be a number");
  }

  return {
    user_id: body.user_id,
    hackathon_id: body.hackathon_id,
  };
};

export const validateAssignProjectsBody = (
  body: any
): AssignProjectsRequest => {
  if (!body.botScoreIds || !Array.isArray(body.botScoreIds)) {
    throw new Error("botScoreIds is required and must be an array");
  }

  if (body.botScoreIds.length === 0) {
    throw new Error("botScoreIds array cannot be empty");
  }

  for (const id of body.botScoreIds) {
    if (typeof id !== "number" || isNaN(id)) {
      throw new Error("All botScoreIds must be valid numbers");
    }
  }

  return {
    botScoreIds: body.botScoreIds,
  };
};

export const validateSubmitJudgingParams = (
  params: any
): SubmitJudgingParams => {
  const judging_id = parseInt(params.judging_id);
  if (!judging_id || isNaN(judging_id)) {
    throw new Error("Invalid Judging Id");
  }

  return {
    judging_id,
  };
};

export const validateGetJudgingProgressParams = (
  params: any
): GetJudgingProgressParams => {
  const judging_id = parseInt(params.judging_id);
  if (!judging_id || isNaN(judging_id)) {
    throw new Error("Invalid Judging Id");
  }

  return {
    judging_id,
  };
};

export const validateGetJudgingChallengesParams = (
  params: any
): GetJudgingChallengesParams => {
  const judging_id = parseInt(params.judging_id);
  if (!judging_id || isNaN(judging_id)) {
    throw new Error("Invalid Judging Id");
  }

  return {
    judging_id,
  };
};

export const validateJudgeWithProjectsBody = (body: any) => {
  const schema = Yup.object({
    project_challenge_pairs: Yup.array()
      .of(
        Yup.object({
          project_id: Yup.number().required(),
          challenge_id: Yup.number().required(),
        })
      )
      .required("project_challenge_pairs is required")
      .min(1, "project_challenge_pairs cannot be empty"),
  });

  return schema.validateSync(body);
};


const vipSchema = Yup.object({
  id: Yup.string(),
  email: Yup.string().email("Must be a valid email"),
  invitation: Yup.boolean().optional(),
  roles: Yup.array()
    .of(
      Yup.mixed<VIPRole>()
        .oneOf(
          ["mentor", "judge", "speaker", "sponsor"],
          "Each role must be either mentor or judge"
        )
        .required("Role is Required")
    )
    .min(1, "At least one role is required")
    .required("Roles are required"),

  is_featured: Yup.boolean().optional().default(false),
  office_hours: Yup.string().optional().nullable(),
  challengeIds: Yup.array().optional().default([]),
}).test(
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

export const vipArraySchema = Yup.array()
  .of(vipSchema)
  .min(1, "At least one entry is required")
  .required();

export type VipPerson = Yup.InferType<typeof vipSchema>;
export type VipList = Yup.InferType<typeof vipSchema>;

export const vipArrayCustomValidation = (vips: any[]): string[] => {
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
