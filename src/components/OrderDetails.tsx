import { MdLocalShipping, MdWarning, MdScale, MdAttachMoney } from "react-icons/md"

const OrderDetails = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-[#1e1e38] mb-6">Order Details</h2>

      <div className="space-y-6">
        {/* Order Type */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#22c55e] bg-opacity-10 rounded-lg">
              <MdLocalShipping className="w-5 h-5 text-[#22c55e]" />
            </div>
            <span className="text-sm font-medium text-[#1e1e38]">Order Type</span>
          </div>
          <select className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] appearance-none">
            <option>Electronic Device</option>
          </select>
        </div>

        {/* Sensitivity */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#22c55e] bg-opacity-10 rounded-lg">
              <MdWarning className="w-5 h-5 text-[#22c55e]" />
            </div>
            <span className="text-sm font-medium text-[#1e1e38]">Sensitivity</span>
          </div>
          <select className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] appearance-none">
            <option>Fragile</option>
          </select>
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#22c55e] bg-opacity-10 rounded-lg">
              <MdScale className="w-5 h-5 text-[#22c55e]" />
            </div>
            <span className="text-sm font-medium text-[#1e1e38]">Weight</span>
          </div>
          <select className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] appearance-none">
            <option>10 - 15 kg</option>
          </select>
        </div>

        {/* Price */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#22c55e] bg-opacity-10 rounded-lg">
              <MdAttachMoney className="w-5 h-5 text-[#22c55e]" />
            </div>
            <span className="text-sm font-medium text-[#1e1e38]">Price</span>
          </div>
          <input
            type="text"
            placeholder="10 - 15 kg"
            className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
          />
        </div>
      </div>
    </div>
  )
}

export default OrderDetails

