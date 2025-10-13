import React from "react";

type Props = {
  fullName: string;
  src?: string | null;
  size?: number; // px
  className?: string;
};

/**
 * Small avatar for list rows.
 * - Renders <img> when `src` exists and loads.
 * - Falls back to colored initials circle.
 * - If even initials are empty, shows full name as text (last resort).
 */
const AvatarCell: React.FC<Props> = ({ fullName, src, size = 40, className }) => {
  const [errored, setErrored] = React.useState(false);
  
  // Reset error state when 'src' changes (e.g., after signed URL resolves)
  React.useEffect(() => {
    setErrored(false);
  }, [src]);

  const initials = React.useMemo(() => {
    const s = (fullName || "").trim();
    if (!s) return "";
    const parts = s.split(/\s+/).slice(0, 2);
    return parts.map(p => p[0]?.toUpperCase()).join("");
  }, [fullName]);

  // If we have no src OR the image errored → show fallback
  const showFallback = !src || errored;

  if (showFallback) {
    if (!initials) {
      // absolute fallback: just text
      return (
        <span className={`text-sm text-gray-700 ${className || ""}`}>
          {fullName || "-"}
        </span>
      );
    }
    return (
      <div
        title={fullName}
        className={`inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-medium ${className || ""}`}
        style={{ width: size, height: size }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src!}
      width={size}
      height={size}
      alt={fullName || "avatar"}
      title={fullName}
      className={`inline-block rounded-full object-cover bg-gray-200 ${className || ""}`}
      onError={() => setErrored(true)}
      loading="lazy"
      decoding="async"
    />
  );
};

export default React.memo(AvatarCell);
