import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import LeftSidebar from '../sections/LeftSidebar'
import Header from '../sections/Header'
import RightSidebar from '../sections/RightSidebar'
import DashboardContent from '../pages/MainDashboard'

const DashboardLayout = () => {
   const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
   const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
   return (
      <div className="flex h-screen bg-gray-50">
         <LeftSidebar isOpen={leftSidebarOpen} setIsOpen={setLeftSidebarOpen} />

         <div className="flex-1 flex flex-col overflow-hidden">
            <Header onMenuClick={() => setLeftSidebarOpen(true)} onNotificationClick={() => setRightSidebarOpen(true)} />

            <div className="flex-1 flex overflow-hidden">
               <main className="flex-1 overflow-y-auto">
                  <Outlet />
               </main>

               <RightSidebar isOpen={rightSidebarOpen} setIsOpen={setRightSidebarOpen} />
            </div>
         </div>
      </div>
   )
}

export default DashboardLayout