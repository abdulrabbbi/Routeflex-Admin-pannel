import { useEffect, useRef } from "react";
import { useSocket } from "./SocketProvider";

type OnNew = (n: any) => void;
type OnRead = (payload: { id: string; readAt?: string | Date }) => void;

export function useNotifications({
  onNew,
  onRead,
}: {
  onNew?: OnNew;
  onRead?: OnRead;
}) {
  const socket = useSocket();
  const onNewRef = useRef(onNew);
  const onReadRef = useRef(onRead);

  useEffect(() => {
    onNewRef.current = onNew;
  }, [onNew]);
  useEffect(() => {
    onReadRef.current = onRead;
  }, [onRead]);

  useEffect(() => {
    if (!socket) {
      console.warn("[notify] socket not ready yet");
      return;
    }

    const handleNewA = (n: any) => {
      console.log("[socket] notify:new", n);
      onNewRef.current?.(n);
    };
    const handleNewB = (n: any) => {
      console.log("[socket] notification:new", n);
      onNewRef.current?.(n);
    };
    const handleReadA = (p: any) => {
      console.log("[socket] notify:read", p);
      onReadRef.current?.(p);
    };
    const handleReadB = (p: any) => {
      console.log("[socket] notification:read", p);
      onReadRef.current?.(p);
    };

    socket.on("notify:new", handleNewA);
    socket.on("notification:new", handleNewB);
    socket.on("notify:read", handleReadA);
    socket.on("notification:read", handleReadB);

    return () => {
      socket.off("notify:new", handleNewA);
      socket.off("notification:new", handleNewB);
      socket.off("notify:read", handleReadA);
      socket.off("notification:read", handleReadB);
    };
  }, [socket]);
}
