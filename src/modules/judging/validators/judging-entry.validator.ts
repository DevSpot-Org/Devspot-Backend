import {
  FlagProjectParams,
  FlagProjectRequest,
  GetProjectDetailsParams,
  SubmitJudgingEntryParams,
  SubmitJudgingEntryRequest,
  UpdateJudgingEntryParams,
  UpdateJudgingEntryRequest,
} from "../types";

export const validateGetProjectDetailsParams = (
  params: any
): Omit<GetProjectDetailsParams, "challenge_id"> => {
  const judging_id = parseInt(params.judging_id);
  const project_id = parseInt(params.project_id);

  if (!judging_id || isNaN(judging_id)) {
    throw new Error("Invalid Judging Id");
  }

  if (!project_id || isNaN(project_id)) {
    throw new Error("Invalid Project Id");
  }

  return {
    judging_id,
    project_id,
  };
};

export const validateSubmitJudgingEntryParams = (params: any): SubmitJudgingEntryParams => {
  const judging_id = parseInt(params.judging_id);
  const project_id = parseInt(params.project_id);

  if (!judging_id || isNaN(judging_id)) {
    throw new Error("Invalid Judging Id");
  }

  if (!project_id || isNaN(project_id)) {
    throw new Error("Invalid Project Id");
  }

  return {
    judging_id,
    project_id,
  };
};

export const validateSubmitJudgingEntryBody = (body: any): SubmitJudgingEntryRequest => {
  if (!body.challenge_id || typeof body.challenge_id !== "number") {
    throw new Error("challenge_id is required and must be a number");
  }

  if (!body.score || typeof body.score !== "number") {
    throw new Error("score is required and must be a number");
  }

  if (!body.technical_feedback || typeof body.technical_feedback !== "string") {
    throw new Error("technical_feedback is required and must be a string");
  }

  if (!body.technical_score || typeof body.technical_score !== "number") {
    throw new Error("technical_score is required and must be a number");
  }

  if (!body.business_feedback || typeof body.business_feedback !== "string") {
    throw new Error("business_feedback is required and must be a string");
  }

  if (!body.business_score || typeof body.business_score !== "number") {
    throw new Error("business_score is required and must be a number");
  }

  if (!body.innovation_feedback || typeof body.innovation_feedback !== "string") {
    throw new Error("innovation_feedback is required and must be a string");
  }

  if (!body.innovation_score || typeof body.innovation_score !== "number") {
    throw new Error("innovation_score is required and must be a number");
  }

  if (!body.ux_feedback || typeof body.ux_feedback !== "string") {
    throw new Error("ux_feedback is required and must be a string");
  }

  if (!body.ux_score || typeof body.ux_score !== "number") {
    throw new Error("ux_score is required and must be a number");
  }

  if (!body.general_comments || typeof body.general_comments !== "string") {
    throw new Error("general_comments is required and must be a string");
  }

  return {
    challenge_id: body.challenge_id,
    score: body.score,
    technical_feedback: body.technical_feedback,
    technical_score: body.technical_score,
    business_feedback: body.business_feedback,
    business_score: body.business_score,
    innovation_feedback: body.innovation_feedback,
    innovation_score: body.innovation_score,
    ux_feedback: body.ux_feedback,
    ux_score: body.ux_score,
    general_comments: body.general_comments,
  };
};

export const validateUpdateJudgingEntryParams = (params: any): UpdateJudgingEntryParams => {
  const judging_id = parseInt(params.judging_id);
  const project_id = parseInt(params.project_id);

  if (!judging_id || isNaN(judging_id)) {
    throw new Error("Invalid Judging Id");
  }

  if (!project_id || isNaN(project_id)) {
    throw new Error("Invalid Project Id");
  }

  return {
    judging_id,
    project_id,
  };
};

export const validateUpdateJudgingEntryBody = (body: any): UpdateJudgingEntryRequest => {
  if (!body.challenge_id || typeof body.challenge_id !== "number") {
    throw new Error("challenge_id is required and must be a number");
  }

  const result: UpdateJudgingEntryRequest = {
    challenge_id: body.challenge_id,
  };

  if (body.score !== undefined) {
    if (typeof body.score !== "number") {
      throw new Error("score must be a number");
    }
    result.score = body.score;
  }

  if (body.technical_feedback !== undefined) {
    if (typeof body.technical_feedback !== "string") {
      throw new Error("technical_feedback must be a string");
    }
    result.technical_feedback = body.technical_feedback;
  }

  if (body.business_feedback !== undefined) {
    if (typeof body.business_feedback !== "string") {
      throw new Error("business_feedback must be a string");
    }
    result.business_feedback = body.business_feedback;
  }

  if (body.innovation_feedback !== undefined) {
    if (typeof body.innovation_feedback !== "string") {
      throw new Error("innovation_feedback must be a string");
    }
    result.innovation_feedback = body.innovation_feedback;
  }

  if (body.ux_feedback !== undefined) {
    if (typeof body.ux_feedback !== "string") {
      throw new Error("ux_feedback must be a string");
    }
    result.ux_feedback = body.ux_feedback;
  }

  if (body.general_comments !== undefined) {
    if (typeof body.general_comments !== "string") {
      throw new Error("general_comments must be a string");
    }
    result.general_comments = body.general_comments;
  }

  if (body.judging_status !== undefined) {
    if (!["needs_review", "judged"].includes(body.judging_status)) {
      throw new Error("judging_status must be either 'needs_review' or 'judged'");
    }
    result.judging_status = body.judging_status;
  }

  if (body.technical_score !== undefined) {
    if (typeof body.technical_score !== "number") {
      throw new Error("technical_score must be a number");
    }
    result.technical_score = body.technical_score;
  }

  if (body.business_score !== undefined) {
    if (typeof body.business_score !== "number") {
      throw new Error("business_score must be a number");
    }
    result.business_score = body.business_score;
  }

  if (body.innovation_score !== undefined) {
    if (typeof body.innovation_score !== "number") {
      throw new Error("innovation_score must be a number");
    }
    result.innovation_score = body.innovation_score;
  }

  if (body.ux_score !== undefined) {
    if (typeof body.ux_score !== "number") {
      throw new Error("ux_score must be a number");
    }
    result.ux_score = body.ux_score;
  }

  return result;
};

export const validateFlagProjectParams = (params: any): FlagProjectParams => {
  const judging_id = parseInt(params.judging_id);
  const project_id = parseInt(params.project_id);

  if (!judging_id || isNaN(judging_id)) {
    throw new Error("Invalid Judging Id");
  }

  if (!project_id || isNaN(project_id)) {
    throw new Error("Invalid Project Id");
  }

  return {
    judging_id,
    project_id,
  };
};

export const validateFlagProjectBody = (body: any): FlagProjectRequest => {
  if (!body.challenge_id || typeof body.challenge_id !== "number") {
    throw new Error("challenge_id is required and must be a number");
  }

  if (!body.flag_reason || typeof body.flag_reason !== "string") {
    throw new Error("flag_reason is required and must be a string");
  }

  const result: FlagProjectRequest = {
    challenge_id: body.challenge_id,
    flag_reason: body.flag_reason,
  };

  if (body.flag_comments !== undefined) {
    if (typeof body.flag_comments !== "string") {
      throw new Error("flag_comments must be a string");
    }
    result.flag_comments = body.flag_comments;
  }

  if (body.status !== undefined) {
    if (body.status !== "unflag") {
      throw new Error("status must be 'unflag' if provided");
    }
    result.status = body.status;
  }

  return result;
};
