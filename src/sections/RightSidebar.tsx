import { IoClose, IoNotifications } from "react-icons/io5";
import {
  getNotifications,
  markNotificationAsRead,
} from "../api/deliveryService";
import { MdCheck, MdDone, MdClose } from "react-icons/md";
import { Images } from "../assets/images";
import { useState, useEffect } from "react";
import Chat from "../components/ChatPopup";
import apiClient from "../api/api";
import { getImageUrl } from "../utils/getImageUrl";

const RightSidebar = ({ isOpen, setIsOpen }: any) => {
  const [activeChat, setActiveChat] = useState(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [contacts, setContacts] = useState([]);

   const fetchNotifications = async () => {
    try {
      const data = await getNotifications(20, 1);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await apiClient.get("/users", {
          params: { role: "driver", page: 1, limit: 20 },
        });
        const formatted = res.data.data.users.map((driver: any) => ({
          id: driver._id,
          name: `${driver.firstName} ${driver.lastName}`,
          avatar: driver.profilePicture || "/placeholder.svg",
        }));

        setContacts(formatted);
      } catch (err) {
        console.error("Failed to load drivers:", err);
      }
    };

    fetchDrivers();
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 right-0 w-80 bg-white transform z-[1001]
        ${isOpen ? "translate-x-0" : "translate-x-full"}
        lg:translate-x-0 transition-transform duration-200 ease-in-out
        border-l z-30 overflow-y-auto
      `}
      >
        <div className="p-6 space-y-8">
          {/* Close button for mobile */}
          <button
            className="absolute top-4 right-4 lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <IoClose size={24} />
          </button>

          {/* Notifications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <button className="text-green-500 text-sm">Show All</button>
            </div>

            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-gray-400 text-center py-10">
                  No new notifications.
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className="relative group flex gap-3 bg-gray-50 hover:bg-gray-100 transition rounded-lg p-4 border border-gray-200"
                  >
                    <div className="rounded-full bg-green-100 p-2 h-fit">
                      <IoNotifications className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className="font-medium text-gray-800">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="hidden group-hover:flex absolute top-2 right-2 bg-green-100 hover:bg-green-200 p-1 rounded"
                      title="Mark as Read"
                    >
                      <MdCheck className="h-4 w-4 text-green-500" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Contacts</h3>
              <button className="text-green-500 text-sm">Show All</button>
            </div>
            <div className="space-y-4">
              {contacts.map((contact: any) => (
                <button
                  onClick={() => setActiveChat(contact)}
                  key={contact.id}
                  className="flex items-center gap-3"
                >
                  <img
                    src={getImageUrl(contact.avatar)}
                    alt={contact.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <p className="font-medium">{contact.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {activeChat && (
        <Chat contact={activeChat} onClose={() => setActiveChat(null)} />
      )}
    </>
  );
};

export default RightSidebar;
