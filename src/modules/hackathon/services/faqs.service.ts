import { createClient } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/modules/auth/utils";
import { FaqsRepository } from "../repositories/faqs.repository";
import {
  HackathonFaqParams,
  HackathonFaqRequest,
  HackathonFaqResponse,
  HackathonFaqsParams,
  HackathonFaqsResponse,
} from "../types";

export const getHackathonFaqsService = async (
  params: HackathonFaqsParams
): Promise<HackathonFaqsResponse> => {
  const supabase = await createClient();
  const faqsRepository = new FaqsRepository(supabase);

  const faqs = await faqsRepository.getHackathonFaqs(params.hackathon_id);

  return {
    faqs,
  };
};

export const getHackathonFaqService = async (
  params: HackathonFaqParams
): Promise<HackathonFaqResponse> => {
  const supabase = await createClient();
  const faqsRepository = new FaqsRepository(supabase);

  const faq = await faqsRepository.getHackathonFaq(params.hackathon_id, params.faq_id);

  return {
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
  };
};

export const createHackathonFaqService = async (
  params: HackathonFaqsParams,
  body: HackathonFaqRequest
): Promise<HackathonFaqResponse> => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    throw new Error("Authentication failed");
  }

  const faqsRepository = new FaqsRepository(supabase);
  const faq = await faqsRepository.createHackathonFaq(
    params.hackathon_id,
    body.question,
    body.answer
  );

  return {
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
  };
};

export const updateHackathonFaqService = async (
  params: HackathonFaqParams,
  body: HackathonFaqRequest
): Promise<HackathonFaqResponse> => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    throw new Error("Authentication failed");
  }

  const faqsRepository = new FaqsRepository(supabase);
  const faq = await faqsRepository.updateHackathonFaq(
    params.hackathon_id,
    params.faq_id,
    body.question,
    body.answer
  );

  return {
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
  };
};

export const deleteHackathonFaqService = async (params: HackathonFaqParams): Promise<void> => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    throw new Error("Authentication failed");
  }

  const faqsRepository = new FaqsRepository(supabase);
  await faqsRepository.deleteHackathonFaq(params.hackathon_id, params.faq_id);
};
