import { IoClose, IoNotifications } from "react-icons/io5"
import { MdCheck, MdClose } from "react-icons/md"
import { Images } from "../assets/images"

const notifications = [
   { id: 1, title: "Order delivered", time: "Just now" },
   { id: 2, title: "Transaction complete", time: "1 min" },
   { id: 3, title: "Order delivered", time: "10 min" },
   { id: 4, title: "Order delivered", time: "1 hr" },
]

const requests = [
   { id: 1, name: "Natali Craig", type: "Order", avatar: Images.Avatar },
   { id: 2, name: "Drew Cano", type: "Driver", avatar: Images.Avatar },
   { id: 3, name: "Andi Lane", type: "Driver", avatar: Images.Avatar },
]

const contacts = [
   { id: 1, name: "Natali Craig", avatar: Images.Avatar },
   { id: 2, name: "Drew Cano", avatar: Images.Avatar },
   { id: 3, name: "Andi Lane", avatar: Images.Avatar },
]

const RightSidebar = ({ isOpen, setIsOpen }: any) => {
   return (
      <>
         {/* Mobile backdrop */}
         {isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setIsOpen(false)} />
         )}

         {/* Sidebar */}
         <div
            className={`
        fixed lg:static inset-y-0 right-0 w-80 bg-white transform
        ${isOpen ? "translate-x-0" : "translate-x-full"}
        lg:translate-x-0 transition-transform duration-200 ease-in-out
        border-l z-30 overflow-y-auto
      `}
         >
            <div className="p-6 space-y-8">
               {/* Close button for mobile */}
               <button className="absolute top-4 right-4 lg:hidden" onClick={() => setIsOpen(false)}>
                  <IoClose size={24} />
               </button>

               {/* Notifications */}
               <div>
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-semibold">Notifications</h3>
                     <button className="text-green-500 text-sm">Show All</button>
                  </div>
                  <div className="space-y-4">
                     {notifications.map((notification) => (
                        <div key={notification.id} className="flex items-start gap-3">
                           <div className="rounded-full bg-green-100 p-2">
                              <IoNotifications className="h-4 w-4 text-green-500" />
                           </div>
                           <div>
                              <p className="font-medium">{notification.title}</p>
                              <p className="text-sm text-gray-500">{notification.time}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Requests */}
               <div>
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-semibold">Requests</h3>
                     <button className="text-green-500 text-sm">Show All</button>
                  </div>
                  <div className="space-y-4">
                     {requests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <img
                                 src={request.avatar || "/placeholder.svg"}
                                 alt={request.name}
                                 className="h-10 w-10 rounded-full"
                              />
                              <div>
                                 <p className="font-medium">{request.name}</p>
                                 <p className="text-sm text-green-500">{request.type}</p>
                              </div>
                           </div>
                           <div className="flex gap-2">
                              <button className="p-1 hover:bg-gray-100 rounded-lg">
                                 <MdClose className="h-4 w-4 text-red-500" />
                              </button>
                              <button className="p-1 hover:bg-gray-100 rounded-lg">
                                 <MdCheck className="h-4 w-4 text-green-500" />
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Contacts */}
               <div>
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-semibold">Contacts</h3>
                     <button className="text-green-500 text-sm">Show All</button>
                  </div>
                  <div className="space-y-4">
                     {contacts.map((contact) => (
                        <div key={contact.id} className="flex items-center gap-3">
                           <img
                              src={contact.avatar || "/placeholder.svg"}
                              alt={contact.name}
                              className="h-10 w-10 rounded-full"
                           />
                           <p className="font-medium">{contact.name}</p>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </>
   )
}

export default RightSidebar

