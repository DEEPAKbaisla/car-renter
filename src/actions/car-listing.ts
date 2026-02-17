import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import Car from "@/model/carModels";
import User from "@/model/userModel";
import { useSession } from "next-auth/react";

export async function getCarFilters() {
  await connectDb();

  const makes = await Car.distinct("make", { status: "AVAILABLE" });
  const bodyTypes = await Car.distinct("bodyType", { status: "AVAILABLE" });
  const fuelTypes = await Car.distinct("fuelType", { status: "AVAILABLE" });
  const transmissions = await Car.distinct("transmission", {
    status: "AVAILABLE",
  });

  const priceStats = await Car.aggregate([
    { $match: { status: "AVAILABLE" } },
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
      makes,
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



