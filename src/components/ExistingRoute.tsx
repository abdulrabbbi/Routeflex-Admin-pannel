import { MdLocationOn } from "react-icons/md"

const ExistingRoutes = ({ routes }: any) => {
   return (
      <div className="space-y-4">
         {routes.map((route: any) => (
            <div key={route.id} className="bg-[#f0fdf4] p-6 rounded-xl">
               <h3 className="text-lg font-semibold text-[#1e1e38] mb-6">Route {route.id}</h3>

               <div className="grid grid-cols-[auto,1fr,auto] gap-x-4 gap-y-6">
                  {/* Pickup */}
                  <div className="p-1.5 bg-[#22c55e] rounded-full mt-1 h-fit">
                     <MdLocationOn className="w-4 h-4 text-white" />
                  </div>

                  <div>
                     <div className="text-sm font-medium text-[#1e1e38]">Pickup Location</div>
                     <div className="text-[#22c55e]">{route.pickup.location}</div>
                  </div>

                  <div>
                     <div className="text-sm font-medium text-[#1e1e38]">Pickup Time</div>
                     <div className="text-[#22c55e]">{route.pickup.time}</div>
                  </div>

                  {/* Vertical Line */}
                  <div className="w-0.5 h-8 bg-[#22c55e] opacity-20 ml-[11px]" />
                  <div className="col-span-2" />

                  {/* Delivery */}
                  <div className="p-1.5 bg-[#22c55e] rounded-full mt-1 h-fit">
                     <MdLocationOn className="w-4 h-4 text-white" />
                  </div>

                  <div>
                     <div className="text-sm font-medium text-[#1e1e38]">Delivery Location</div>
                     <div className="text-[#22c55e]">{route.delivery.location}</div>
                  </div>

                  <div>
                     <div className="text-sm font-medium text-[#1e1e38]">Delivered at</div>
                     <div className="text-[#22c55e]">{route.delivery.time}</div>
                  </div>
               </div>
            </div>
         ))}
      </div>
   )
}

export default ExistingRoutes

