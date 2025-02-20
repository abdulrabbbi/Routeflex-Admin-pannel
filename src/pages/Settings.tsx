"use client"

import { useState } from "react"
import { MdPerson, MdNotifications, MdSecurity, MdPalette } from "react-icons/md"

const SettingsPage = () => {
   const [activeTab, setActiveTab] = useState("profile")
   const [formData, setFormData] = useState({
      name: "John Doe",
      email: "john@example.com",
      language: "english",
      theme: "light",
      notifications: {
         email: true,
         push: true,
         sms: false,
      },
      twoFactor: true,
   })

   const handleSubmit = (e: any) => {
      e.preventDefault()
      // Handle save settings
   }

   return (
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
         <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold text-[#1e1e38] mb-6">Settings</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
               <div className="grid grid-cols-1 md:grid-cols-4">
                  {/* Sidebar */}
                  <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200">
                     <nav className="space-y-2">
                        {[
                           { id: "profile", icon: MdPerson, label: "Profile" },
                            { id: "security", icon: MdSecurity, label: "Security" },
                           { id: "preferences", icon: MdPalette, label: "Preferences" },
                        ].map((item) => (
                           <button
                              key={item.id}
                              onClick={() => setActiveTab(item.id)}
                              className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg ${activeTab === item.id ? "bg-[#f3f4f8] text-[#1e1e38]" : "text-gray-600 hover:bg-gray-50"
                                 }`}
                           >
                              <item.icon className="h-5 w-5 mr-3" />
                              {item.label}
                           </button>
                        ))}
                     </nav>
                  </div>

                  {/* Content */}
                  <div className="col-span-3 p-6">
                     <form onSubmit={handleSubmit} className="space-y-6">
                        {activeTab === "profile" && (
                           <>
                              <div>
                                 <label className="block text-sm font-medium text-[#1e1e38]">Profile Picture</label>
                                 <div className="mt-1 flex items-center">
                                    <img src="/placeholder.svg" alt="Profile" className="h-16 w-16 rounded-lg" />
                                    <button
                                       type="button"
                                       className="ml-4 px-4 py-2 border border-[#22c55e] text-[#22c55e] rounded-lg hover:bg-[#22c55e] hover:text-white"
                                    >
                                       Change
                                    </button>
                                 </div>
                              </div>

                              <div>
                                 <label className="block text-sm font-medium text-[#1e1e38]">Full Name</label>
                                 <input
                                    type="text"
                                    className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                 />
                              </div>

                              <div>
                                 <label className="block text-sm font-medium text-[#1e1e38]">Email Address</label>
                                 <input
                                    type="email"
                                    className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                 />
                              </div>
                           </>
                        )}

                        {/* {activeTab === "notifications" && (
                           <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                 <div>
                                    <h3 className="text-sm font-medium text-[#1e1e38]">Email Notifications</h3>
                                    <p className="text-sm text-gray-500">Receive email about your activity</p>
                                 </div>
                                 <div className="flex h-6 items-center">
                                    <input
                                       type="checkbox"
                                       className="h-4 w-4 rounded border-gray-300 text-[#22c55e] focus:ring-[#22c55e]"
                                       checked={formData.notifications.email}
                                       onChange={(e) =>
                                          setFormData({
                                             ...formData,
                                             notifications: { ...formData.notifications, email: e.target.checked },
                                          })
                                       }
                                    />
                                 </div>
                              </div>

                              <div className="flex items-center justify-between">
                                 <div>
                                    <h3 className="text-sm font-medium text-[#1e1e38]">Push Notifications</h3>
                                    <p className="text-sm text-gray-500">Receive push notifications</p>
                                 </div>
                                 <div className="flex h-6 items-center">
                                    <input
                                       type="checkbox"
                                       className="h-4 w-4 rounded border-gray-300 text-[#22c55e] focus:ring-[#22c55e]"
                                       checked={formData.notifications.push}
                                       onChange={(e) =>
                                          setFormData({
                                             ...formData,
                                             notifications: { ...formData.notifications, push: e.target.checked },
                                          })
                                       }
                                    />
                                 </div>
                              </div>

                              <div className="flex items-center justify-between">
                                 <div>
                                    <h3 className="text-sm font-medium text-[#1e1e38]">SMS Notifications</h3>
                                    <p className="text-sm text-gray-500">Receive SMS notifications</p>
                                 </div>
                                 <div className="flex h-6 items-center">
                                    <input
                                       type="checkbox"
                                       className="h-4 w-4 rounded border-gray-300 text-[#22c55e] focus:ring-[#22c55e]"
                                       checked={formData.notifications.sms}
                                       onChange={(e) =>
                                          setFormData({
                                             ...formData,
                                             notifications: { ...formData.notifications, sms: e.target.checked },
                                          })
                                       }
                                    />
                                 </div>
                              </div>
                           </div>
                        )} */}

                        {activeTab === "security" && (
                           <div className="space-y-6">
                              <div>
                                 <h3 className="text-sm font-medium text-[#1e1e38]">Change Password</h3>
                                 <div className="mt-4 space-y-4">
                                    <input
                                       type="password"
                                       placeholder="Current Password"
                                       className="block w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                                    />
                                    <input
                                       type="password"
                                       placeholder="New Password"
                                       className="block w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                                    />
                                    <input
                                       type="password"
                                       placeholder="Confirm New Password"
                                       className="block w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                                    />
                                 </div>
                              </div>

                              <div className="flex items-center justify-between">
                                 <div>
                                    <h3 className="text-sm font-medium text-[#1e1e38]">Two-Factor Authentication</h3>
                                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                                 </div>
                                 <div className="flex h-6 items-center">
                                    <input
                                       type="checkbox"
                                       className="h-4 w-4 rounded border-gray-300 text-[#22c55e] focus:ring-[#22c55e]"
                                       checked={formData.twoFactor}
                                       onChange={(e) => setFormData({ ...formData, twoFactor: e.target.checked })}
                                    />
                                 </div>
                              </div>
                           </div>
                        )}

                        {activeTab === "preferences" && (
                           <div className="space-y-6">
                              <div>
                                 <label className="block text-sm font-medium text-[#1e1e38]">Language</label>
                                 <select
                                    className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                                    value={formData.language}
                                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                 >
                                    <option value="english">English</option>
                                    <option value="spanish">Spanish</option>
                                    <option value="french">French</option>
                                 </select>
                              </div>

                              <div>
                                 <label className="block text-sm font-medium text-[#1e1e38]">Theme</label>
                                 <select
                                    className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                                    value={formData.theme}
                                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                                 >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                    <option value="system">System</option>
                                 </select>
                              </div>
                           </div>
                        )}

                        <div className="flex justify-end pt-6">
                           <button
                              type="submit"
                              className="px-6 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#1ea550] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22c55e]"
                           >
                              Save Changes
                           </button>
                        </div>
                     </form>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default SettingsPage

