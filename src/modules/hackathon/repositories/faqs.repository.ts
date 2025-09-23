import { SupabaseClient } from "@/lib/supabase";

interface FaqsRepositoryInterface {
  getHackathonFaqs(hackathon_id: number): Promise<any[]>;
  getHackathonFaq(hackathon_id: number, faq_id: number): Promise<any>;
  createHackathonFaq(hackathon_id: number, question: string, answer: string): Promise<any>;
  updateHackathonFaq(
    hackathon_id: number,
    faq_id: number,
    question: string,
    answer: string
  ): Promise<any>;
  deleteHackathonFaq(hackathon_id: number, faq_id: number): Promise<void>;
}

export class FaqsRepository implements FaqsRepositoryInterface {
  private table = "hackathon_faqs" as const;

  constructor(private supabase: SupabaseClient) {}

  async getHackathonFaqs(hackathon_id: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("hackathon_id", hackathon_id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch hackathon FAQs: ${error.message}`);
    }

    return data || [];
  }

  async getHackathonFaq(hackathon_id: number, faq_id: number): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("hackathon_id", hackathon_id)
      .eq("id", faq_id)
      .eq("is_active", true)
      .single();

    if (error) {
      throw new Error(`Failed to fetch hackathon FAQ: ${error.message}`);
    }

    return data;
  }

  async createHackathonFaq(hackathon_id: number, question: string, answer: string): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .insert({
        hackathon_id,
        question,
        answer,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create hackathon FAQ: ${error.message}`);
    }

    return data;
  }

  async updateHackathonFaq(
    hackathon_id: number,
    faq_id: number,
    question: string,
    answer: string
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .update({
        question,
        answer,
        updated_at: new Date().toISOString(),
      })
      .eq("hackathon_id", hackathon_id)
      .eq("id", faq_id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update hackathon FAQ: ${error.message}`);
    }

    return data;
  }

  async deleteHackathonFaq(hackathon_id: number, faq_id: number): Promise<void> {
    const { error } = await this.supabase
      .from(this.table)
      .delete()
      .eq("hackathon_id", hackathon_id)
      .eq("id", faq_id);

    if (error) {
      throw new Error(`Failed to delete hackathon FAQ: ${error.message}`);
    }
  }
}
