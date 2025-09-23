import * as yup from "yup";

export const updateTechnologyOwnerSchema = yup.object().shape({
  name: yup.string().nullable().notRequired().max(100, "Name too long").default(undefined),
  description: yup.string().nullable().notRequired().default(undefined),
  domain: yup.string().nullable().notRequired().default(undefined),
  location: yup.string().nullable().notRequired().default(undefined),
  num_employees: yup.string().nullable().notRequired().default(undefined),
  company_industry: yup.string().nullable().notRequired().default(undefined),
  tagline: yup.string().nullable().notRequired().default(undefined),
  link: yup.string().nullable().notRequired().default(undefined),
  discord_url: yup.string().nullable().notRequired().default(undefined),
  facebook_url: yup.string().nullable().notRequired().default(undefined),
  instagram_url: yup.string().nullable().notRequired().default(undefined),
  linkedin_url: yup.string().nullable().notRequired().default(undefined),
  slack_url: yup.string().nullable().notRequired().default(undefined),
  telegram_url: yup.string().nullable().notRequired().default(undefined),
  x_url: yup.string().nullable().notRequired().default(undefined),
  youtube_url: yup.string().nullable().notRequired().default(undefined),
  technologies: yup
    .array()
    .of(yup.string())
    .nullable()
    .notRequired()
    .default(undefined)
    .max(10, "Maximum 10 technologies allowed"),
  logo: yup.mixed<File | string>().nullable().notRequired().default(undefined),
  banner_url: yup.mixed<File | string>().nullable().notRequired().default(undefined),
});

export const technologyOwnerIdSchema = yup.object().shape({
  id: yup.string().required("Technology Owner ID is required"),
});

export const technologyOwnerHackathonsSchema = yup.object().shape({
  id: yup.string().required("Technology Owner ID is required"),
  page: yup.string().optional(),
  page_size: yup.string().optional(),
});

export const technologyOwnerProjectsSchema = yup.object().shape({
  id: yup.string().required("Technology Owner ID is required"),
});

export const technologyOwnerFollowSchema = yup.object().shape({
  id: yup.string().required("Technology Owner ID is required"),
});

export const technologyOwnerUpdateSchema = yup.object().shape({
  id: yup.string().required("Technology Owner ID is required"),
  formData: yup.mixed().required("Form data is required"),
});
