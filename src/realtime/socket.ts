import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentToken: string | null = null;

export function initSocket(baseUrl: string, token: string) {
  if (socket && socket.connected && token === currentToken) return socket;

  currentToken = token;

  // close previous if token changed
  if (socket) {
    try {
      socket.disconnect();
    } catch {}
    socket = null;
  }

  socket = io(baseUrl, {
    // Let Socket.IO fall back to HTTP polling if WS is blocked by a proxy/CDN
    transports: ["websocket", "polling"],
    // Explicit path in case the server mounts Socket.IO on a non-root app
    path: "/socket.io",
    auth: { token }, // JWT handshake (backend reads this)
    reconnection: true,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    autoConnect: true,
  });

  // optional useful logs (dev only)
  let evn = true;    // this is for dev only
  if (evn) {
    socket.on("connect", () => console.log("[socket] connected", socket?.id));
    socket.on("disconnect", (r) => console.log("[socket] disconnected", r));
    socket.on("connect_error", (e) =>
      console.warn("[socket] connect_error", e?.message || e)
    );
  }

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function closeSocket() {
  if (socket) {
    try {
      socket.disconnect();
    } catch {}
  }
  socket = null;
  currentToken = null;
}
