// import { MdLocationOn, MdAccessTime, MdAdd } from "react-icons/md";
// import { useState } from "react";

// interface RouteFormProps {
//   setPickupLocation: React.Dispatch<
//     React.SetStateAction<{
//       address: {
//         street: string;
//         city: string;
//         postCode: string;
//         country: string;
//       };
//       description: string;
//       pickupDate: string;
//       pickupTime: string;
//     }>
//   >;
//   setEndLocations: React.Dispatch<
//     React.SetStateAction<
//       {
//         address: string;
//         description: string;
//       }[]
//     >
//   >;
// }

// const RouteForm: React.FC<RouteFormProps> = ({
//   setPickupLocation,
//   setEndLocations,
// }) => {
//   const [deliveryLocations, setDeliveryLocations] = useState([
//     { address: "", description: "First delivery" },
//   ]);

//   const handleAddressChange = (index: number, value: string) => {
//     const updated = [...deliveryLocations];
//     updated[index].address = value;
//     setDeliveryLocations(updated);
//     setEndLocations(updated);
//   };

//   const handleDescriptionChange = (index: number, value: string) => {
//     const updated = [...deliveryLocations];
//     updated[index].description = value;
//     setDeliveryLocations(updated);
//     setEndLocations(updated);
//   };

//   const handleAddLocation = () => {
//     const newLocation = {
//       address: "",
//       description: `Delivery ${deliveryLocations.length + 1}`,
//     };
//     const updated = [...deliveryLocations, newLocation];
//     setDeliveryLocations(updated);
//     setEndLocations(updated);
//   };

//   return (
//     <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 w-full">
//       <h2 className="text-lg font-semibold text-[#1e1e38] mb-6">Route Form</h2>

//       <div className="space-y-8">
//         {/* Pickup Location */}
//         <div className="space-y-4">
//           <div className="flex items-center gap-2">
//             <div className="p-1.5 bg-[#22c55e] rounded-full">
//               <MdLocationOn className="w-4 h-4 text-white" />
//             </div>
//             <span className="text-sm font-medium text-[#1e1e38]">
//               Pickup Location
//             </span>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <input
//               type="text"
//               placeholder="Street"
              
//               onChange={(e) =>
//                 setPickupLocation((prev) => ({
//                   ...prev,
//                   address: { ...prev.address, street: e.target.value },
//                 }))
//               }
//               className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
//             />
//             <input
//               type="text"
//               placeholder="City"
//               onChange={(e) =>
//                 setPickupLocation((prev) => ({
//                   ...prev,
//                   address: { ...prev.address, city: e.target.value },
//                 }))
//               }
//               className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
//             />
//             <input
//               type="text"
//               placeholder="Post Code"
//               onChange={(e) =>
//                 setPickupLocation((prev) => ({
//                   ...prev,
//                   address: { ...prev.address, postCode: e.target.value },
//                 }))
//               }
//               className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
//             />
//             <input
//               type="text"
//               placeholder="Country"
//               onChange={(e) =>
//                 setPickupLocation((prev) => ({
//                   ...prev,
//                   address: { ...prev.address, country: e.target.value },
//                 }))
//               }
//               className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
//             />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <input
//               type="text"
//               placeholder="Description (e.g. Warehouse A)"
//               onChange={(e) =>
//                 setPickupLocation((prev) => ({
//                   ...prev,
//                   description: e.target.value,
//                 }))
//               }
//               className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
//             />
//             <div className="relative">
//               <MdAccessTime className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div className="relative">
//                   <label className="block text-sm mb-1 text-gray-600">
//                     Pickup Date
//                   </label>
//                   <input
//                     type="date"
//                     onChange={(e) =>
//                       setPickupLocation((prev) => ({
//                         ...prev,
//                         pickupDate: e.target.value,
//                       }))
//                     }
//                     className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
//                   />
//                 </div>
//                 <div className="relative">
//                   <label className="block text-sm mb-1 text-gray-600">
//                     Pickup Time
//                   </label>
//                   <input
//                     type="time"
//                     onChange={(e) =>
//                       setPickupLocation((prev) => ({
//                         ...prev,
//                         pickupTime: e.target.value,
//                       }))
//                     }
//                     className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Delivery Locations */}
//         {deliveryLocations.map((location, index) => (
//           <div className="space-y-4" key={index}>
//             <div className="flex items-center gap-2">
//               <div className="p-1.5 bg-[#22c55e] rounded-full">
//                 <MdLocationOn className="w-4 h-4 text-white" />
//               </div>
//               <span className="text-sm font-medium text-[#1e1e38]">
//                 Delivery Location {index + 1}
//               </span>
//             </div>

