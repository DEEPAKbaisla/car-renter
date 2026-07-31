export const formatCurrencyINR = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(amount);
};






export const serializeCarData = (car: any, wishlisted = false) => {
  return {
    id: car._id?.toString(), // ✅ use only id

    // ❌ DO NOT spread car (this avoids _id leak)

    name: car.name ?? "",
    brand: car.brand ?? "",
    model: car.model ?? "",
    type: car.type ?? "",
    transmission: car.transmission ?? "",
    fuelType: car.fuelType ?? "",
    seats: car.seats ?? 0,

    year: car.year ?? null,
    color: car.color ?? "",
    mileage: car.mileage ?? 0,
    bodyType: car.bodyType ?? "",
    description: car.description ?? "",
    price: Number(car.price) || 0,
    status: car.status ?? "",
    trips: car.trips ?? 0,
    image: Array.isArray(car.image)
      ? car.image.map((img: any) => (typeof img === "string" ? img : img?.url || ""))
      : [],

    createdBy: car.createdBy ? car.createdBy.toString() : null,

    createdAt: car.createdAt
      ? new Date(car.createdAt).toISOString()
      : null,

    updatedAt: car.updatedAt
      ? new Date(car.updatedAt).toISOString()
      : null,

    wishlisted,
  };
};