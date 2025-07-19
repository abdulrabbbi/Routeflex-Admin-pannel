import { PaymentReport } from "../api/paymentService";

interface DriversPaymentTableProps {
  drivers: PaymentReport[];
}

const DriversPaymentTable: React.FC<DriversPaymentTableProps> = ({ drivers }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-[#1e1e38]">Drivers to be Paid</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f0fdf4]">
              <th className="px-6 py-3 text-left text-sm font-medium text-[#22c55e]">No#</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-[#22c55e]">Driver</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-[#22c55e]">Delivery Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-[#22c55e]">Payment Received by Sender</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-[#22c55e]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {drivers.map((driver, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-[#f8fafc]" : "bg-white"}>
                <td className="px-6 py-4 text-sm text-[#1e1e38]">{driver.sequence}</td>
                <td className="px-6 py-4 text-sm text-[#1e1e38]">{driver.driver}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      driver.deliveryStatus === "Pending" ? "bg-red-100 text-red-500" : "bg-[#f0fdf4] text-[#22c55e]"
                    }`}
                  >
                    {driver.deliveryStatus}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex w-2 h-2 rounded-full ${
                      driver.paymentReceived === "Pending" ? "bg-red-500" : "bg-[#22c55e]"
                    }`}
                  />
                  <span className="ml-2 text-sm">{driver.paymentReceived}</span>
                </td>
                <td className="px-6 py-4">
                  <button className="px-6 py-1.5 bg-[#22c55e] text-white text-sm rounded-lg hover:bg-[#1ea550] transition-colors">
                    Pay
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriversPaymentTable;
