import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const FullScreenMap: React.FC = () => {
  const [isMapOpen, setIsMapOpen] = useState(false);

  const toggleMap = () => {
    setIsMapOpen(!isMapOpen);
  };

  return (
    <div>
      {/* Button to Open Full-Screen Map */}
      <button
        onClick={toggleMap}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Open Full-Screen Map
      </button>

      {/* Full-Screen Map Modal */}
      {isMapOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="relative w-full h-full">
            <MapContainer
              center={[37.7749, -122.4194]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <Marker position={[37.7749, -122.4194]}>
                <Popup>Car Location</Popup>
              </Marker>
            </MapContainer>

            {/* Close Button */}
            <button
              onClick={toggleMap}
              className="absolute top-4 right-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Close Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullScreenMap;
