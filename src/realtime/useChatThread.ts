import { useEffect, useRef } from "react";
import { useSocket } from "./SocketProvider";

function idOf(v: any): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v._id) return String(v._id);
  return String(v);
}

/**
 * Subscribe to 1:1 DM messages between meUserId and peerUserId.
 * Filters out room messages and only invokes onMessage for this specific thread.
 */
export function useChatThread(
  peerUserId: string | null | undefined,
  meUserId: string | null | undefined,
  onMessage: (msg: any) => void
) {
  const socket = useSocket();
  const peerRef = useRef<string>("");
  const meRef = useRef<string>("");
  const cbRef = useRef(onMessage);

  useEffect(() => { peerRef.current = String(peerUserId || ""); }, [peerUserId]);
  useEffect(() => { meRef.current = String(meUserId || ""); }, [meUserId]);
  useEffect(() => { cbRef.current = onMessage; }, [onMessage]);

  useEffect(() => {
    if (!socket) return;

    const handle = (msg: any) => {
      // Only DMs (server sets room for job/ticket messages)
      if (msg?.room) return;

      const s = idOf(msg.sender);
      const r = idOf(msg.recipient);
      const me = meRef.current;
      const peer = peerRef.current;

      // strictly me<->peer (both directions)
      const isThisThread = (s === me && r === peer) || (s === peer && r === me);
      if (isThisThread) cbRef.current?.(msg);
    };

    socket.on("chat:new", handle);
    socket.on("newMessage", handle); // legacy alias

    return () => {
      socket.off("chat:new", handle);
      socket.off("newMessage", handle);
    };
  }, [socket]);
}
