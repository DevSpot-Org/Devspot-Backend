import * as yup from "yup";

export const uploadHeaderImageSchema = yup.object().shape({
  projectId: yup.string().required("Project ID is required"),
  file: yup.mixed().required("File is required"),
});

export const uploadLogoSchema = yup.object().shape({
  projectId: yup.string().required("Project ID is required"),
  file: yup.mixed().required("File is required"),
});

export const uploadVideoSchema = yup.object().shape({
  projectId: yup.string().required("Project ID is required"),
  file: yup.mixed().required("File is required"),
});

export const deleteHeaderImageSchema = yup.object().shape({
  projectId: yup.string().required("Project ID is required"),
});

export const deleteLogoSchema = yup.object().shape({
  projectId: yup.string().required("Project ID is required"),
});

export const deleteVideoSchema = yup.object().shape({
  projectId: yup.string().required("Project ID is required"),
});
