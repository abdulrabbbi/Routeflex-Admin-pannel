import { useCallback, useEffect, useMemo, useState } from "react";
import apiClient from "../../api/api";
import { getImageUrl } from "../../utils/getImageUrl";
import { getSignedUrl, s3UrlToKey } from "../../utils/s3";
import AvatarCell from "../drivers/AvatarCell";
import type { Contact } from "../../sections/RightSidebar";

type Props = {
  className?: string;
  limit?: number;
  onOpenChat: (c: Contact) => void;
};

export default function ContactsPanel({
  className = "",
  limit = 20,
  onOpenChat,
}: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [signedMap, setSignedMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/users", {
        params: { role: "driver", page: 1, limit },
      });
      const formatted: Contact[] = (res.data?.data?.users || []).map(
        (driver: any) => ({
          id: driver._id,
          name:
            `${driver.firstName ?? ""} ${driver.lastName ?? ""}`.trim() ||
            driver.email ||
            "Driver",
          avatar: driver.profilePicture || "", // may be S3 key or URL or empty
        })
      );
      setContacts(formatted);
    } catch (err) {
      console.error("Failed to load drivers:", err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // Resolve signed URLs for avatars that are S3 keys / S3 URLs
  useEffect(() => {
    let cancelled = false;

    const avatars = Array.from(
      new Set(
        contacts
          .map((c) => c.avatar)
          .filter((v): v is string => typeof v === "string" && v.length > 0)
      )
    );

    const needsSigning = (v: string) => {
      const isHttp = /^https?:/i.test(v);
      const isS3Http = isHttp && /amazonaws\.com/.test(v);
      const isKeyLikely = !isHttp && !v.startsWith("/");
      return isS3Http || isKeyLikely;
    };

    (async () => {
      const work = avatars.filter(needsSigning).map(async (v) => {
        try {
          const key = s3UrlToKey(v);
          const url = await getSignedUrl(key, 300);
          return { original: v, url };
        } catch {
          return null;
        }
      });
      const pairs = await Promise.all(work);
      if (cancelled) return;

      const next: Record<string, string> = {};
      for (const p of pairs) if (p?.url) next[p.original] = p.url;
      if (Object.keys(next).length) {
        setSignedMap((prev) => ({ ...prev, ...next }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [contacts]);

  const body = useMemo(() => {
    if (loading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-3 w-2/3 rounded bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
      );
    }

    if (!contacts.length) {
      return (
        <div className="text-gray-400 text-center py-6">No contacts found.</div>
      );
    }

    return (
      <div className="space-y-4">
        {contacts.map((c) => {
          const v = c.avatar || "";
          const signed = v ? signedMap[v] : undefined;
          const isHttp = /^https?:/i.test(v);
          const isS3Http = isHttp && /amazonaws\.com/.test(v);
          const isKeyLikely = !isHttp && !!v && !v.startsWith("/");
          const src = signed
            ? signed
            : isS3Http || isKeyLikely
            ? undefined // wait for signed; show initials
            : v
            ? getImageUrl(v)
            : undefined;

          return (
            <button
              key={c.id}
              onClick={() => onOpenChat(c)}
              className="flex items-center gap-3 w-full text-left hover:bg-gray-50 rounded-lg p-2"
            >
              <AvatarCell fullName={c.name} src={src} size={40} />
              <p className="font-medium truncate">{c.name}</p>
            </button>
          );
        })}
      </div>
    );
  }, [contacts, loading, onOpenChat, signedMap]);

  return (
    <section className={`flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-white z-10">
        <h3 className="text-lg font-semibold">Contacts</h3>
        <button
          className="text-green-600 text-sm hover:underline"
          onClick={fetchDrivers}
          title="Reload"
        >
          Refresh
        </button>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">{body}</div>
    </section>
  );
}
