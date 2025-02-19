import { MdLocalShipping, MdDirections } from "react-icons/md"
import CarLocationMap from "../components/CarLocationMap"

const deliveredToday = [
  {
    id: "01",
    driver: "Miles Morales",
    pickupAt: "02:30 PM",
    deliveredAt: "03:30 PM",
    timeLeft: "15 min",
    hours: "9 hrs",
    status: "Pending",
  },
  {
    id: "02",
    driver: "Bruce Wayne",
    pickupAt: "12:00 AM",
    deliveredAt: "01:00 PM",
    timeLeft: "2 min",
    hours: "5 hrs",
    status: "Pending",
  },
]

const deliveriesInProcess = [
  {
    id: "01",
    driver: "Miles Morales",
    pickupAt: "02:30 PM",
    dropoff: "115-H, Kindley Street, Downtown",
    timeLeft: "15 min",
  },
  {
    id: "02",
    driver: "Bruce Wayne",
    pickupAt: "12:00 AM",
    dropoff: "12B, St. Luiz Street, Lincoln Town",
    timeLeft: "2 min",
  },
]

const DashboardContent = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow-[0px_0px_20px_0px_#0000000D]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-gray-400">Parcels Delivered</p>
              <p className="text-2xl font-extrabold text-gray-900">153364 <span className="text-green-500 font-semibold">53 Today</span></p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <MdLocalShipping className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-[0px_0px_20px_0px_#0000000D]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-gray-400">Parcels on Move</p>
              <p className="text-2xl font-extrabold text-gray-900">
                156 <span className="text-gray-500 font-semibold">/ 350</span>
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <MdDirections className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

      </div>

      {/* Delivered Today */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Delivered Today</h2>
        <div className="bg-white rounded-lg border overflow-x-auto ">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-[#f0fdf4]">
                <th className="px-6 py-3 text-left text-xs font-medium text-[#22c55e] uppercase">OR#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#22c55e] uppercase">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#22c55e] uppercase">Pickup at</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#22c55e] uppercase">Delivered at</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#22c55e] uppercase">Time left</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#22c55e] uppercase">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#22c55e] uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {deliveredToday.map((delivery) => (
                <tr key={delivery.id} >
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{delivery.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{delivery.driver}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{delivery.pickupAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{delivery.deliveredAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{delivery.timeLeft}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{delivery.hours}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">{delivery.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deliveries in Process */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Deliveries in Process</h2>
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-[#f0fdf4]">
                <th className="px-6 py-3 text-left text-xs font-medium text-[#22c55e] uppercase">No#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#22c55e] uppercase">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#22c55e] uppercase">Pickup at</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#22c55e] uppercase">Dropoff Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#22c55e] uppercase">Time Left</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {deliveriesInProcess.map((delivery) => (
                <tr key={delivery.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{delivery.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{delivery.driver}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{delivery.pickupAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{delivery.dropoff}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{delivery.timeLeft}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DashboardContent

