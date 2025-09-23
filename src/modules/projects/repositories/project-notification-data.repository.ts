import { SupabaseClient } from "@/lib/supabase";

export class ProjectNotificationDataRepository {
  private supabase: SupabaseClient;
  private table = "project_notification_data" as const;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  // Insert notification data
  async insertNotificationData(transactionId: string, payload: any): Promise<any> {
    const { error, data } = await this.supabase
      .from(this.table)
      .insert({
        transaction_id: transactionId,
        payload,
      })
      .select("*");

    if (error) {
      throw new Error(`Failed to insert notification data: ${error.message}`);
    }

    return data;
  }

  // Get notification data by transaction ID
  async getNotificationData(transactionId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("transaction_id", transactionId)
      .single();

    if (error) throw new Error(`Error fetching notification: ${error.message}`);
    return data;
  }
}
