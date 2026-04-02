interface SkeletonProps {
  /** CSS width value — e.g. '100%', '12rem', '80px' */
  width?: string;
  /** CSS height value — e.g. '1rem', '40px' */
  height?: string;
  /** When true the skeleton renders as a circle / pill shape */
  rounded?: boolean;
  className?: string;
}

/**
 * A reusable skeleton placeholder that pulses while content is loading.
 * Combine multiple instances to compose page-specific skeleton layouts such as
 * PermitCardSkeleton.
 */
export function Skeleton({
  width = '100%',
  height = '1rem',
  rounded = false,
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${
        rounded ? 'rounded-full' : 'rounded-md'
      } ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
