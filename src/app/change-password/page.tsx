import { LockKeyhole } from "lucide-react";
import {
  AuthGuard,
  ChangePasswordForm,
} from "@/features/auth/components";
import { APP_CONFIG } from "@/lib/constants/app";

export default function ChangePasswordPage() {
  return (
    <AuthGuard
      allowPasswordChangeRequired
      redirectWhenPasswordChangeResolved
    >
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-white shadow-card">
              <LockKeyhole className="size-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">
                {APP_CONFIG.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Password update required
              </p>
            </div>
          </div>

          <ChangePasswordForm />
        </div>
      </main>
    </AuthGuard>
  );
}
