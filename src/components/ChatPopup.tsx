"use client";

import { IoClose } from "react-icons/io5";
import { MdSend, MdAccessTime, MdDone, MdDoneAll } from "react-icons/md";
import { useEffect, useRef, useState, useCallback } from "react";
import apiClient from "../api/api";
import { getImageUrl } from "../utils/getImageUrl";
import { useChatThread } from "../realtime/useChatThread";
import { useSocket } from "../realtime/SocketProvider";

type ChatProps = {
  contact: { id: string; name: string; avatar?: string };
  onClose: () => void;
};

type Msg = {
  _id: string;
  sender: any;     // string or populated user
  recipient?: any; // string or populated user
  room?: string | null;
  content: string;
  createdAt?: string | Date;
  read?: boolean;
};

function asId(v: any): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v._id) return String(v._id);
  return String(v);
}

const Chat = ({ contact, onClose }: ChatProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const meId = typeof window !== "undefined" ? (localStorage.getItem("userId") || "") : "";
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const socket = useSocket();
  const [connected, setConnected] = useState<boolean>(!!socket?.connected);
  const [peerTyping, setPeerTyping] = useState<boolean>(false);
  const typingTimerRef = useRef<any>(null);
  const lastTypingEmitRef = useRef<number>(0);

  // upsert by _id (prevents dupes when REST + socket both deliver the same msg)
  const upsert = useCallback((arr: Msg[], item: Msg) => {
    const idx = arr.findIndex((m) => String(m._id) === String(item._id));
    if (idx === -1) return [...arr, item];
    const copy = arr.slice();
    copy[idx] = item;
    return copy;
  }, []);

  // Fetch conversation on open / contact change
  useEffect(() => {
    let cancelled = false;

    const fetchMessages = async () => {
      try {
        const res = await apiClient.get(`/chat/conversation/${contact.id}`);
        if (cancelled) return;
        setMessages(res.data?.data?.messages || []);
        // autoscroll on first load
        setTimeout(() => {
          listRef.current?.scrollTo({
            top: listRef.current.scrollHeight,
            behavior: "smooth",
          });
        }, 0);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    if (contact?.id) fetchMessages();
    return () => {
      cancelled = true;
    };
  }, [contact]);

  // Focus input on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Subscribe to real-time DMs with this peer (ONLY this thread)
  const onIncoming = useCallback(
    (msg: Msg) => {
      setMessages((prev) => upsert(prev, msg));
      // autoscroll on incoming
      setTimeout(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 0);
    },
    [upsert]
  );
  useChatThread(contact.id, meId, onIncoming);

  // Track socket connection state and peer typing events
  useEffect(() => {
    setConnected(!!socket?.connected);
    if (!socket) return;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onReconnect = () => setConnected(true);

    // Peer typing handler (supports a couple of event shapes)
    const handleTyping = (p: any) => {
      const from = asId(p?.from ?? p?.sender);
      const to = asId(p?.to ?? p?.recipient);
      const peerId = String(contact.id);
      const me = String(meId);
      if (from && from === peerId && (!to || to === me)) {
        setPeerTyping(true);
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setPeerTyping(false), 2500);
      }
    };
    const handleTypingStop = (p: any) => {
      const from = asId(p?.from ?? p?.sender);
      const peerId = String(contact.id);
      if (from && from === peerId) setPeerTyping(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("reconnect", onReconnect);
    socket.on("chat:typing", handleTyping);
    socket.on("typing", handleTyping); // legacy alias
    socket.on("chat:typing:stop", handleTypingStop);

    // Optional thread subscription (no-op if server doesn't support)
    try {
      if (contact?.id && meId) {
        socket.emit("chat:subscribe", { with: contact.id });
      }
    } catch {}

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("reconnect", onReconnect);
      socket.off("chat:typing", handleTyping);
      socket.off("typing", handleTyping);
      socket.off("chat:typing:stop", handleTypingStop);
      try {
        if (contact?.id && meId) socket.emit("chat:unsubscribe", { with: contact.id });
      } catch {}
    };
  }, [socket, contact?.id, meId]);

  // Mark unread messages addressed to me as read (fire-and-forget)
  useEffect(() => {
    if (!meId) return;
    const unreadToMe = messages.filter((m) => asId(m.recipient) === meId && !m.read);
    if (unreadToMe.length) {
      const ids = unreadToMe.map((m) => m._id);
      apiClient.patch("/chat/mark-read", { messageIds: ids }).catch(() => {});
    }
  }, [messages, meId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim();
    if (!text || !contact?.id) return;

    // optimistic
    const tmpId = `tmp_${Date.now()}`;
    const optimistic: Msg = {
      _id: tmpId,
      sender: meId,
      recipient: contact.id,
      content: text,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages((prev) => [...prev, optimistic]);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("recipient", contact.id);
      formData.append("content", text);

      // Optional idempotency key; your server can de-dupe using a unique index
      if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        formData.append("clientMessageId", crypto.randomUUID());
      }

      const res = await apiClient.post("/chat/send", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newMsg: Msg = res.data?.data?.message;
      setMessages((prev) => {
        const withoutTmp = prev.filter((m) => m._id !== tmpId);
        const idx = withoutTmp.findIndex((m) => String(m._id) === String(newMsg._id));
        if (idx === -1) return [...withoutTmp, newMsg];
        const copy = withoutTmp.slice();
        copy[idx] = newMsg;
        return copy;
      });
      // Notify peer that I'm not typing anymore
      try { socket?.emit("chat:typing:stop", { to: contact.id }); } catch {}
    } catch (err) {
      console.error("Message send failed", err);
      // rollback optimistic on failure
      setMessages((prev) => prev.filter((m) => m._id !== tmpId));
      setMessage(text); // restore for retry
    } finally {
      setTimeout(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 0);
    }
  };

  const emitTyping = () => {
    const now = Date.now();
    if (!socket || !contact?.id) return;
    if (now - lastTypingEmitRef.current < 800) return; // throttle
    lastTypingEmitRef.current = now;
    try {
      socket.emit("chat:typing", { to: contact.id });
    } catch {}
  };

  const handleInputChange = (v: string) => {
    setMessage(v);
    if (v.trim()) emitTyping();
    else {
      try { socket?.emit("chat:typing:stop", { to: contact.id }); } catch {}
    }
  };

  return (
    <div className="fixed bottom-4 right-4 lg:right-[330px] w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <img
            src={getImageUrl(contact.avatar || "/placeholder.svg")}
            alt={contact.name}
            className="h-10 w-10 rounded-full"
          />
          <div>
            <h3 className="font-medium text-[#1e1e38]">{contact.name}</h3>
            <p className="text-sm text-gray-500">
              {connected ? (peerTyping ? "Typing…" : "Online") : "Reconnecting…"}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <IoClose className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div ref={listRef} className="h-96 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const senderId = asId(msg.sender);
          const isIncoming = senderId === String(contact.id);
          const isMine = senderId === String(meId);
          const isTemp = String(msg._id).startsWith("tmp_");
          const when = msg.createdAt ? new Date(msg.createdAt) : undefined;
          const timeLabel = when
            ? when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "";
          return (
            <div
              key={msg._id}
              className={`flex ${isIncoming ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  isIncoming ? "bg-gray-100 text-[#1e1e38]" : "bg-[#22c55e] text-white"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                <div className={`mt-1 flex items-center gap-1 ${isIncoming ? "text-gray-500" : "text-white/80"}`}>
                  <span className="text-[10px] leading-none">{timeLabel}</span>
                  {isMine ? (
                    isTemp ? (
                      <MdAccessTime className="h-3 w-3" />
                    ) : msg.read ? (
                      <MdDoneAll className="h-3 w-3" />
                    ) : (
                      <MdDone className="h-3 w-3" />
                    )
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            ref={inputRef}
            value={message}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
              }
            }}
            aria-label="Message"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2 bg-[#22c55e] text-white rounded-full hover:bg-[#1ea550] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
            <MdSend className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
