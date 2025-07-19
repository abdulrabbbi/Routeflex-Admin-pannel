export interface PickupLocation {
  street: string;
  city: string;
  postCode: string;
  country: string;
  description: string;
  pickupTime: string;
}

export interface CreateBusinessRoutePayload {
  startLocation: {
    address: {
      street: string;
      city: string;
      postCode: string;
      country: string;
    };
    description: string;
  };
  endLocations: {
    address: string;
    description: string;
  }[];
  pickupTime: string;
  deliveryTime: string;
  packageType: string;
  packageCategory: string;
  packageSize: string;
  packageWeight: number;
}

export interface EndLocation {
  address: string;
  description: string;
  deliveryTime?: string;
}

export interface OrderDetailsType {
  packageType: string;
  packageCategory: string;
  packageSize: string;
  packageWeight: number;
}

export interface RouteFormProps {
  setPickupLocation: React.Dispatch<React.SetStateAction<PickupLocation>>;
  setEndLocations: React.Dispatch<React.SetStateAction<EndLocation[]>>;
}

export interface OrderDetailsProps {
  setOrderDetails: React.Dispatch<React.SetStateAction<OrderDetailsType>>;
}
