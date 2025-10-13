import { useEffect, useState } from "react";
import { getSignedUrl, s3UrlToKey }  from "../../utils/s3";


type Props = {
  value?: string; 
  size?: number;
  fallbackSrc?: string;
  className?: string;
};

export default function AvatarSigned({
  value,
  size = 128,
  fallbackSrc = "/placeholder.svg",
  className = "",
}: Props) {
  const [url, setUrl] = useState<string>(fallbackSrc);
  const [loading, setLoading] = useState<boolean>(!!value);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (!value) {
          setUrl(fallbackSrc);
          setLoading(false);
          return;
        }
        setLoading(true);
        const signed = await getSignedUrl(s3UrlToKey(value), 300);
        if (alive) setUrl(signed || fallbackSrc);
      } catch {
        if (alive) setUrl(fallbackSrc);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [value, fallbackSrc]);

  return (
    <img
      src={loading ? fallbackSrc : url}
      alt="avatar"
      width={size}
      height={size}
      className={`rounded-full object-cover border-4 border-[#22c55e] ${className}`}
    />
  );
}
