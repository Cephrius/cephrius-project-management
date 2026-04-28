import { requireEmployee } from "@/lib/auth/employee";
import { ChangePasswordForm } from "./change-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ChangePasswordPage() {
  const employee = await requireEmployee();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle>Set a new password</CardTitle>
          <CardDescription>
            Welcome, {employee.name}. Choose a password you&apos;ll remember
            (at least 10 characters).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </main>
  );
}
