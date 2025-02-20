"use client"

import { IoClose } from "react-icons/io5"
import { MdSend } from "react-icons/md"
import { useState } from "react"

const Chat = ({ contact, onClose }: any) => {
   const [message, setMessage] = useState("")
   const [messages, setMessages] = useState([
      {
         text: "Lorem ipsum dolor sit amet consectetur. Eu lorem ut enim faucibus. Id nisi amet adipiscing sem.",
         sent: true,
         timestamp: new Date(),
      },
      {
         text: "Lorem ipsum dolor sit amet consectetur. Eu lorem ut enim faucibus. Id nisi amet adipiscing sem.",
         sent: false,
         timestamp: new Date(),
      },
   ])

   const handleSend = (e: any) => {
      e.preventDefault()
      if (!message.trim()) return

      setMessages([
         ...messages,
         {
            text: message,
            sent: true,
            timestamp: new Date(),
         },
      ])
      setMessage("")
   }

   return (
      <div className="fixed bottom-4 right-4 lg:right-[330px] w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
         {/* Header */}
         <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
               <img src={contact.avatar || "/placeholder.svg"} alt={contact.name} className="h-10 w-10 rounded-full" />
               <div>
                  <h3 className="font-medium text-[#1e1e38]">{contact.name}</h3>
                  <p className="text-sm text-gray-500">Online</p>
               </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
               <IoClose className="h-5 w-5 text-gray-500" />
            </button>
         </div>

         {/* Messages */}
         <div className="h-96 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
               <div key={idx} className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}>
                  <div
                     className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.sent ? "bg-[#22c55e] text-white" : "bg-gray-100 text-[#1e1e38]"
                        }`}
                  >
                     <p className="text-sm">{msg.text}</p>
                  </div>
               </div>
            ))}
         </div>

         {/* Input */}
         <form onSubmit={handleSend} className="p-4 border-t">
            <div className="flex gap-2">
               <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
               />
               <button
                  type="submit"
                  className="p-2 bg-[#22c55e] text-white rounded-full hover:bg-[#1ea550] transition-colors"
               >
                  <MdSend className="h-5 w-5" />
               </button>
            </div>
         </form>
      </div>
   )
}

export default Chat

