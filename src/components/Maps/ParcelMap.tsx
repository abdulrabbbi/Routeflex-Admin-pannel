import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { MdSearch, MdAdd, MdRemove } from "react-icons/md";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Images } from "../../assets/images";

// Custom vehicle icon (Black Car)
const vehicleIcon = new L.Icon({
  iconUrl: Images.MapCar, // Use a black car image
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Zoom Control Component
const ZoomControl = () => {
  const map = useMap();
  return (
    <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">
      <button onClick={() => map.zoomIn()} className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50">
        <MdAdd className="w-5 h-5" />
      </button>
      <button onClick={() => map.zoomOut()} className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50">
        <MdRemove className="w-5 h-5" />
      </button>
    </div>
  );
};

// Type Definitions
interface MapProps {
  cars: { lat: number; lng: number }[];
}

const Map = ({ cars }: MapProps) => {
  const center = cars.length > 0 ? [cars[0].lat, cars[0].lng] : [33.5973, 73.0479];

  return (
    <div className="relative rounded-xl overflow-hidden shadow-sm border border-gray-200">
      {/* Search Bar */}
      <div className="absolute top-4 left-4 z-[1000] w-72">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by area"
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
          />
        </div>
      </div>

      {/* Map */}
      <MapContainer center={center as [number, number]} zoom={15} className="h-[500px] w-full" zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Light theme
        />
        {cars.map((car, index) => (
          <Marker key={index} position={[car.lat, car.lng]} icon={vehicleIcon} />
        ))}
        <ZoomControl />
      </MapContainer>
    </div>
  );
};

export default Map;
