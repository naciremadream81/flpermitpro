import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center"
      data-testid="not-found-page"
    >
      <AlertCircle
        className="mb-4 h-14 w-14 text-amber-500 dark:text-amber-400"
        strokeWidth={1.5}
        aria-hidden
      />
      <h1 className="text-gray-900 dark:text-gray-100">
        <span className="block text-8xl font-bold tabular-nums tracking-tight">404</span>
        <span className="mt-2 block text-xl font-semibold text-gray-800 dark:text-gray-200">
          Page not found
        </span>
      </h1>
      <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
