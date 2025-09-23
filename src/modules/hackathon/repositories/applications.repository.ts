import { SupabaseClient } from "@/lib/supabase";

interface ApplicationsRepositoryInterface {
  getAdditionalQuestions(hackathon_id: number): Promise<any[]>;
  submitQuestionnaireAnswers(
    hackathon_id: number,
    user_id: string,
    answers: Array<{ question_id: number; answer: string }>
  ): Promise<any>;
  getExistingAnswers(hackathon_id: number, user_id: string): Promise<any[]>;
}

export class ApplicationsRepository implements ApplicationsRepositoryInterface {
  constructor(private supabase: SupabaseClient) {}

  async getAdditionalQuestions(hackathon_id: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("hackathon_application_questions")
      .select("*")
      .eq("hackathon_id", hackathon_id)
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch additional questions: ${error.message}`);
    }

    return data || [];
  }

  async submitQuestionnaireAnswers(
    hackathon_id: number,
    user_id: string,
    answers: Array<{ question_id: number; answer: string }>
  ): Promise<any> {
    const answerData = answers.map((answer) => ({
      hackathon_id,
      user_id,
      question_id: answer.question_id,
      answer: answer.answer,
    }));

    const { data, error } = await this.supabase
      .from("hackathon_application_answers")
      .upsert(answerData, {
        onConflict: "hackathon_id,user_id,question_id",
      })
      .select();

    if (error) {
      throw new Error(`Failed to submit questionnaire answers: ${error.message}`);
    }

    return data;
  }

  async getExistingAnswers(hackathon_id: number, user_id: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("hackathon_application_answers")
      .select(
        `
        *,
        hackathon_application_questions(*)
      `
      )
      .eq("hackathon_id", hackathon_id)
      .eq("user_id", user_id);

    if (error) {
      throw new Error(`Failed to fetch existing answers: ${error.message}`);
    }

    return data || [];
  }
}
