"use client";

interface InsertCardButtonProps {
  onClick: () => void;
}

export default function InsertCardButton({ onClick }: InsertCardButtonProps) {
  return (
    <div className="flex justify-center py-2">
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-dashed border-gray-300 hover:border-blue-300 rounded-lg transition-all duration-200"
        title="Insert new card"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span className="font-medium">Insert Card</span>
      </button>
    </div>
  );
}
