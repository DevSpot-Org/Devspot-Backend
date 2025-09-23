import { HackathonApplicationMethodEnum } from "@/types/entities";
import * as yup from "yup";
import { StakeRefundEvent } from "../../projects/types";

export const applicationAndStakingSchema = yup.object().shape({
  accepting_participants: yup
    .boolean()
    .required("Accepting participants is required"),
  participants_limit: yup
    .number()
    .required("Participants limit is required")
    .min(1, "Participants limit must be at least 1"),
  stake_amount: yup
    .number()
    .required("Stake amount is required")
    .min(0, "Stake amount cannot be negative"),
  stake_refund_event: yup
    .string()
    .required("Stake refund event is required")
    .oneOf<StakeRefundEvent>(
      ["check_in", "project_submission", "event_end", "manual"],
      "Invalid stake refund event"
    ),
  questions: yup
    .array()
    .of(yup.string().required("Question is required"))
    .required("Questions array is required"),
  application_method: yup
    .string()
    .required("Application method is required")
    .oneOf<HackathonApplicationMethodEnum>(
      [
        "join",
        "stake",
        "apply",
        "apply_additional",
        "apply_stake",
        "apply_additional_stake",
      ],
      "Invalid application method"
    ),
});

export const updateHackathonDetailsSchema = yup
  .object()
  .shape({
    type: yup
      .mixed<"virtual" | "physical" | "hybrid">()
      .oneOf(["virtual", "physical", "hybrid"]),
    hackathon_start_date_time: yup.string(),
    hackathon_end_date_time: yup.string(),
    registration_start_date_time: yup.string(),
    registration_end_date_time: yup.string(),
    project_submission_start_date_time: yup.string(),
    project_submission_end_date_time: yup.string(),
    show_project_submission_opens_countdown: yup.boolean(),
    show_project_submission_deadline_countdown: yup.boolean(),
    rules: yup.string().nullable().notRequired(),
    communication_link: yup.string().nullable().notRequired(),
    winners_announcement_date: yup.string().nullable().notRequired(),
  })
  .test(
    "at-least-one-field",
    "At least one field must be provided",
    (value) => value && Object.values(value).some((v) => v !== undefined)
  );
