export interface DeliveredType {
  sequence: string;
  driver: string;
  pickupAt: string;
  deliveredAt: string;
  dropoffLocation: string;
  timeLeft: string | number;
  hours: string;
  status: string;
}

export interface InProgressType {
  sequence: string;
  driver: string;
  pickupAt: string;
  dropoffLocation: string;
  timeLeft: string | number;
  status: string;
}

export interface ListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  results: number;
}
