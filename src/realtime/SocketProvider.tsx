import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Socket } from "socket.io-client";
import { initSocket, closeSocket, getSocket } from "./socket";

type Ctx = Socket | null;
const SocketCtx = createContext<Ctx>(null);

export function SocketProvider({
  accessToken,
  baseUrl,
  children,
}: {
  accessToken: string | null | undefined;
  baseUrl: string;
  children: React.ReactNode;
}) {
  const [sock, setSock] = useState<Socket | null>(null);

  useEffect(() => {
    // no token => ensure disconnected
    if (!accessToken) {
      closeSocket();
      setSock(null);
      return;
    }
    // (re)connect with current token
    const s = initSocket(baseUrl, accessToken);
    setSock(s);

    // DEV: expose for quick debugging in console
    if (typeof window !== "undefined") {
      (window as any).__socket = s;
    }

    return () => {
      // do not auto close on unmount (keeps singleton alive during route changes)
      // comment in if you prefer strict cleanup:
      // closeSocket();
      // setSock(null);
    };
  }, [accessToken, baseUrl]);

  // (optional) listen here once to prove events arrive at app level
  useEffect(() => {
    if (!sock) return;
    const logNew = (n: any) => console.log("[socket] notify:new (provider)", n);
    const logNewLegacy = (n: any) => console.log("[socket] notification:new (provider)", n);
    sock.on("notify:new", logNew);
    sock.on("notification:new", logNewLegacy);
    return () => {
      sock.off("notify:new", logNew);
      sock.off("notification:new", logNewLegacy);
    };
  }, [sock]);

  const value = useMemo(() => sock ?? getSocket(), [sock]);
  return <SocketCtx.Provider value={value}>{children}</SocketCtx.Provider>;
}

export const useSocket = () => useContext(SocketCtx);
