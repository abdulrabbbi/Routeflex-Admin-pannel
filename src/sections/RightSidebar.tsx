import { useState } from "react";
import { IoClose } from "react-icons/io5";
import Chat from "../components/rightbar/ChatPopup";
import NotificationsPanel from "../components/rightbar/NotificationsPanel";
import ContactsPanel from "../components/rightbar/ContactsPanel";

export type Contact = { id: string; name: string; avatar?: string };

type Props = {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
};

export default function RightSidebar({ isOpen, setIsOpen }: Props) {
  const [activeChat, setActiveChat] = useState<Contact | null>(null);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar shell */}
      <aside
        className={`fixed lg:static inset-y-0 right-0 w-80 bg-white transform z-[1001]
        ${isOpen ? "translate-x-0" : "translate-x-full"}
        lg:translate-x-0 transition-transform duration-200 ease-in-out
        border-l max-h-screen h-full overflow-hidden`}
      >
        <div className="p-6 h-full flex flex-col gap-8">
          {/* Close (mobile) */}
          <button
            className="absolute top-4 right-4 lg:hidden"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <IoClose size={24} />
          </button>

          {/* Top: notifications (1/2 height) */}
          <NotificationsPanel className="basis-1/2 min-h-0" />

          {/* Bottom: contacts (1/2 height) */}
          <ContactsPanel
            className="basis-1/2 min-h-0"
            onOpenChat={(c) => setActiveChat(c)}
          />
        </div>
      </aside>

      {/* Floating chat popup */}
      {activeChat && (
        <Chat contact={activeChat} onClose={() => setActiveChat(null)} />
      )}
    </>
  );
}
