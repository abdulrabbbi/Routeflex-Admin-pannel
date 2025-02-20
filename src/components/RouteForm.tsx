import { MdLocationOn, MdAccessTime, MdAdd } from "react-icons/md"

const RouteForm = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-[#1e1e38] mb-6">Route 3</h2>

      <div className="space-y-6">
        {/* Pickup Location */}
        <div className="space-y-4">
          {/* Pickup Label */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#22c55e] rounded-full">
              <MdLocationOn className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-[#1e1e38]">Pickup Location</span>
          </div>

          {/* Inputs Section */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Address Input */}
            <input
              type="text"
              placeholder="15/1 Destrom Street, New York"
              className="flex-1 px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
            />

            {/* Time Input */}
            <div className="relative w-full md:w-32">
              <MdAccessTime className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="02:00 PM"
                className="pl-10 pr-4 py-2.5 w-full md:w-32 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
              />
            </div>
          </div>
        </div>


        {/* Vertical Line */}
        {/* <div className="w-0.5 h-8 bg-[#22c55e] opacity-20 ml-[11px]" /> */}

        {/* Delivery Location */}
        <div className="space-y-4">
          {/* Delivery Label */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#22c55e] rounded-full">
              <MdLocationOn className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-[#1e1e38]">Delivery Location</span>
          </div>

          {/* Inputs Section */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Address Input */}
            <input
              type="text"
              placeholder="12-31 Groove Street, New York"
              className="flex-1 px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
            />

            {/* Time Input */}
            <div className="relative w-full md:w-32">
              <MdAccessTime className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="03:00 PM"
                className="pl-10 pr-4 py-2.5 w-full md:w-32 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
              />
            </div>
          </div>
        </div>


        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button className="px-4 py-2 border border-[#22c55e] text-[#22c55e] rounded-lg hover:bg-[#22c55e] hover:text-white transition-colors flex items-center gap-2">
            <MdAdd className="w-5 h-5" />
            Add Another Route
          </button>
          <button className="px-8 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#1ea550] transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default RouteForm

