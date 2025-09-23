import { SupabaseClient } from "@/lib/supabase";
import { HackathonParticipantsRepository } from "@/modules/hackathon/repositories/hackathon-participants.repository";
import { HackathonsRepository } from "@/modules/hackathon/repositories/hackathons.repository";

export async function validateHackathonAndParticipant(
  hackathonId: number,
  creator_id: string,
  supabase: SupabaseClient
): Promise<any> {
  const hackathonsRepository = new HackathonsRepository(supabase);
  const hackathonParticipantsRepository = new HackathonParticipantsRepository(supabase);

  const hackathon = await hackathonsRepository.getHackathonForValidation(hackathonId);

  const now = new Date().getTime();
  const submissionStartDate = hackathon.submission_start_date
    ? new Date(hackathon.submission_start_date).getTime()
    : null;

  const submissionEndDate = hackathon.deadline_to_submit
    ? new Date(hackathon.deadline_to_submit).getTime()
    : null;

  if (submissionStartDate && now < submissionStartDate) {
    throw new Error(
      `Project submissions have not started yet. Submissions open on ${new Date(
        submissionStartDate
      ).toLocaleDateString()}`
    );
  }

  if (submissionEndDate && now > submissionEndDate) {
    throw new Error(
      `Hackathon submission deadline has passed. Submissions closed on ${new Date(
        submissionEndDate
      ).toLocaleDateString()}`
    );
  }

  if (
    !submissionStartDate ||
    !submissionEndDate ||
    now < submissionStartDate ||
    now > submissionEndDate
  ) {
    throw new Error(`Project submissions are not currently open`);
  }

  await hackathonParticipantsRepository.validateParticipantForProjectCreation(
    hackathonId,
    creator_id
  );
}
