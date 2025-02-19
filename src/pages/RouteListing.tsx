"use client"

import { useState } from "react"
import RouteForm from "../components/RouteForm"
import OrderDetails from "../components/OrderDetails"
import ExistingRoutes from "../components/ExistingRoute"
import SpecificInstructions from "../components/SpecificInstruction"

const RouteListing = () => {
  const [routes, setRoutes] = useState([
    {
      id: 1,
      pickup: {
        location: "15/1 Destrom Street, New York",
        time: "02:00 PM",
      },
      delivery: {
        location: "12-31 Groove Street, New York",
        time: "03:00 PM",
      },
    },
    {
      id: 2,
      pickup: {
        location: "15/1 Destrom Street, New York",
        time: "02:00 PM",
      },
      delivery: {
        location: "12-31 Groove Street, New York",
        time: "03:00 PM",
      },
    },
  ])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-2xl font-semibold text-[#1e1e38]">Route Listing</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <RouteForm />
            <OrderDetails />
          </div>

          <div className="space-y-8">
            <ExistingRoutes routes={routes} />
            <SpecificInstructions />
          </div>
        </div>
      </div>
    </div>
  )
}

export default RouteListing

