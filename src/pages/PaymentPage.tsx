import StatsCards from "../components/StatCards"
import PendingPayments from "../components/PendingPayment"
import DriversPaymentTable from "../components/DriverPayment"

const PaymentsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatsCards />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DriversPaymentTable />
          </div>
          <div>
            <PendingPayments />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentsPage

