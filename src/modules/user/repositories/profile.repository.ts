import { SupabaseClient } from "@/lib/supabase";
import { ParticipantProfile } from "@/types/entities";

interface UserProfileRepositoryInterface {
  findByUserId<T extends keyof ParticipantProfile>(
    id: string,
    fields?: T[]
  ): Promise<Pick<ParticipantProfile, T> | null>;
  findManyByUserIds<T extends keyof ParticipantProfile>(
    ids: string[],
    fields?: T[]
  ): Promise<Pick<ParticipantProfile, T>[]>;
  updateByUserId(id: string, updates: Partial<ParticipantProfile>): Promise<ParticipantProfile>;

  deleteByUserId(id: string): Promise<void>;
}

export class UserProfileRepository implements UserProfileRepositoryInterface {
  private table = "participant_profile" as const;

  constructor(private supabase: SupabaseClient) {}

  private buildSelect<T extends keyof ParticipantProfile>(fields?: T[]): string {
    return fields?.length ? fields.map((field) => this.toSnakeCase(String(field))).join(", ") : "*";
  }

  private toSnakeCase(field: string): string {
    return field.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  private mapToSnakeCase(obj: Record<string, any>): Record<string, any> {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [this.toSnakeCase(k), v]));
  }

  async findByUserId<T extends keyof ParticipantProfile>(
    id: string,
    fields?: T[]
  ): Promise<Pick<ParticipantProfile, T> | null> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(this.buildSelect(fields))
      .eq("participant_id", id)
      .single();

    if (error) throw new Error(error.message);

    return data as unknown as Pick<ParticipantProfile, T> | null;
  }

  async findManyByUserIds<T extends keyof ParticipantProfile>(
    ids: string[],
    fields?: T[]
  ): Promise<Pick<ParticipantProfile, T>[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(this.buildSelect(fields))
      .in("participant_id", ids);

    if (error) throw error;

    return (data ?? []) as unknown as Pick<ParticipantProfile, T>[];
  }

  async updateByUserId(
    id: string,
    updates: Partial<ParticipantProfile>
  ): Promise<ParticipantProfile> {
    const { data, error } = await this.supabase
      .from(this.table)
      .update(this.mapToSnakeCase(updates))
      .eq("participant_id", id)
      .select("*")
      .single();

    if (error) throw error;
    return data as ParticipantProfile;
  }

  async deleteByUserId(id: string): Promise<void> {
    const { error } = await this.supabase.from(this.table).delete().eq("participant_id", id);

    if (error) throw error;
  }
}
