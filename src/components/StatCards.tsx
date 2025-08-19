import { MdLocalShipping, MdPayments, MdAccountBalance } from "react-icons/md";
import type { PaymentStats } from "../api/paymentService";

interface StatsCardsProps {
  stats: PaymentStats | null;
  loading?: boolean;
}

const SkeletonCard = () => (
  <div className="p-4 bg-white rounded shadow animate-pulse">
    <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
    <div className="h-6 w-24 bg-gray-200 rounded" />
  </div>
);

const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </>
    );
  }

  if (!stats) return null;

  const {
    parcelsOnMove = { current: 0, total: 0 },
    paymentReceived = { current: 0, total: 0 },
    driversPendingPayment = { current: 0, total: 0 },
  } = stats || {};

  // prefer inRange (new API), fallback to last7Days (old)
  const rangeBlock =
    stats.inRange ?? stats.last7Days ?? {
      completedParcels: 0,
      totalPayments: 0,
      activeDrivers: 0,
    };

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-white rounded shadow">
        <div>
          <h3 className="font-semibold text-gray-600">Parcels on Move</h3>
        <p className="text-xl font-bold">
            {parcelsOnMove.current} / {parcelsOnMove.total}
          </p>
        </div>
        <MdLocalShipping className="w-10 h-10 text-blue-500" />
      </div>

      <div className="flex items-center justify-between p-4 bg-white rounded shadow">
        <div>
          <h3 className="font-semibold text-gray-600">Payments Received</h3>
          <p className="text-xl font-bold">
            {paymentReceived.current} / {paymentReceived.total}
          </p>
        </div>
        <MdPayments className="w-10 h-10 text-green-500" />
      </div>

      <div className="flex items-center justify-between p-4 bg-white rounded shadow">
        <div>
          <h3 className="font-semibold text-gray-600">Drivers Pending Payment</h3>
          <p className="text-xl font-bold">
            {driversPendingPayment.current} / {driversPendingPayment.total}
          </p>
        </div>
        <MdAccountBalance className="w-10 h-10 text-orange-500" />
      </div>

      <div className="flex items-center justify-between p-4 bg-white rounded shadow">
        <div>
          <h3 className="font-semibold text-gray-600">Selected Range</h3>
          <p className="text-sm">
            Completed Parcels: <span className="font-semibold">{rangeBlock.completedParcels}</span>
          </p>
          <p className="text-sm">
            Total Payments: <span className="font-semibold">{rangeBlock.totalPayments}</span>
          </p>
          <p className="text-sm">
            Active Drivers: <span className="font-semibold">{rangeBlock.activeDrivers}</span>
          </p>
        </div>
        <MdLocalShipping className="w-10 h-10 text-purple-500" />
      </div>
    </>
  );
};

export default StatsCards;
