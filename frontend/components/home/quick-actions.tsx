import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from '@/components/templates';
import Link from 'next/link';

export function QuickActions() {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with your vocabulary learning</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/vocabularies" className="block">
            <Button variant="outline">📝 Manage Vocabularies</Button>
          </Link>
          <Button variant="outline">📄 Import Document</Button>
          <Button variant="outline">🎯 Practice Words</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Learning Progress</CardTitle>
          <CardDescription>Your vocabulary learning statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm">Words learned this week</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Review accuracy</span>
              <span className="font-semibold">0%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Time spent learning</span>
              <span className="font-semibold">0h</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
