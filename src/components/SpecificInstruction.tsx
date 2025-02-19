import Switch from "./Switch"

const SpecificInstructions = () => {
   return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
         <h2 className="text-lg font-semibold text-[#1e1e38] mb-6">Specific Instructions</h2>

         <div className="space-y-6">
            {/* Leave by the door */}
            <div className="flex items-center justify-between">
               <span className="text-[#1e1e38]">Leave by the door</span>
               <Switch defaultChecked />
            </div>

            {/* Leave by the Locker */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-[#1e1e38]">Leave by the Locker</span>
                  <Switch />
               </div>
               <input
                  type="text"
                  placeholder="Locker 103"
                  className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
               />
            </div>

            {/* Leave by the neighbors */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-[#1e1e38]">Leave by the neighbors</span>
                  <Switch />
               </div>
               <input
                  type="text"
                  placeholder="House no#"
                  className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
               />
            </div>

            {/* Age Verification Delivery */}
            <div className="flex items-center justify-between">
               <span className="text-[#1e1e38]">Age Verification Delivery</span>
               <Switch defaultChecked />
            </div>

            {/* Return if the delivery is not possible */}
            <div className="flex items-center justify-between">
               <span className="text-[#1e1e38]">Return if the delivery is not possible</span>
               <Switch defaultChecked />
            </div>
         </div>
      </div>
   )
}

export default SpecificInstructions

