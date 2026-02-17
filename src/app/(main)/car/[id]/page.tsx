"use client";

import { getCarById } from "@/actions/cars";
import CarDetails from "../../_components/car-details";
import Header from "@/components/header";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CarPage({ params }: PageProps) {
  const [carData, setCarData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carId, setCarId] = useState<string | null>(null);

  useEffect(() => {
    async function loadCar() {
      try {
        const { id } = await params;
        setCarId(id);
        setIsLoading(true);
        const res = await getCarById(id);

        if (!res.success) {
          setError("Car not found");
        } else {
          setCarData(res.data);
        }
      } catch (err) {
        console.error("Error loading car:", err);
        setError("Something went wrong");
      } finally {
        setIsLoading(false);
      }
    }

    loadCar();
  }, [params]);

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="lg" text="Loading car details..." centered />
        </div>
      </>
    );
  }

  if (error || !carData) {
    return (
      <>
        <Header />
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold">{error || "Car not found"}</h2>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <CarDetails car={carData} />
      </div>
    </>
  );
}
