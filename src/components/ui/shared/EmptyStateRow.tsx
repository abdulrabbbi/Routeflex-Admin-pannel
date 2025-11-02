export const EmptyStateRow: React.FC<{
  colSpan: number;
  title: string;
  hint?: string;
}> = ({ colSpan, title, hint }) => (
  <tr>
    <td colSpan={colSpan} className="h-48 px-6"> {/* set height */}
      <div className="flex flex-col items-center justify-center text-center h-full">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-3">
          <svg
            className="h-6 w-6 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7h18M3 12h18M3 17h18"
            />
          </svg>
        </span>
        <p className="font-medium text-gray-700">{title}</p>
        {hint && <p className="text-sm text-gray-500 mt-1">{hint}</p>}
      </div>
    </td>
  </tr>
);
