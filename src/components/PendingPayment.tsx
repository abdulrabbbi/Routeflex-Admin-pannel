const pendingPayments = [
   { driver: "Miles Morales", hours: "9 hrs", status: "Pending" },
   { driver: "Bruce Wayne", hours: "5 hrs", status: "Pending" },
   { driver: "Miles Morales", hours: "9 hrs", status: "Paid" },
   { driver: "Bruce Wayne", hours: "5 hrs", status: "Paid" },
   { driver: "Miles Morales", hours: "9 hrs", status: "Paid" },
   { driver: "Bruce Wayne", hours: "5 hrs", status: "Paid" },
 ]
 
 const PendingPayments = () => {
   return (
     <div className="bg-white rounded-xl shadow-sm border border-gray-100">
       <div className="p-6 border-b border-gray-100">
         <h2 className="text-lg font-semibold text-[#1e1e38]">Payment Pending</h2>
       </div>
 
       <div className="overflow-x-auto">
         <table className="w-full">
           <thead>
             <tr className="bg-[#f0fdf4]">
               <th className="px-6 py-3 text-left text-sm font-medium text-[#22c55e]">Driver</th>
               <th className="px-6 py-3 text-left text-sm font-medium text-[#22c55e]">Hours</th>
               <th className="px-6 py-3 text-left text-sm font-medium text-[#22c55e]">Status</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-100">
             {pendingPayments.map((payment, index) => (
               <tr key={index} className={index % 2 === 0 ? "bg-[#f8fafc]" : "bg-white"}>
                 <td className="px-6 py-4 text-sm text-[#1e1e38]">{payment.driver}</td>
                 <td className="px-6 py-4 text-sm text-[#1e1e38]">{payment.hours}</td>
                 <td className="px-6 py-4">
                   <span
                     className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                       payment.status === "Pending" ? "text-red-500" : "text-[#22c55e]"
                     }`}
                   >
                     {payment.status}
                   </span>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     </div>
   )
 }
 
 export default PendingPayments
 
 