// "use client";

// import { useEffect, useState } from "react";
// import { fetchPaymentReport, PaymentReport } from "../api/paymentService";
// import StatsCards from "../components/StatCards";
// import PendingPayments from "../components/PendingPayment";
// import DriversPaymentTable from "../components/DriverPayment";

// const PaymentsPage = () => {
//   const [paymentData, setPaymentData] = useState<PaymentReport[]>([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       const data = await fetchPaymentReport(1, 10);
//       setPaymentData(data);
//     };
//     fetchData();
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto space-y-6">
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           <StatsCards />
//         </div>

//         <div className="grid gap-6 lg:grid-cols-1">
//           <div className="lg:col-span-2">
//             <DriversPaymentTable drivers={paymentData} />
//           </div>
//           {/* <div>
//             <PendingPayments />
//           </div> */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentsPage;

"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  fetchPaymentReport,
  PaymentReport,
  fetchPaymentStats,
  PaymentStats,
} from "../api/paymentService";
import StatsCards from "../components/StatCards";
import DriversPaymentTable from "../components/DriverPayment";

const PaymentsPage = () => {
  const [paymentData, setPaymentData] = useState<PaymentReport[]>([]);
  const [statsData, setStatsData] = useState<PaymentStats | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportData, statsData] = await Promise.all([
          fetchPaymentReport(1, 10),
          fetchPaymentStats(),
        ]);
        setPaymentData(reportData);
        setStatsData(statsData);
      } catch (error) {
        toast.error("Failed to load payment information.");
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatsCards stats={statsData} />
        </div>

        <div className="grid gap-6 lg:grid-cols-1">
          <div className="lg:col-span-2">
            <DriversPaymentTable drivers={paymentData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
