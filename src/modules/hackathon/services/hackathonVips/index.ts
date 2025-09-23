import { SupabaseClient } from "@/lib/supabase";
import { HackathonVips, HackathonVipsInvitation, Users } from "@/types/entities";
import { Novu } from "@novu/api";
import axios from "axios";
import { JudgeRoleHandler, MentorRoleHandler } from "./roleHandlers";
import { RoleHandler, VipList, VIPRole } from "./types";
import ApiBaseService from "@/utils/baseService";
interface VipInvitationResult {
  id?: string;
  email?: string;
  roles: VIPRole[];
  status: string;
  invitation_id?: number;
}
class VipInvitationService extends ApiBaseService {
  private roleHandlers: Map<VIPRole, RoleHandler>;
  constructor(supabase: SupabaseClient) {
    super(supabase);
    this.roleHandlers = new Map();
    this.registerRoleHandler(new JudgeRoleHandler(supabase));
    this.registerRoleHandler(new MentorRoleHandler(supabase));
  }
  private registerRoleHandler(handler: RoleHandler): void {
    this.roleHandlers.set(handler.getRoleName(), handler);
  }
  async editVipss(hackathonId: number, vips: VipList[]): Promise<VipInvitationResult[]> {
    const results: VipInvitationResult[] = [];
    // Get all existing VIPs for the hackathon
    const { data: existingVips } = await this.supabase
      .from("hackathon_vips")
      .select("*")
      .eq("hackathon_id", hackathonId);

    // Create a map of existing VIP user IDs
    const existingVipMap = new Map(existingVips?.map((vip) => [vip.user_id, vip]) || []);

    const newInvitations = vips.filter((item) => item.invitation).filter(Boolean);

    const { data: existingInvitations } = await this.supabase
      .from("hackathon_vips_invitations")
      .select("*")
      .eq("hackathon_id", hackathonId);

    if (newInvitations?.length > 0 && existingInvitations) {
      const newEmailInvites = new Set(newInvitations.map((inv) => inv?.email).filter(Boolean));

      const newUserIdInvites = new Set(newInvitations.map((inv) => inv.id).filter(Boolean));

      for (const existingInvite of existingInvitations) {
        const shouldKeep = existingInvite.email
          ? newEmailInvites.has(existingInvite.email)
          : newUserIdInvites.has(existingInvite.id.toString());
        const novu = new Novu({ secretKey: process.env.NOVU_API_KEY! });

        if (!shouldKeep) {
          if (existingInvite.transaction_id) {
            try {
              await novu.messages.deleteByTransactionId(existingInvite.transaction_id);
            } catch (error) {
              console.log(error);
            }
          }

          await this.supabase
            .from("hackathon_vips_invitations")
            .delete()
            .eq("id", existingInvite.id);

          results.push({
            id: existingInvite?.user_id!,
            email: existingInvite?.email!,
            roles: [],
            status: "invitation_deleted",
          });
        }
      }
    }

    // Handle VIP deletions
    const newVipIds = new Set(vips.map((vip) => vip.id).filter(Boolean));
    for (const [userId] of existingVipMap) {
      if (!newVipIds.has(userId)) {
        await this.removeVip(hackathonId, userId);
        results.push({
          id: userId,
          roles: [],
          status: "deleted",
        });
      }
    }

    // Handle updates and creations
    for (const vip of vips) {
      try {
        if (vip.id && existingVipMap.has(vip.id)) {
          // Update existing VIP
          const existingVip = existingVipMap.get(vip.id);
          // Update VIP record
          const { error: updateError } = await this.supabase
            .from("hackathon_vips")
            .update({
              is_featured: vip.is_featured ?? existingVip?.is_featured,
              office_hours: vip.office_hours ?? existingVip?.office_hours,
            })
            .eq("hackathon_id", hackathonId)
            .eq("user_id", vip.id);
          if (updateError) throw updateError;
          // Handle role updates
          const { data: currentRoles } = await this.supabase
            .from("hackathon_vip_roles")
            .select("role_id, roles(name)")
            .eq("hackathon_id", hackathonId)
            .eq("user_id", vip.id);
          // Remove old roles
          const currentRoleNames =
            currentRoles?.map((r) => r.roles?.name?.toLowerCase() as VIPRole) || [];
          for (const roleName of currentRoleNames) {
            const handler = this.roleHandlers.get(roleName);
            if (handler && !vip.roles.includes(roleName)) {
              await handler.deleteRoleRecord(hackathonId, vip.id);
            }
          }
          // Add new roles
          for (const role of vip.roles) {
            const handler = this.roleHandlers.get(role);
            if (handler && !currentRoleNames.includes(role)) {
              await handler.createRoleRecord(hackathonId, vip.id, {
                is_featured: vip.is_featured ?? existingVip?.is_featured,
                challengeIds: vip.challengeIds ?? [],
                roles: vip.roles,
              });
            }
          }
          results.push({
            id: vip.id,
            roles: vip.roles,
            status: "updated",
          });
        } else {
          const inviteResult = await this.inviteVips(hackathonId, [vip]);
          results.push(...inviteResult);
        }
      } catch (error) {
        results.push({
          id: vip.id,
          email: vip.email,
          roles: vip.roles,
          status: `error: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }

    return results;
  }

  async editVips(hackathonId: number, vips: VipList[]): Promise<VipInvitationResult[]> {
    const results: VipInvitationResult[] = [];

    try {
      const existingVipMap = await this.getExistingVipsMap(hackathonId);

      const invitationResults = await this.cleanupInvitations(hackathonId, vips);

      results.push(...invitationResults);

      const deletionResults = await this.handleVipDeletions(hackathonId, vips, existingVipMap);

      results.push(...deletionResults);

      const updateResults = await this.handleVipUpdatesAndCreations(
        hackathonId,
        vips,
        existingVipMap
      );

      results.push(...updateResults);
    } catch (error) {
      console.error("Error in editVips:", error);
      throw error;
    }

    return results;
  }

  private async getExistingVipsMap(hackathonId: number) {
    const { data: existingVips } = await this.supabase
      .from("hackathon_vips")
      .select("*")
      .eq("hackathon_id", hackathonId);

    const existingVipMap = new Map(existingVips?.map((vip) => [vip.user_id, vip]) || []) as Map<
      string,
      HackathonVips
    >;

    return existingVipMap;
  }

  private async cleanupInvitations(
    hackathonId: number,
    vips: VipList[]
  ): Promise<VipInvitationResult[]> {
    const results: VipInvitationResult[] = [];

    const newInvitations = vips.filter((item) => item.invitation).filter(Boolean);

    if (newInvitations.length === 0) {
      return results;
    }

    const { data: existingInvitations } = await this.supabase
      .from("hackathon_vips_invitations")
      .select("*")
      .eq("hackathon_id", hackathonId);

    if (newInvitations?.length <= 0 || !existingInvitations) return results;

    const invitationsToDelete = this.getInvitationsToDelete(newInvitations, existingInvitations);

    for (const invitation of invitationsToDelete) {
      await this.deleteInvitation(invitation as HackathonVipsInvitation);

      results.push({
        id: invitation.user_id!,
        email: invitation.email!,
        roles: [],
        status: "invitation_deleted",
      });
    }

    return results;
  }

  private getInvitationsToDelete(
    newInvitations: VipList[],
    existingInvitations: Partial<HackathonVipsInvitation>[]
  ) {
    const newEmailInvites = new Set(newInvitations.map((inv) => inv?.email).filter(Boolean));
    const newUserIdInvites = new Set(newInvitations.map((inv) => inv.id).filter(Boolean));

    return existingInvitations.filter((existingInvite) => {
      const shouldKeep = existingInvite.email
        ? newEmailInvites.has(existingInvite.email)
        : newUserIdInvites.has(existingInvite.id?.toString());

      return !shouldKeep;
    });
  }

  private async deleteInvitation(invitation: HackathonVipsInvitation) {
    if (invitation.transaction_id) {
      await this.cancelNovuNotification(invitation.transaction_id);
    }

    await this.supabase.from("hackathon_vips_invitations").delete().eq("id", invitation?.id);
  }

  private async cancelNovuNotification(transactionId: string) {
    try {
      const novu = new Novu({ secretKey: process.env.NOVU_API_KEY! });
      await novu.messages.deleteByTransactionId(transactionId);
    } catch (error) {
      console.log("Failed to cancel Novu notification:", error);
    }
  }

  private async handleVipDeletions(
    hackathonId: number,
    vips: VipList[],
    existingVipMap: Map<string, HackathonVips>
  ): Promise<VipInvitationResult[]> {
    const results: VipInvitationResult[] = [];
    const newVipIds = new Set(vips.map((vip) => vip.id).filter(Boolean));

    for (const [userId] of existingVipMap) {
      if (!newVipIds.has(userId)) {
        await this.removeVip(hackathonId, userId);
        results.push({
          id: userId,
          roles: [],
          status: "deleted",
        });
      }
    }

    return results;
  }

  private async handleVipUpdatesAndCreations(
    hackathonId: number,
    vips: VipList[],
    existingVipMap: Map<string, HackathonVips>
  ): Promise<VipInvitationResult[]> {
    const results: VipInvitationResult[] = [];

    for (const vip of vips) {
      try {
        const existingVip = vip.id ? existingVipMap.get(vip.id) : null;

        const result = existingVip
          ? await this.updateExistingVip(hackathonId, vip, existingVip)
          : await this.inviteVips(hackathonId, [vip]);

        results.push(...result);
      } catch (error) {
        results.push({
          id: vip.id,
          email: vip.email,
          roles: vip.roles,
          status: `error: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }

    return results;
  }

  private async updateExistingVip(
    hackathonId: number,
    vip: VipList,
    existingVip: HackathonVips
  ): Promise<VipInvitationResult[]> {
    const { error: updateError } = await this.supabase
      .from("hackathon_vips")
      .update({
        is_featured: vip.is_featured ?? existingVip?.is_featured,
        office_hours: vip.office_hours ?? existingVip?.office_hours,
      })
      .eq("hackathon_id", hackathonId)
      .eq("user_id", vip.id!);

    if (updateError) throw updateError;

    // Handle role updates
    await this.updateVipRoles(hackathonId, vip, existingVip);

    return [
      {
        id: vip.id!,
        roles: vip.roles,
        status: "updated",
      },
    ];
  }

  private async updateVipRoles(hackathonId: number, vip: VipList, existingVip: any) {
    const { data: currentRoles } = await this.supabase
      .from("hackathon_vip_roles")
      .select("role_id, roles(name)")
      .eq("hackathon_id", hackathonId)
      .eq("user_id", vip.id!);

    const currentRoleNames =
      currentRoles?.map((r) => r.roles?.name?.toLowerCase() as VIPRole) || [];

    // Remove roles that are no longer needed
    for (const roleName of currentRoleNames) {
      const handler = this.roleHandlers.get(roleName);
      if (handler && !vip.roles.includes(roleName)) {
        await handler.deleteRoleRecord(hackathonId, vip.id!);
      }
    }

    // Add new roles
    for (const role of vip.roles) {
      const handler = this.roleHandlers.get(role);
      if (handler && !currentRoleNames.includes(role)) {
        await handler.createRoleRecord(hackathonId, vip.id!, {
          is_featured: vip.is_featured ?? existingVip?.is_featured,
          challengeIds: vip.challengeIds ?? [],
          roles: vip.roles,
        });
      }
    }
  }

  async sendInviteAfterNewUserCreatesAccount(email: string): Promise<void> {
    const { data: user, error: userError } = await this.supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (userError) throw userError;
    if (!user) throw new Error("User not found");

    // Fetch pending invitation
    const { data: invitation, error: invitationError } = await this.supabase
      .from("hackathon_vips_invitations")
      .select("*, status, hackathons(name), users(*)")
      .eq("email", email)
      .eq("status", "pending");

    if (invitationError) throw invitationError;
    if (!invitation) throw new Error("No pending invitation found");

    const { error: updateError } = await this.supabase
      .from("hackathon_vips_invitations")
      .update({ user_id: user.id, email: null })
      .eq("email", email)
      .eq("status", "pending");

    if (updateError) throw updateError;
    await Promise.all(
      invitation.map(async (invite) => {
        await this.sendInvitationNotification({
          user: user,
          hackathon_id: invite.hackathon_id!,
          hackathon_name: invite.hackathons?.name ?? "Hackathon",
          status: "pending",
        });
      })
    );
  }

  async inviteVips(hackathonId: number, invitations: VipList[]): Promise<VipInvitationResult[]> {
    const results: VipInvitationResult[] = [];

    for (const invitation of invitations) {
      try {
        // Validate invitation data
        const validationResult = this.validateInvitation(invitation);

        if (!validationResult.isValid) {
          results.push({
            id: invitation.id,
            email: invitation.email,
            roles: invitation.roles,
            status: `validation_failed: ${validationResult.errors.join(", ")}`,
          });

          continue;
        }

        let userId = invitation.id;

        if (invitation.email) {
          const { data: existingUser } = await this.supabase
            .from("users")
            .select("*")
            .eq("email", invitation.email)
            .single();

          if (existingUser) {
            userId = existingUser.id;

            invitation.email = undefined;
          }
        }

        // If email is provided instead of ID, handle as pending invitation
        if (!userId && invitation.email) {
          const { data: existingInvite } = await this.supabase
            .from("hackathon_vips_invitations")
            .select("*")
            .eq("hackathon_id", hackathonId)
            .eq("email", invitation.email)
            .single();

          if (existingInvite) {
            const { data: updatedInvite, error } = await this.supabase
              .from("hackathon_vips_invitations")
              .update({
                email: invitation.email,
                hackathon_id: hackathonId,
                roles: invitation.roles,
                status: "pending",
                challenge_ids: invitation.challengeIds,
                office_hour: invitation.office_hours ?? "",
                payload: JSON.stringify(invitation),
                is_featured: invitation.is_featured,
              })
              .eq("id", existingInvite.id)
              .select()
              .single();

            if (error) throw new Error(`Failed to update invitation: ${error.message}`);

            results.push({
              email: invitation.email,
              roles: invitation.roles,
              status: "invitation_sent",
              invitation_id: updatedInvite.id,
            });

            continue;
          }
          const { data: newInvite, error } = await this.supabase
            .from("hackathon_vips_invitations")
            .insert({
              email: invitation.email,
              hackathon_id: hackathonId,
              roles: invitation.roles,
              status: "pending",
              challenge_ids: invitation.challengeIds,
              office_hour: invitation.office_hours ?? "",
              payload: JSON.stringify(invitation),
              is_featured: invitation.is_featured,
            })
            .select("*, status, hackathons(name)")
            .single();

          if (error) throw new Error(`Failed to create invitation: ${error.message}`);

          if (newInvite) {
            await this.sendInvitationEmail(
              invitation.email,
              invitation.roles[0],
              newInvite?.hackathons?.name ?? "Hackathon"
            );
          }

          results.push({
            email: invitation.email,
            roles: invitation.roles,
            status: "invitation_sent",
            invitation_id: newInvite.id,
          });

          continue;
        }

        // For existing users, create VIP record immediately
        if (userId) {
          const { data: existingInvite } = await this.supabase
            .from("hackathon_vips_invitations")
            .select("*")
            .eq("hackathon_id", hackathonId)
            .eq("user_id", userId)
            .single();

          if (existingInvite) {
            const { data: updatedInvite, error } = await this.supabase
              .from("hackathon_vips_invitations")
              .update({
                user_id: userId,
                hackathon_id: hackathonId,
                roles: invitation.roles,
                status: "pending",
                challenge_ids: invitation.challengeIds,
                office_hour: invitation.office_hours ?? "",
                payload: JSON.stringify(invitation),
                is_featured: invitation.is_featured ?? false,
              })
              .eq("id", existingInvite.id)
              .select()
              .single();

            if (error) throw new Error(`Failed to update invitation: ${error.message}`);

            results.push({
              email: invitation.email,
              roles: invitation.roles,
              status: "invitation_sent",
              invitation_id: updatedInvite.id,
            });

            continue;
          }

          const { data: newInvite, error } = await this.supabase
            .from("hackathon_vips_invitations")
            .insert({
              user_id: userId,
              hackathon_id: hackathonId,
              roles: invitation.roles,
              status: "pending",
              challenge_ids: invitation.challengeIds,
              office_hour: invitation.office_hours ?? "",
              payload: JSON.stringify(invitation),
              is_featured: invitation.is_featured,
            })
            .select("*, status, hackathons(name), users(*)")
            .single();

          if (error) throw new Error(`Failed to create invitation: ${error.message}`);

          if (newInvite) {
            if (newInvite?.users?.email) {
              await this.sendInvitationEmail(
                newInvite?.users?.email,
                invitation.roles[0],
                newInvite?.hackathons?.name ?? "Hackathon"
              );
            }

            const result = await this.sendInvitationNotification({
              hackathon_id: hackathonId,
              hackathon_name: newInvite?.hackathons?.name ?? "Hackathon",
              status: newInvite?.status,
              user: newInvite?.users as Users,
            });

            if (result.status === "processed") {
              const { error } = await this.supabase
                .from("hackathon_vips_invitations")
                .update({
                  transaction_id: result.transactionId,
                  payload: result.payload,
                })
                .eq("id", newInvite.id)
                .select()
                .single();

              if (error) throw error;
            }
          }

          results.push({
            id: userId,
            email: invitation.email,
            roles: invitation.roles,
            status: "vip_created",
          });
        }
      } catch (error) {
        results.push({
          id: invitation.id,
          email: invitation.email,
          roles: invitation.roles,
          status: `error: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }

    return results;
  }

  async resendHackathonVipNotification(hackathonId: number, identifier: string) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identifier
    );

    const { data: invitation, error } = await this.supabase
      .from("hackathon_vips_invitations")
      .select("*, status, hackathons(name), users(*)")
      .eq("hackathon_id", hackathonId)
      .eq(isUUID ? "user_id" : "email", identifier)
      .maybeSingle();

    if (error) throw new Error(`Failed to update invitation: ${error.message}`);

    if (!invitation) throw new Error(`Invalid Invitation `);

    if (isUUID && invitation?.users) {
      const result = await this.sendInvitationNotification({
        hackathon_id: hackathonId,
        hackathon_name: invitation?.hackathons?.name ?? "Hackathon",
        status: invitation?.status,
        user: invitation?.users as Users,
      });

      if (result.status === "processed") {
        const { error } = await this.supabase
          .from("hackathon_vips_invitations")
          .update({
            transaction_id: result.transactionId,
            payload: result.payload,
          })
          .eq("id", invitation.id)
          .select()
          .single();

        if (error) throw error;
      }
    }

    if (invitation.email && Array.isArray(invitation?.roles) && invitation.roles.length >= 1) {
      await this.sendInvitationEmail(
        invitation?.email,
        invitation?.roles?.[0],
        invitation?.hackathons?.name ?? "Hackathon"
      );
    }
  }

  private validateInvitation(invitation: VipList): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Basic validation
    if (!invitation.id && !invitation.email) {
      errors.push("Either ID or email must be provided");
    }

    if (!invitation.roles || invitation.roles.length === 0) {
      errors.push("At least one role must be specified");
    }

    // Role-specific validation
    // for (const role of invitation.roles) {
    //   const handler = this.roleHandlers.get(role);

    //   if (!handler) {
    //     errors.push(`Unsupported role: ${role}`);
    //     continue;
    //   }

    //   const roleValidation = handler.validateRoleData(invitation);

    //   if (!roleValidation.isValid) {
    //     errors.push(...roleValidation.errors);
    //   }
    // }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private async sendInvitationNotification(data: {
    user: Partial<Users>;
    hackathon_id: number;
    hackathon_name: string;
    status: string;
    role?: VIPRole;
  }) {
    const { user, hackathon_id, hackathon_name, status } = data;
    const transactionId = crypto.randomUUID();

    const payload = {
      hackathon_id,
      hackathon_name,
      status,
      transaction_id: transactionId,
    };

    const novu = new Novu({ secretKey: process.env.NOVU_API_KEY! });

    const email = user?.email ?? undefined;

    const { result } = await novu.trigger({
      workflowId: "invite-user-to-vip-flow-receiver",
      transactionId: transactionId,
      to: [
        {
          subscriberId: user?.id!,
          firstName: user?.full_name?.trim() ?? undefined,
          email,
        },
      ],
      payload,
    });

    return {
      status: result.status,
      transactionId: result.transactionId,
      payload,
    };
  }

  async acceptInvitation(hackathonId: number, userId: string, transactionId: string) {
    const novu = new Novu({ secretKey: process.env.NOVU_API_KEY! });

    const { data: invitation, error: fetchInvitationError } = await this.supabase
      .from("hackathon_vips_invitations")
      .select("*")
      .eq("hackathon_id", hackathonId)
      .eq("user_id", userId)
      .eq("status", "pending")
      .maybeSingle();

    if (fetchInvitationError) {
      throw new Error(`Invitation fetch error: ${fetchInvitationError.message}`);
    }

    if (!invitation) {
      try {
        await novu.messages.deleteByTransactionId(transactionId);
      } catch (error) {
        console.log(error);
      }

      throw new Error("No pending invitation found");
    }

    let { data: existingVip } = await this.supabase
      .from("hackathon_vips")
      .select(
        `
          *,
          users (
            id,
            full_name,
            email,
            main_role
          )
        `
      )
      .eq("hackathon_id", hackathonId)
      .eq("user_id", userId)
      .maybeSingle();

    // if (fetchVipError) {
    //   throw new Error(`Invitation fetch error: ${fetchVipError.message}`);
    // }

    // if (existingVip) {
    //   throw new Error("User already VIP");
    // }

    if (!existingVip) {
      const { error: vipCreationError, data: createdVip } = await this.supabase
        .from("hackathon_vips")
        .insert({
          hackathon_id: hackathonId,
          status: "accepted",
          office_hours: invitation.office_hour ?? null,
          is_featured: invitation.is_featured ?? false,
          user_id: userId,
        })
        .select(
          `
            *,
            users (
              id,
              full_name,
              email,
              main_role
            )
        `
        )
        .single();

      if (vipCreationError) {
        throw new Error(`Failed to accept invitation: ${vipCreationError.message}`);
      }

      existingVip = createdVip;
    } else {
      await this.supabase
        .from("hackathon_vips")
        .update({
          status: "accepted",
        })
        .eq("hackathon_id", hackathonId)
        .eq("user_id", userId)
        .select()
        .maybeSingle();
    }

    const roles = invitation?.roles ?? [];

    for (const role of roles) {
      const handler = this.roleHandlers.get(role as any);

      if (handler) {
        await handler.createRoleRecord(hackathonId, userId, {
          is_featured: invitation.is_featured ?? false,
          challengeIds: invitation.challenge_ids ?? [],
          roles: roles as any[],
        });
      }
    }

    const { full_name, email } = existingVip.users || {};
    const notificationData = invitation.payload;

    const payload = Object.assign({}, notificationData, {
      status: "accepted",
    });

    await novu.messages.deleteByTransactionId(transactionId);

    if (invitation.transaction_id && invitation.transaction_id !== transactionId) {
      await novu.messages.deleteByTransactionId(invitation.transaction_id);
    }

    const { result } = await novu.trigger({
      workflowId: "invite-user-to-vip-flow-receiver",
      to: {
        subscriberId: userId,
        firstName: full_name ?? undefined,
        email: email ?? undefined,
      },
      payload,
    });

    await this.supabase
      .from("hackathon_vips_invitations")
      .delete()
      .eq("id", invitation.id)
      .select()
      .single();

    return existingVip;
  }

  async rejectInvitation(hackathonId: number, userId: string, transactionId: string) {
    const novu = new Novu({ secretKey: process.env.NOVU_API_KEY! });

    const { data: invitation, error: fetchInvitationError } = await this.supabase
      .from("hackathon_vips_invitations")
      .select("*")
      .eq("hackathon_id", hackathonId)
      .eq("user_id", userId)
      .eq("status", "pending")
      .maybeSingle();

    if (fetchInvitationError) {
      throw new Error(`Invitation fetch error: ${fetchInvitationError.message}`);
    }

    if (!invitation) {
      try {
        await novu.messages.deleteByTransactionId(transactionId);
      } catch (error) {
        console.log(error);
      }

      throw new Error("No pending invitation found");
    }

    const { error, data: updatedInvitation } = await this.supabase
      .from("hackathon_vips_invitations")
      .update({
        status: "rejected",
      })
      .eq("id", invitation.id)
      .select(
        `
            *,
            users (
            id,
            full_name,
            email,
            main_role
            )
        `
      )
      .single();

    if (error) {
      throw new Error(`Failed to reject invitation: ${error.message}`);
    }

    const { full_name, email } = updatedInvitation.users || {};
    const notificationData = invitation.payload;

    const payload = Object.assign({}, notificationData, {
      status: "rejected",
    });

    await novu.messages.deleteByTransactionId(transactionId);

    if (invitation.transaction_id && invitation.transaction_id !== transactionId) {
      await novu.messages.deleteByTransactionId(invitation.transaction_id);
    }

    const { result } = await novu.trigger({
      workflowId: "invite-user-to-vip-flow-receiver",
      to: {
        subscriberId: userId,
        firstName: full_name ?? undefined,
        email: email ?? undefined,
      },
      payload,
    });

    await this.supabase
      .from("hackathon_vips_invitations")
      .update({
        transaction_id: result.transactionId,
      })
      .eq("id", invitation.id)
      .select()
      .single();

    return updatedInvitation;
  }

  private async sendInvitationEmail(
    email: string,
    role: string,
    hackathon_name: string
  ): Promise<void> {
    try {
      await axios.post(
        "https://app.loops.so/api/v1/transactional",
        {
          transactionalId: "cmbr050ig05nozs0icpb7um9k",
          email,
          dataVariables: {
            role,
            hackathon_name: `${hackathon_name} Hackathon`,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
          },
        }
      );
    } catch (error) {
      console.error("Failed to send invitation email:", error);
    }
  }

  async removeVip(hackathonId: number, userId: string, roles?: VIPRole[]): Promise<void> {
    const { data: vipRecord } = await this.supabase
      .from("hackathon_vips")
      .select("*")
      .eq("hackathon_id", hackathonId)
      .eq("user_id", userId)
      .single();

    if (!vipRecord) return;

    const { data: userRoles } = await this.supabase
      .from("hackathon_vip_roles")
      .select("role_id, roles(name)")
      .eq("hackathon_id", hackathonId)
      .eq("user_id", userId);

    // If specific roles are provided, only remove those roles
    if (roles) {
      for (const role of roles) {
        const handler = this.roleHandlers.get(role);
        if (handler) {
          await handler.deleteRoleRecord(hackathonId, userId);
        }
      }
    } else {
      if (userRoles) {
        for (const userRole of userRoles) {
          const roleName = userRole.roles?.name?.toLowerCase() as VIPRole;
          const handler = this.roleHandlers.get(roleName);
          if (handler) {
            await handler.deleteRoleRecord(hackathonId, userId);
          }
        }
      }

      await this.supabase
        .from("hackathon_vips")
        .delete()
        .eq("hackathon_id", hackathonId)
        .eq("user_id", userId);

      await this.supabase
        .from("hackathon_vip_roles")
        .delete()
        .eq("hackathon_id", hackathonId)
        .eq("user_id", userId);
    }
  }

  async removeVipInvite(hackathonId: number, identifier: string): Promise<void> {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identifier
    );

    await this.supabase
      .from("hackathon_vips_invitations")
      .delete()
      .eq("hackathon_id", hackathonId)
      .eq(isUUID ? "user_id" : "email", identifier);
  }

  async removeJudge(hackathonId: number, userId: string): Promise<void> {
    const handler = this.roleHandlers.get("judge");
    if (handler) {
      await handler.deleteRoleRecord(hackathonId, userId);
    }

    await this.supabase
      .from("hackathon_vips_invitations")
      .delete()
      .eq("hackathon_id", hackathonId)
      .eq("user_id", userId);

    const { data: remainingRoles } = await this.supabase
      .from("hackathon_vip_roles")
      .select("role_id")
      .eq("hackathon_id", hackathonId)
      .eq("user_id", userId);

    if (!remainingRoles || remainingRoles.length === 0) {
      await this.removeVip(hackathonId, userId);
    }
  }
}

export default VipInvitationService;
