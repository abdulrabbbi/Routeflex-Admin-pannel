import apiClient from "../api/api"; 

const BUCKET = "routflex-api";
const REGION = "eu-north-1";

export function s3UrlToKey(url: string): string {
  if (!url) return "";
  const p1 = `https://${BUCKET}.s3.${REGION}.amazonaws.com/`;
  const p2 = `https://${BUCKET}.s3.amazonaws.com/`;
  if (url.startsWith(p1)) return url.slice(p1.length);
  if (url.startsWith(p2)) return url.slice(p2.length);
  return url; // already a key
}

export async function getSignedUrlForKey(key: string, ttl = 300): Promise<string> {
  if (!key) throw new Error("key required");
  try {
    const res = await apiClient.get("/files/signed-url", {
      params: { key, ttl },
      // NOTE: no need for withCredentials when using Bearer token,
      // your axios interceptor will attach Authorization for you.
    });
    return res.data?.url as string;
  } catch (e: any) {
    console.error("Signed URL request failed:", e?.response?.status, e?.response?.data || e?.message);
    throw e;
  }
}

export async function getSignedUrl(value: string, ttl = 300) {
  const key = s3UrlToKey(value);
  return getSignedUrlForKey(key, ttl);
}

export function looksLikeImage(pathOrKey: string) {
  return /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(pathOrKey);
}
