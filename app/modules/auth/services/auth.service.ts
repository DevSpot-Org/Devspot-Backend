import { AuthRepository } from "../repositories/auth.repository";

const repo = new AuthRepository();

export const signUpService = async (email: string, password: string, name: string) => {
  const { data, error } = await repo.signUp(email, password, name);
  if (error) throw new Error(error.message);
  return data;
};

export const signInService = async (email: string, password: string) => {
  const { data, error } = await repo.signIn(email, password);
  if (error) {
    if (error.message === "Email not confirmed") {
      throw new Error("Please verify your email before logging in.");
    }
    throw new Error(error.message);
  }
  return data;
};

export const signOutService = async () => {
  const { error } = await repo.signOut();
  if (error) throw new Error(error.message);
  return true;
};

export const resetPasswordService = async (email: string, redirectTo: string) => {
  const { error } = await repo.resetPassword(email, redirectTo);
  if (error) throw new Error(error.message);
  return true;
};

export const updateUserPasswordService = async (newPassword: string) => {
  const { error } = await repo.updateUserPassword(newPassword);
  if (error) throw new Error(error.message);
  return true;
};

export const getUserService = async () => {
  const { data, error } = await repo.getUser();
  if (error) throw new Error(error.message);
  return data.user;
};

export const verifyOtpService = async (email: string, token: string) => {
  const { data, error } = await repo.verifyOtp(email, token);
  if (error) throw new Error(error.message);
  return { user: data.user, session: data.session };
};
