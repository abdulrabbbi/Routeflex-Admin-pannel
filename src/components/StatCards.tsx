import { MdLocalShipping, MdPayments, MdAccountBalance } from "react-icons/md";
import { PaymentStats } from "../api/paymentService";

interface StatsCardsProps {
  stats: PaymentStats | null;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-white rounded shadow">
        <div>
          <h3 className="font-semibold text-gray-600">Parcels on Move</h3>
          <p className="text-xl font-bold">{stats.parcelsOnMove.current} / {stats.parcelsOnMove.total}</p>
        </div>
        <MdLocalShipping className="w-10 h-10 text-blue-500" />
      </div>

      <div className="flex items-center justify-between p-4 bg-white rounded shadow">
        <div>
          <h3 className="font-semibold text-gray-600">Payments Received</h3>
          <p className="text-xl font-bold">{stats.paymentReceived.current} / {stats.paymentReceived.total}</p>
        </div>
        <MdPayments className="w-10 h-10 text-green-500" />
      </div>

      <div className="flex items-center justify-between p-4 bg-white rounded shadow">
        <div>
          <h3 className="font-semibold text-gray-600">Drivers Pending Payment</h3>
          <p className="text-xl font-bold">{stats.driversPendingPayment.current} / {stats.driversPendingPayment.total}</p>
        </div>
        <MdAccountBalance className="w-10 h-10 text-orange-500" />
      </div>

      <div className="flex items-center justify-between p-4 bg-white rounded shadow">
        <div>
          <h3 className="font-semibold text-gray-600">Last 7 Days</h3>
          <p className="text-sm">Completed Parcels: <span className="font-semibold">{stats.last7Days.completedParcels}</span></p>
          <p className="text-sm">Total Payments: <span className="font-semibold">{stats.last7Days.totalPayments}</span></p>
          <p className="text-sm">Active Drivers: <span className="font-semibold">{stats.last7Days.activeDrivers}</span></p>
        </div>
        <MdLocalShipping className="w-10 h-10 text-purple-500" />
      </div>
    </>
  );
};

export default StatsCards;
