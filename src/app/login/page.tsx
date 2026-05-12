import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <AuthCard title="Staff sign in" subtitle="Access the trading CRM backoffice with your admin or staff account.">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
