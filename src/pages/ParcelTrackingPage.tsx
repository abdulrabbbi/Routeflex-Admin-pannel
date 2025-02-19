"use client"

import { useState } from "react"
import Map from "../components/Maps/TrackingMap"
import DriverTracking from "../components/DriverTracking"
import ParcelTracking from "../components/ParcelTracking"

const ParcelTrackingPage = () => {
   const [OrderId, setOrderId] = useState("")

   const route: [number, number][] = [
      [33.6007, 73.0679], // Start
      [33.6034, 73.0724],
      [33.6045, 73.0768],
      [33.6056, 73.0815], // End
   ]

   const currentLocation = {
      lat: 33.6034,
      lng: 73.0724,
      address: "12-31 Groove Street, New York",
   }

   const OrderData = {
      currentLocation: "Parcel delivery to H-Block Frances Town, New York",
      currentTask: "Parcel delivery to H-Block Frances Town, New York",
      totalOrders: 115,
      doneDeliveries: 20,
      orderNumber: 'H123-7421596-B2',
      orderPickedby:"Miles Morales",
      stopsLeft: 100,
      currentTaskDetails: {
         pickup: {
            location: "15/1 Destrom Street, New York",
            time: "02:00 PM",
         },
         delivery: {
            location: "12-31 Groove Street, New York",
            time: "03:00 PM",
         },
      },
   }

   return (
      <div className="min-h-screen bg-gray-50 p-6">
         <div className="max-w-7xl mx-auto space-y-6">
            <Map route={route} currentLocation={currentLocation} />
            <ParcelTracking OrderId={OrderId} setOrderId={setOrderId} OrderData={OrderData} />
         </div>
      </div>
   )
}

export default ParcelTrackingPage

