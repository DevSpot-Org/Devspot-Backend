import * as Yup from "yup";

export const signUpValidator = Yup.object({
  email: Yup.string().email().required(),
  password: Yup.string().min(8).required(),
  name: Yup.string().required(),
});

export const signInValidator = Yup.object({
  email: Yup.string().email().required(),
  password: Yup.string().required(),
});

export const resetPasswordValidator = Yup.object({
  email: Yup.string().email().required(),
});
