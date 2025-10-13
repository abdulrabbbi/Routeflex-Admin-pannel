import { useEffect, useState } from "react";
import { getSignedUrl, s3UrlToKey } from "../utils/s3";

export function useSignedUrl(input?: string, ttl = 300) {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(!!input);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setError("");
        if (!input) {
          setUrl("");
          setLoading(false);
          return;
        }
        setLoading(true);
        // Accept either full S3 URL or key
        const signed = await getSignedUrl(s3UrlToKey(input), ttl);
        if (alive) setUrl(signed);
      } catch (e: any) {
        if (alive) setError(e?.message || "Failed to sign URL");
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [input, ttl]);

  return { url, loading, error };
}
