import { redirectIfAuthenticated } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  await redirectIfAuthenticated();
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <LoginForm />
      </div>
    </div>
  );
}
