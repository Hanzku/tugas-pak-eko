interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  message?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export default function EmptyState({ icon = '📭', title, description, message, action }: EmptyStateProps) {
  const textDesc = description || message;
  return (
    <div className="w-full py-12 px-4 flex flex-col items-center justify-center text-center bg-gray-50 border border-gray-200 border-dashed rounded-lg">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      {textDesc && (
        <p className="text-sm text-gray-500 max-w-sm mb-6">{textDesc}</p>
      )}
      
      {action && (
        action.href ? (
          <a
            href={action.href}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1e3a5f] hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {action.label}
          </a>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1e3a5f] hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}

export { EmptyState };
