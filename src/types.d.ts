import  { Connection } from "mongoose";

declare global{
    var mongoose:{
        conn:Connection | null
        promise:Promise<Connection> |null 
    }
}

export interface SerializedCar {
  id: string;
  name: string;
  brand: string;
  model: string;
  type: string;
  transmission: string;
  fuelType: string;
  seats: number;
  year: number;
  color: string;
  mileage: number;
  bodyType: string;
  description: string;
  price: number;
  status: string;
  trips: number;
  image: string[];
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  wishlisted?: boolean;
}

export {}