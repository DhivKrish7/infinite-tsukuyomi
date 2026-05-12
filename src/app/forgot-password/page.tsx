import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Reset staff password" subtitle="Request a time-limited reset link for your backoffice account.">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
