/** Store entity returned from the API */
export interface Store {
  id: string;
  name: string;
  address: string;
  lat: number;
  long: number;
  radiusKm: number;
  phone: string | null;
  gstin: string | null;
  openingTime: string;
  closingTime: string;
  isActive: boolean;
  posEnabled: boolean;
  deliveryEnabled: boolean;
  clickCollectEnabled: boolean;
  createdAt: string;
  manager?: StoreManagerRef | null;
  _count?: {
    users: number;
  };
}

/** Minimal manager reference within a Store object */
export interface StoreManagerRef {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
}

/** Payload for creating a new store */
export interface CreateStorePayload {
  name: string;
  address: string;
  lat: number;
  long: number;
  radiusKm: number;
  phone?: string;
  gstin?: string;
  openingTime: string;
  closingTime: string;
  isActive: boolean;
  posEnabled: boolean;
  deliveryEnabled: boolean;
  clickCollectEnabled: boolean;
  managerName: string;
  managerEmail: string;
  managerPhone: string;
  managerPassword: string;
}
