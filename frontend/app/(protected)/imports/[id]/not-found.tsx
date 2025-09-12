import Link from 'next/link';
import { Button } from '@/components/templates';

export default function NotFound() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Document Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The document you are looking for does not exist or has been removed.
        </p>
        <Link href="/imports">
          <Button>Back to Documents</Button>
        </Link>
      </div>
    </div>
  );
}
