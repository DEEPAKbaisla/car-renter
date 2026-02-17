"use client";

import { AllCars } from "@/actions/cars";
import Header from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Star, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CarCardSkeletonGrid } from "@/components/ui/car-card-skeleton";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const BrowseCars = () => {
  const [allCars, setAllCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCars() {
      setIsLoading(true);
      setError(null);
      try {
        const cars = await AllCars();
        setAllCars(cars);
      } catch (err) {
        console.error("Error fetching cars:", err);
        setError("Failed to load cars. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCars();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Browse Available Cars</h1>
          <p className="text-muted-foreground text-lg mb-6">
            Find the perfect vehicle for your next adventure
          </p>
        </div>

        {isLoading ? (
          <CarCardSkeletonGrid count={6} />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : allCars.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No cars available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCars.map((car: any) => (
              <Link key={car._id} href={`/car/${car._id}`}>
                <Card className="overflow-hidden group shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all h-full">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={car.image[0]}
                      alt={car.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">{car.name}</h3>
                        <Badge variant="secondary" className="mt-2">
                          {car.type}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          ${car.price}
                        </p>
                        <p className="text-sm text-muted-foreground">per day</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span>{car.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{car.trips} trips</span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseCars;
