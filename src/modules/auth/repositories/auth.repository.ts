import { createClient } from "@/lib/supabase";

export class AuthRepository {
  async signUp(email: string, password: string, name: string) {
    const supabase = await createClient();

    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });
  }

  async signIn(email: string, password: string) {
    const supabase = await createClient();
    return supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    const supabase = await createClient();
    return supabase.auth.signOut();
  }

  async resetPassword(email: string, redirectTo: string) {
    const supabase = await createClient();
    return supabase.auth.resetPasswordForEmail(email, { redirectTo });
  }

  async updateUserPassword(newPassword: string) {
    const supabase = await createClient();
    return supabase.auth.updateUser({ password: newPassword });
  }

  async getUser() {
    const supabase = await createClient();
    return supabase.auth.getUser();
  }

  async verifyOtp(email: string, token: string) {
    const supabase = await createClient();
    return supabase.auth.verifyOtp({ email, token, type: "email" });
  }
}
