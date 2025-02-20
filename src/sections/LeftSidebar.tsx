import { MdDashboard, MdPeople, MdLocalShipping, MdMap, MdPayment, MdSettings, MdLogout } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";
import { Images } from "../assets/images";

const menuItems = [
   { icon: MdDashboard, label: "Dashboard", path: "/" },
   { icon: MdPeople, label: "Driver Tracking", path: "/tracking" },
   { icon: MdLocalShipping, label: "Parcel Tracking", path: "/parcel-tracking" },
   { icon: MdMap, label: "Route Listing", path: "/route-listing" },
   { icon: MdPayment, label: "Payments", path: "/payments" },
];

const LeftSidebar = ({ isOpen, setIsOpen }: any) => {
   const location = useLocation(); // Get current path

   return (
      <>
         {/* Mobile backdrop */}
         {isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setIsOpen(false)} />
         )}

         {/* Sidebar */}
         <div
            className={`
          fixed lg:static inset-y-0 left-0 w-64 bg-white transform z-[1001]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 transition-transform duration-200 ease-in-out
          flex flex-col border-r z-30
        `}
         >
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b">
               <span className="text-xl font-bold">
                  {/* Road<span className="text-green-500">Fle</span> */}
                  <img src={Images.Logo} />
               </span>
               <button className="ml-auto lg:hidden" onClick={() => setIsOpen(false)}>
                  <IoClose size={24} />
               </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 mt-3">
               {menuItems.map((item) => {
                  const isActive = location.pathname === item.path; // Check if the path matches current URL

                  return (
                     <Link
                        key={item.label}
                        to={item.path}
                        className={`
                  flex items-center px-3 py-3 rounded-xl text-sm font-medium
                  ${isActive ? "bg-[#24123A0D] text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                `}
                     >
                        <item.icon className="h-6 w-6 mr-3" />
                        {item.label}
                     </Link>
                  );
               })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t">
               <Link
                  to="/settings"
                  className="flex items-center px-3 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900"
               >
                  <MdSettings className="h-5 w-5 mr-3" />
                  Settings
               </Link>
               <Link
                  to="/auth/login"
                  className="flex items-center px-3 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900"
               >
                  <MdLogout className="h-5 w-5 mr-3" />
                  Logout
               </Link>
            </div>
         </div>
      </>
   );
};

export default LeftSidebar;
