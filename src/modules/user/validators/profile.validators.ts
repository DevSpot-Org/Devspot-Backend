import { ParticipantProfile } from "@/types/entities";
import * as Yup from "yup";

export const validateUpdateParticipantProfileBody = (body: any) => {
  const schema = Yup.object({
    description: Yup.string().nullable(),
    location: Yup.string().nullable(),
    linkedin_url: Yup.string().nullable(),
    x_url: Yup.string().nullable(),
    lensfrens_url: Yup.string().nullable(),
    warpcast_url: Yup.string().nullable(),
    portfolio_website: Yup.string().nullable(),
    is_open_to_project: Yup.boolean(),
    is_open_to_work: Yup.boolean(),
    connected_accounts: Yup.array().nullable(),
    skills: Yup.mixed().nullable(),
    roles: Yup.object({
      ids: Yup.array().of(Yup.number()).nullable(),
      primaryRoleId: Yup.number().nullable(),
    }).nullable(),
    full_name: Yup.string().nullable(),
    display_wallet_id: Yup.string().nullable(),
  }) as Yup.Schema<Partial<Omit<ParticipantProfile, "roles">>>;

  return schema.validateSync(body);
};
