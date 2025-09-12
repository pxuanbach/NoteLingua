import { Loading } from '@/components/templates';

export default function LoadingPage() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Loading />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading document...</p>
      </div>
    </div>
  );
}
