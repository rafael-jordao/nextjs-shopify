import { Card, CardContent } from './ui/card';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  const defaultIcon = (
    <svg
      className="w-16 h-16 text-gray-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );

  return (
    <Card className={`${className}`}>
      <CardContent className="flex flex-col items-center justify-center text-center py-16">
        <div className="mb-8">{icon || defaultIcon}</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 mb-8 max-w-md">{description}</p>
        {action && <div>{action}</div>}
      </CardContent>
    </Card>
  );
}
