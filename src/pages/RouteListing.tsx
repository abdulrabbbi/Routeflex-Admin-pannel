"use client"

import { useState } from "react"
import RouteForm from "../components/RouteForm"
import OrderDetails from "../components/OrderDetails"
import ExistingRoutes from "../components/ExistingRoute"
import SpecificInstructions from "../components/SpecificInstruction"
import RouteListingMap from "../components/Maps/RouteListingMap"

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

  const mapRoutes: [number, number][][] = [
    [
      [33.5973, 73.0479], // Start (Saddar)
      [33.5985, 73.0493],
      [33.6001, 73.0510], // End
    ],
    [
      [33.5973, 73.0479],
      [33.5960, 73.0487],
      [33.5980, 73.0505],
      [33.6001, 73.0510],
    ],
    [
      [33.5973, 73.0479],
      [33.5991, 73.0485],
      [33.6012, 73.0499],
      [33.6001, 73.0510],
    ],
  ];

  const startLocation = { lat: 33.5973, lng: 73.0479 }; // Saddar, Rawalpindi
  const endLocation = { lat: 33.6001, lng: 73.0510 }; // Destination

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-2xl font-semibold text-[#1e1e38]">Route Listing</h1>

        <RouteListingMap routes={mapRoutes} startLocation={startLocation} endLocation={endLocation} />;


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

