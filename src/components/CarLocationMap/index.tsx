import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import MyCarIcon from '../../assets/images/mapCar.png'

const carIcon = new L.Icon({
  iconUrl: MyCarIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const cars = [
  { id: 1, name: 'Car 1', lat: 37.7749, lng: -122.4194 },
  { id: 2, name: 'Car 2', lat: 37.7750, lng: -122.4183 },
  { id: 3, name: 'Car 3', lat: 37.7755, lng: -122.4191 },
  { id: 4, name: 'Car 4', lat: 37.7745, lng: -122.4188 },
  { id: 5, name: 'Car 5', lat: 37.7752, lng: -122.4200 },
];

const CarLocationMap = () => {
  return (
    <div className="w-full h-[500px]">
      <MapContainer
        center={[37.7749, -122.4194]} // Center the map on San Francisco
        zoom={20}

        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {cars.map((car) => (
          <Marker key={car.id} position={[car.lat, car.lng]} icon={carIcon}>
            <Popup>
              <strong>{car.name}</strong>
              <br />
              Location: ({car.lat}, {car.lng})
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CarLocationMap;
