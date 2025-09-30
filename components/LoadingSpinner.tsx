interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({
  size = 'md',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`animate-spin ${sizeClasses[size]} ${className}`}>
      <svg
        className="w-full h-full"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 2v4m0 12v4m8-10h-4M6 12H2m15.364-6.364l-2.828 2.828M9.464 9.464L6.636 6.636m12.728 12.728l-2.828-2.828M9.464 14.536l-2.828 2.828"
        />
      </svg>
    </div>
  );
}
