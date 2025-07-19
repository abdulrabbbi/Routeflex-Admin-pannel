import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import { MdSearch, MdAdd, MdRemove } from "react-icons/md";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Images } from "../../assets/images";

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/marker-icon-2x.png",
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
});

// Custom black vehicle icon
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
      <button
        onClick={() => map.zoomIn()}
        className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50"
      >
        <MdAdd className="w-5 h-5" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50"
      >
        <MdRemove className="w-5 h-5" />
      </button>
    </div>
  );
};

const RecenterMap = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  map.setView(center);
  return null;
};

// Type Definitions
interface RouteListingMapProps {
  routes: [number, number][][]; // Array of multiple routes
  startLocation: { lat: number; lng: number };
  endLocation: { lat: number; lng: number };
}

const RouteListingMap = ({ routes, startLocation, endLocation }: RouteListingMapProps) => {
  // Default to Saddar, Rawalpindi if no location is provided
  const center = startLocation
    ? ([startLocation.lat, startLocation.lng] as [number, number])
    : ([33.5973, 73.0479] as [number, number]);

  // Colors for different routes
  const routeColors = ["#22c55e", "#ff5733", "#007bff"]; // Green, Red, Blue

  return (
    <div className="relative rounded-xl overflow-hidden shadow-sm border border-gray-200">
      {/* Search bar */}
      <div className="absolute top-4 left-4 z-[1000] w-72">
        <div className="relative">
          <MdSearch
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by area"
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
          />
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={center}
        zoom={14}
        className="h-[500px] w-full"
        zoomControl={false}
      >
        <RecenterMap center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Light theme
        />

        {/* Multiple Routes */}
        {routes.map((route, index) => (
          <Polyline key={index} positions={route} pathOptions={{ color: routeColors[index % routeColors.length], weight: 4 }} />
        ))}

        {/* Start & End Markers */}
        <Marker position={center} icon={vehicleIcon} />
        <Marker position={[endLocation.lat, endLocation.lng]} icon={vehicleIcon} />

        <ZoomControl />
      </MapContainer>
    </div>
  );
};

export default RouteListingMap;
