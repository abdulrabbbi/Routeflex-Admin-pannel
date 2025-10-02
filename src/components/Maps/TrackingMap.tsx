import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import { useEffect } from "react";
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


const googlePinIcon = new L.DivIcon({
  className: "google-pin",
  html: `
    <svg width="46" height="64" viewBox="0 0 46 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <path d="M23 62c7-12.5 22-24 22-39C45 10.297 35.703 1 23 1S1 10.297 1 23c0 15 15 26.5 22 39z" fill="#EA4335"/>
        <circle cx="23" cy="23" r="8.5" fill="#fff"/>
      </g>
    </svg>
  `,
  iconSize: [46, 64],
  iconAnchor: [23, 60],   // tip of the pin
  tooltipAnchor: [0, -50],
});

const blueDotIcon = new L.DivIcon({
  className: "blue-dot",
  html: `
    <div style="position:relative;width:44px;height:44px;">
      <div style="
        position:absolute;left:50%;top:50%;
        width:14px;height:14px;border-radius:50%;
        background:#1A73E8;transform:translate(-50%,-50%);
        box-shadow:0 0 0 6px rgba(26,115,232,0.25);
      "></div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],   // center of the dot
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

// Type Definitions
interface MapProps {
  route: [number, number][];
  currentLocation: { lat: number; lng: number };
}

const Map = ({ route, currentLocation }: MapProps) => {
  // Default to Saddar, Rawalpindi if no location is provided
  const center = currentLocation
    ? ([currentLocation.lat, currentLocation.lng] as [number, number])
    : ([33.5973, 73.0479] as [number, number]);

  const Recenter = ({ to }: { to: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(to);
    }, [map, to[0], to[1]]);
    return null;
  };

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
        zoom={15}
        className="h-[500px] w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Light theme
        />
        <Polyline positions={route} pathOptions={{ color: "#22c55e", weight: 4 }} />
        <Marker position={center} icon={blueDotIcon} />
        <Recenter to={center} />
        <ZoomControl />
      </MapContainer>
    </div>
  );
};

export default Map;
