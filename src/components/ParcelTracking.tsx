import { MdLocationOn, MdLocalShipping, MdAssignment } from "react-icons/md"
import { BsBox } from "react-icons/bs"

const ParcelTracking = ({ OrderId, setOrderId, OrderData }: any) => {
   return (
      <div className="space-y-6">
         {/* Order ID Section */}
         <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#1e1e38]">Track Order</h2>
            <div className="flex gap-4">
               <input
                  type="text"
                  placeholder="Order Number...."
                  value={OrderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
               />
               <button className="px-6 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#1ea550] transition-colors">
                  Track Order
               </button>
            </div>
         </div>

         {/* Current Status */}
         <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#23CD6D08] p-4 rounded-xl">
               <div className="flex items-start gap-3">
                  {/* <div className="p-2 bg-[#22c55e] bg-opacity-10 rounded-lg">
                     <MdLocationOn className="w-5 h-5 text-[#22c55e]" />
                  </div> */}
                  <div>
                     <div className="text-sm text-[#1e1e38] font-medium">Order Number</div>
                     <div className=" text-[#22c55e]">{OrderData.orderNumber}</div>
                  </div>
               </div>
            </div>

            <div className="bg-[#23CD6D08] p-4 rounded-xl">
               <div className="flex items-start gap-3">
                  {/* <div className="p-2 bg-[#22c55e] bg-opacity-10 rounded-lg">
                     <MdAssignment className="w-5 h-5 text-[#22c55e]" />
                  </div> */}
                  <div>
                     <div className="text-sm text-[#1e1e38] font-medium">Parcel Picked By</div>
                     <div className=" text-[#22c55e]">{OrderData.orderPickedby}</div>
                  </div>
               </div>
            </div>
         </div>

         {/* Statistics */}


         {/* Current Task Details */}
         <div className="bg-white p-6 rounded-xl shadow-[0px_0px_20px_0px_#0000000D]">
            <h3 className="text-lg font-semibold text-[#1e1e38] mb-4">Current Task Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <div className="text-sm text-[#22c55e] font-medium">Pickup Location</div>
                  <div className="text-[#1e1e38]">{OrderData.currentTaskDetails.pickup.location}</div>
               </div>
               <div className="space-y-2">
                  <div className="text-sm text-[#22c55e] font-medium">Pickup Time</div>
                  <div className="text-[#1e1e38]">{OrderData.currentTaskDetails.pickup.time}</div>
               </div>
               <div className="space-y-2">
                  <div className="text-sm text-[#22c55e] font-medium">Delivery Location</div>
                  <div className="text-[#1e1e38]">{OrderData.currentTaskDetails.delivery.location}</div>
               </div>
               <div className="space-y-2">
                  <div className="text-sm text-[#22c55e] font-medium">Delivery around</div>
                  <div className="text-[#1e1e38]">{OrderData.currentTaskDetails.delivery.time}</div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default ParcelTracking

