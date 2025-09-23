import { SupabaseClient } from "@/lib/supabase";
import { Database } from "@/types/database";
import * as yup from "yup";
import { VIPRole, vipSchema } from "./schema";

type VipPerson = yup.InferType<typeof vipSchema>;
type VipList = yup.InferType<typeof vipSchema>;

abstract class RoleHandler {
  protected supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  abstract getRoleId(): Promise<number>;
  abstract getRoleName(): VIPRole;
  abstract createRoleRecord(hackathonId: number, userId: string, vipData: VipList): Promise<void>;
  abstract deleteRoleRecord(hackathonId: number, userId: string): Promise<void>;
  abstract validateRoleData(vipData: VipList): {
    isValid: boolean;
    errors: string[];
  };

  private static roleIdCache: Map<string, number> = new Map();

  protected async getRoleIdFromDB(roleName: VIPRole): Promise<number> {
    if (RoleHandler.roleIdCache.has(roleName)) {
      return RoleHandler.roleIdCache.get(roleName)!;
    }

    const { data, error } = await this.supabase
      .from("roles")
      .select("id")
      .eq("name", roleName)
      .single();

    if (error || !data) {
      throw new Error(`Role ID for "${roleName}" not found.`);
    }

    RoleHandler.roleIdCache.set(roleName, data.id);
    return data.id;
  }
}

export { RoleHandler, type VipList, type VipPerson, type VIPRole };
