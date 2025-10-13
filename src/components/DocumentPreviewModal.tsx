import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  url?: string; // signed URL
  isImage?: boolean; // if false, show "Open in new tab"
  loading?: boolean; // upstream fetch state
  error?: string; // upstream error
};

export default function DocumentPreviewModal({
  open,
  onClose,
  title = "Document",
  url,
  isImage = true,
  loading = false,
  error,
}: Props) {
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);

  // when url changes, reset image states
  useEffect(() => {
    setImgLoading(!!(url && isImage));
    setImgError(null);
  }, [url, isImage]);

  if (!open) return null;

  const showSkeleton = loading || (isImage && imgLoading && !error);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} preview`}
    >
      <div className="bg-white rounded-lg w-full max-w-3xl overflow-hidden shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold">{title}</h4>
          <button
            className="text-gray-500 hover:text-gray-700 p-1 rounded focus:outline-none focus:ring-2 focus:ring-gray-300"
            onClick={onClose}
            aria-label="Close preview"
          >
            <FiX size={22} />
          </button>
        </div>

        <div className="p-4 min-h-[320px] flex items-center justify-center">
          {error ? (
            <p className="text-red-600 text-sm">{error}</p>
          ) : !url ? (
            <div className="text-sm text-gray-500">Preparing preview…</div>
          ) : isImage ? (
            <div className="relative w-full h-[60vh] max-h-[70vh] flex items-center justify-center">
              {showSkeleton && (
                <div className="absolute inset-0 rounded-lg bg-gray-200 overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
              )}
              <style>{`@keyframes shimmer { 100% { transform: translateX(100%);} }`}</style>
              <img
                src={url}
                alt={title}
                className={`max-h-[70vh] w-auto max-w-full rounded object-contain transition-opacity duration-300 ${
                  imgLoading ? "opacity-0" : "opacity-100"
                }`}
                onLoad={() => setImgLoading(false)}
                onError={() => {
                  setImgLoading(false);
                  setImgError("Failed to load image.");
                }}
              />
            </div>
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline break-all"
            >
              Open document in new tab
            </a>
          )}
        </div>

        {(imgError && url) && (
          <div className="px-4 pb-4 -mt-2 space-y-1">
            <p className="text-xs text-red-600">{imgError}</p>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 underline break-all"
            >
              Open image in new tab
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

