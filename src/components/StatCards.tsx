import { MdLocalShipping, MdPayments, MdAccountBalance } from "react-icons/md"

const stats = [
  {
    title: "Parcels on Move",
    value: "156",
    total: "350",
    icon: MdLocalShipping,
  },
  {
    title: "Payment received by Businesses",
    value: "1500",
    total: "35000",
    icon: MdPayments,
  },
  {
    title: "Drivers Pending to be Paid",
    value: "2",
    total: "15",
    icon: MdAccountBalance,
  },
]

const StatsCards = () => {
  return (
    <>
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">{stat.title}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#1e1e38]">{stat.value}</span>
                <span className="text-sm text-[#22c55e]">/ {stat.total}</span>
              </div>
            </div>
            <div className="bg-[#22c55e] bg-opacity-10 p-3 rounded-xl">
              <stat.icon className="h-6 w-6 text-[#22c55e]" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default StatsCards

