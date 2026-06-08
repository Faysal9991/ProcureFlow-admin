import { ROUTES } from "@/lib/constants/routes";
import type { AuthUser } from "@/types/auth";

export function getAuthenticatedRedirectPath(user: AuthUser) {
  if (user.mustChangePassword) {
    return ROUTES.changePassword;
  }

  if (user.role === "SUPER_ADMIN") {
    return ROUTES.platformCompanies;
  }

  return ROUTES.dashboard;
}