//             <div className="space-y-2">
//               <input
//                 type="text"
//                 placeholder="Delivery Address"
//                 value={location.address}
//                 onChange={(e) => handleAddressChange(index, e.target.value)}
//                 className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
//               />
//               <input
//                 type="text"
//                 placeholder="Description"
//                 value={location.description}
//                 onChange={(e) => handleDescriptionChange(index, e.target.value)}
//                 className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
//               />
//             </div>
//           </div>
//         ))}

//         <div>
//           <button
//             onClick={handleAddLocation}
//             type="button"
//             className="w-full sm:w-auto px-4 py-2 border border-[#22c55e] text-[#22c55e] rounded-lg hover:bg-[#22c55e] hover:text-white transition-colors flex items-center justify-center gap-2"
//           >
//             <MdAdd className="w-5 h-5" />
//             Add Delivery Location
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RouteForm;


import { MdLocationOn, MdAccessTime, MdAdd } from "react-icons/md";

interface RouteFormProps {
  pickupLocation: {
    address: {
      street: string;
      city: string;
      postCode: string;
      country: string;
    };
    description: string;
    pickupDate: string;
    pickupTime: string;
  };
  deliveryLocations: {
    address: string;
    description: string;
  }[];
  setPickupLocation: React.Dispatch<
    React.SetStateAction<{
      address: {
        street: string;
        city: string;
        postCode: string;
        country: string;
      };
      description: string;
      pickupDate: string;
      pickupTime: string;
    }>
  >;
  setDeliveryLocations: React.Dispatch<
    React.SetStateAction<
      {
        address: string;
        description: string;
      }[]
    >
  >;
}

const RouteForm: React.FC<RouteFormProps> = ({
  pickupLocation,
  deliveryLocations,
  setPickupLocation,
  setDeliveryLocations,
}) => {
  const handleAddressChange = (index: number, value: string) => {
    const updated = [...deliveryLocations];
    updated[index].address = value;
    setDeliveryLocations(updated);
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const updated = [...deliveryLocations];
    updated[index].description = value;
    setDeliveryLocations(updated);
  };

  const handleAddLocation = () => {
    const newLocation = {
      address: "",
      description: `Delivery ${deliveryLocations.length + 1}`,
    };
    setDeliveryLocations([...deliveryLocations, newLocation]);
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 w-full">
      <h2 className="text-lg font-semibold text-[#1e1e38] mb-6">Route Form</h2>

      <div className="space-y-8">
        {/* Pickup Location */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#22c55e] rounded-full">
              <MdLocationOn className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-[#1e1e38]">
              Pickup Location
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Street"
              value={pickupLocation.address.street}
              onChange={(e) =>
                setPickupLocation((prev) => ({
                  ...prev,
                  address: { ...prev.address, street: e.target.value },
                }))
              }
              className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
            />
            <input
              type="text"
              placeholder="City"
              value={pickupLocation.address.city}
              onChange={(e) =>
                setPickupLocation((prev) => ({
                  ...prev,
                  address: { ...prev.address, city: e.target.value },
                }))
              }
              className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
            />
            <input
              type="text"
              placeholder="Post Code"
              value={pickupLocation.address.postCode}
              onChange={(e) =>
                setPickupLocation((prev) => ({
                  ...prev,
                  address: { ...prev.address, postCode: e.target.value },
                }))
              }
              className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
            />
            <input
              type="text"
              placeholder="Country"
              value={pickupLocation.address.country}
              onChange={(e) =>
                setPickupLocation((prev) => ({
                  ...prev,
                  address: { ...prev.address, country: e.target.value },
                }))
              }
              className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Description (e.g. Warehouse A)"
              value={pickupLocation.description}
              onChange={(e) =>
                setPickupLocation((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
            />
            <div className="relative">
              <MdAccessTime className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm mb-1 text-gray-600">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    value={pickupLocation.pickupDate}
                    onChange={(e) =>
                      setPickupLocation((prev) => ({
                        ...prev,
                        pickupDate: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm mb-1 text-gray-600">
                    Pickup Time
                  </label>
                  <input
                    type="time"
                    value={pickupLocation.pickupTime}
                    onChange={(e) =>
                      setPickupLocation((prev) => ({
                        ...prev,
                        pickupTime: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Locations */}
        {deliveryLocations.map((location, index) => (
          <div className="space-y-4" key={index}>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#22c55e] rounded-full">
                <MdLocationOn className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-[#1e1e38]">
                Delivery Location {index + 1}
              </span>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Delivery Address"
                value={location.address}
                onChange={(e) => handleAddressChange(index, e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
              />
              <input
                type="text"
                placeholder="Description"
                value={location.description}
                onChange={(e) => handleDescriptionChange(index, e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
              />
            </div>
          </div>
        ))}

        <div>
          <button
            onClick={handleAddLocation}
            type="button"
            className="w-full sm:w-auto px-4 py-2 border border-[#22c55e] text-[#22c55e] rounded-lg hover:bg-[#22c55e] hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <MdAdd className="w-5 h-5" />
            Add Delivery Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteForm;