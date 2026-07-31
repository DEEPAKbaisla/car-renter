"use client";

import { AllCars } from "@/actions/cars";
import Header from "@/components/header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Car as CarIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CarCardSkeletonGrid } from "@/components/ui/car-card-skeleton";
import { SerializedCar } from "@/types";

const BrowseCars = () => {
  const [allCars, setAllCars] = useState<SerializedCar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchCars() {
      setIsLoading(true);
      setError(null);
      try {
        const cars = await AllCars();
        setAllCars(cars || []);
      } catch (err) {
        console.error("Error fetching cars:", err);
        setError("Failed to load cars. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCars();
  }, []);

  const filteredCars = allCars.filter((car) =>
    car.name.toLowerCase().includes(search.toLowerCase()) ||
    car.type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Browse Available Cars
          </h1>
          <p className="text-slate-400 mt-2 text-base md:text-lg">
            Find the perfect vehicle for your next adventure
          </p>

          <div className="mt-6 relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8 md:py-10">
        {isLoading ? (
          <CarCardSkeletonGrid count={6} />
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-slate-600 hover:text-slate-900 underline underline-offset-4 font-medium"
            >
              Try again
            </button>
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <CarIcon className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-muted-foreground text-lg">
              {search ? "No cars match your search." : "No cars available at the moment."}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              Showing {filteredCars.length} car{filteredCars.length !== 1 ? "s" : ""}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCars.map((car) => (
                <Link key={car.id} href={`/car/${car.id}`}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 hover:-translate-y-1 group h-full flex flex-col">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={car.image[0]}
                        alt={car.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-slate-900 truncate">
                            {car.name}
                          </h3>
                          <Badge variant="secondary" className="mt-1.5 bg-slate-100 text-slate-600 border-0 font-normal">
                            {car.type}
                          </Badge>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xl font-bold text-slate-900">
                            ₹{car.price}
                          </p>
                          <p className="text-xs text-muted-foreground">/day</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          <span>{car.trips} trips</span>
                        </div>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          View Details
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BrowseCars;
