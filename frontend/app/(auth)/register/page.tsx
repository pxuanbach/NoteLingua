import { redirectIfAuthenticated } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage() {
  await redirectIfAuthenticated();
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <RegisterForm />
      </div>
    </div>
  );
}
