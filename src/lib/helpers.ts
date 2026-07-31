import { SerializedCar } from "@/types";

export const formatCurrencyINR = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(amount);
};






export const serializeCarData = (car: Record<string, unknown>, wishlisted = false): SerializedCar => {
  return {
    id: String(car._id ?? ""),
    name: String(car.name ?? ""),
    brand: String(car.brand ?? ""),
    model: String(car.model ?? ""),
    type: String(car.type ?? ""),
    transmission: String(car.transmission ?? ""),
    fuelType: String(car.fuelType ?? ""),
    seats: Number(car.seats ?? 0),
    year: Number(car.year ?? 0),
    color: String(car.color ?? ""),
    mileage: Number(car.mileage ?? 0),
    bodyType: String(car.bodyType ?? ""),
    description: String(car.description ?? ""),
    price: Number(car.price) || 0,
    status: String(car.status ?? ""),
    trips: Number(car.trips ?? 0),
    image: Array.isArray(car.image)
      ? car.image.map((img: unknown) => (typeof img === "string" ? img : (img as Record<string, string>)?.url || ""))
      : [],
    createdBy: car.createdBy ? String(car.createdBy) : null,
    createdAt: car.createdAt ? new Date(String(car.createdAt)).toISOString() : "",
    updatedAt: car.updatedAt ? new Date(String(car.updatedAt)).toISOString() : "",
    wishlisted,
  };
};