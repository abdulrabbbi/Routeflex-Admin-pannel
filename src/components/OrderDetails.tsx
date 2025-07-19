import { MdLocalShipping, MdWarning, MdScale, MdAttachMoney } from "react-icons/md";

interface OrderDetailsProps {
  orderDetails: {
    packageType: string;
    packageCategory: string;
    packageSize: string;
    packageWeight: number;
  };
  setOrderDetails: React.Dispatch<React.SetStateAction<{
    packageType: string;
    packageCategory: string;
    packageSize: string;
    packageWeight: number;
  }>>;
}


const OrderDetails: React.FC<OrderDetailsProps> = ({ orderDetails, setOrderDetails }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-[#1e1e38] mb-6">Order Details</h2>

      <div className="space-y-6">
        {/* Package Type */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#22c55e] bg-opacity-10 rounded-lg">
              <MdLocalShipping className="w-5 h-5 text-[#22c55e]" />
            </div>
            <span className="text-sm font-medium text-[#1e1e38]">Package Type</span>
          </div>
          <select
            value={orderDetails.packageType}
            onChange={(e) =>
              setOrderDetails((prev) => ({ ...prev, packageType: e.target.value }))
            }
            className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
          >
            <option value="Box">Box</option>
            <option value="Envelope">Envelope</option>
            <option value="Pallet">Pallet</option>
          </select>
        </div>

        {/* Package Category */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#22c55e] bg-opacity-10 rounded-lg">
              <MdWarning className="w-5 h-5 text-[#22c55e]" />
            </div>
            <span className="text-sm font-medium text-[#1e1e38]">Package Category</span>
          </div>
          <select
            value={orderDetails.packageCategory}
            onChange={(e) =>
              setOrderDetails((prev) => ({ ...prev, packageCategory: e.target.value }))
            }
            className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
          >
            <option value="Electronics">Electronics</option>
            <option value="Fragile">Fragile</option>
            <option value="Food">Food</option>
            <option value="Documents">Documents</option>
          </select>
        </div>

        {/* Package Weight */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#22c55e] bg-opacity-10 rounded-lg">
              <MdScale className="w-5 h-5 text-[#22c55e]" />
            </div>
            <span className="text-sm font-medium text-[#1e1e38]">Weight (kg)</span>
          </div>
          <input
            type="number"
            placeholder="5"
            value={orderDetails.packageWeight}
            onChange={(e) =>
              setOrderDetails((prev) => ({
                ...prev,
                packageWeight: Number(e.target.value),
              }))
            }
            className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
          />
        </div>

        {/* Package Size */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#22c55e] bg-opacity-10 rounded-lg">
              <MdAttachMoney className="w-5 h-5 text-[#22c55e]" />
            </div>
            <span className="text-sm font-medium text-[#1e1e38]">Package Size (L*W*H)</span>
          </div>
          <input
            type="text"
            placeholder="10 * 10 * 5"
            value={orderDetails.packageSize}
            onChange={(e) =>
              setOrderDetails((prev) => ({ ...prev, packageSize: e.target.value }))
            }
            className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
          />
        </div>
      </div>
    </div>
  );
};


export default OrderDetails;