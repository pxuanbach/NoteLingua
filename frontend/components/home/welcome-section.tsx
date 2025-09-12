import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/templates';
import { UserStats } from '@/types';
import { formatDate } from '@/utils/format';

interface WelcomeSectionProps {
  userName: string;
}

export function WelcomeSection({ userName }: WelcomeSectionProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}!</h1>
      <p className="text-muted-foreground">
        Here&apos;s what&apos;s happening with your vocabulary learning journey.
      </p>
    </div>
  );
}
