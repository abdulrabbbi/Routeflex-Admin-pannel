import { MdMenu, MdSearch, MdLightMode, MdNotifications } from "react-icons/md";
import { Images } from "../assets/images";
import { useLocation } from "react-router-dom";

const Header = ({ onMenuClick, onNotificationClick }: any) => {
   const location = useLocation();

   // Explicit mapping of paths to human-readable names
   const routeNames: { [key: string]: string } = {
      "/": "Dashboard",
      "/tracking": "Driver Tracking",
      "/parcel-tracking": "Parcel Tracking",
      "/route-listing": "Route Listing",
      "/payments": "Payment",
      "/settings": "Settings",
   };

   const getPathName = () => routeNames[location.pathname] || "Dashboard"; // Default to "Dashboard" if not found

   return (
      <header className="h-16 border-b bg-white">
         <div className="h-full px-4 flex items-center">
            {/* Menu button */}
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={onMenuClick}>
               <MdMenu size={24} />
            </button>

            {/* Breadcrumbs */}
            <nav className="hidden sm:flex items-center space-x-4 ml-4">
               <span className="text-sm font-medium">Dashboard</span>
               <span className="text-sm text-gray-500">/</span>
               <span className="text-sm font-medium">{getPathName()}</span>
            </nav>

            <div className="ml-auto flex items-center space-x-4">
               {/* Search */}
               <div className="hidden sm:flex items-center relative">
                  <MdSearch className="absolute left-3 text-gray-400" size={20} />
                  <input
                     type="search"
                     placeholder="Search..."
                     className="pl-10 pr-4 py-2 border rounded-lg w-[300px] focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
               </div>

               {/* Theme toggle */}
               <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MdLightMode size={20} />
               </button>

               {/* Notifications */}
               <button className="p-2 hover:bg-gray-100 rounded-lg lg:hidden" onClick={onNotificationClick}>
                  <MdNotifications size={20} />
               </button>

               {/* Profile */}
               <img src={Images.Avatar} alt="Profile" className="h-8 w-8 rounded-full" />
            </div>
         </div>
      </header>
   );
};

export default Header;
