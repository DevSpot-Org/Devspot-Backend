export type Role = "guest" | "user" | "admin" | "tech_owner";

export interface RoutePermission {
  authRequired: boolean;
  allowedRoles?: Role[];
}

export const routePermissions: Record<string, RoutePermission> = {
  "/api/user/profile": { authRequired: true, allowedRoles: ["user", "admin"] },
  "/api/admin/stats": { authRequired: true, allowedRoles: ["admin"] },
  "/api/tech/ownership": { authRequired: true, allowedRoles: ["tech_owner"] },
  "/api/public/info": { authRequired: false }, 
};
