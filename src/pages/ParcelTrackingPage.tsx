"use client"

import { useState } from "react"
import Map from "../components/Maps/TrackingMap"
import DriverTracking from "../components/DriverTracking"
import ParcelTracking from "../components/ParcelTracking"
import ParcelMap from "../components/Maps/ParcelMap"

const ParcelTrackingPage = () => {
   const [OrderId, setOrderId] = useState("")

   const cars = [
      { lat: 33.5973, lng: 73.0479 }, // Near Saddar Metro Station
      { lat: 33.5955, lng: 73.0498 }, // Near Mall Plaza
      { lat: 33.5987, lng: 73.0505 }, // Near GPO Saddar
      { lat: 33.5962, lng: 73.0451 }, // Near GHQ Rawalpindi
      { lat: 33.5991, lng: 73.0480 }, // Near PC Hotel Rawalpindi
    ];
    
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
            <ParcelMap cars={cars}/>
            <ParcelTracking OrderId={OrderId} setOrderId={setOrderId} OrderData={OrderData} />
         </div>
      </div>
   )
}

export default ParcelTrackingPage

