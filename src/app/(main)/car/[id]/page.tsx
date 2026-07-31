"use client";

import { getCarById } from "@/actions/cars";
import CarDetails from "../../_components/car-details";
import Header from "@/components/header";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { SerializedCar } from "@/types";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CarPage({ params }: PageProps) {
  const [carData, setCarData] = useState<SerializedCar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadCar() {
      try {
        const { id } = await params;
        if (cancelled) return;
        setIsLoading(true);
        const res = await getCarById(id);
        if (cancelled) return;
        if (!res.success) {
          setError("Car not found");
        } else if (res.data) {
          setCarData(res.data);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Error loading car:", err);
        setError("Something went wrong");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadCar();
    return () => { cancelled = true; };
  }, []);

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
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <span className="text-2xl">🚗</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900">{error || "Car not found"}</h2>
          <p className="text-muted-foreground mt-1">The car you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/browse" className="mt-6 text-sm font-medium text-slate-600 hover:text-slate-900 underline underline-offset-4">
            Browse all cars
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            <Home className="h-3.5 w-3.5" />
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/browse" className="hover:text-slate-900 transition-colors">
            Browse
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-900 font-medium">{carData.name}</span>
        </nav>

        <CarDetails car={carData} />
      </div>
    </>
  );
}
