import connectDb from "@/lib/db";
import Car from "@/model/carModels";

export async function getCarFilters() {
  await connectDb();

  const brands = await Car.distinct("brand", { status: "available" });
  const bodyTypes = await Car.distinct("bodyType", { status: "available" });
  const fuelTypes = await Car.distinct("fuelType", { status: "available" });
  const transmissions = await Car.distinct("transmission", {
    status: "available",
  });

  const priceStats = await Car.aggregate([
    { $match: { status: "available" } },
    {
      $group: {
        _id: null,
        min: { $min: "$price" },
        max: { $max: "$price" },
      },
    },
  ]);

  return {
    success: true,
    data: {
      brands,
      bodyTypes,
      fuelTypes,
      transmissions,
      priceRange: {
        min: priceStats[0]?.min || 0,
        max: priceStats[0]?.max || 100000,
      },
    },
  };
}
