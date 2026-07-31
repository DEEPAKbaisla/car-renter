"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CarCardSkeletonGrid } from "@/components/ui/car-card-skeleton";
import { Users, ArrowRight } from "lucide-react";
import { getThreeCars } from "@/actions/cars";

const FeaturedCars = () => {
  const [featuredCars, setFeaturedCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCars() {
      setIsLoading(true);
      try {
        const cars = await getThreeCars();
        setFeaturedCars(cars || []);
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCars();
  }, []);

  return (
    <section id="featured" className="py-16 md:py-20 bg-slate-50/50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 md:mb-14">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Featured Cars
            </h2>
            <p className="text-muted-foreground mt-1.5">Handpicked vehicles for you</p>
          </div>
          <Link
            href="/browse"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors group">
            View All
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <CarCardSkeletonGrid count={3} />
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {featuredCars.map((car) => (
              <Link key={car.id} href={`/car/${car.id}`}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 hover:-translate-y-1 group">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={car.image[0]}
                      alt={car.name}
                      width={400}
                      height={250}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-slate-900 truncate">
                          {car.name}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="mt-1.5 bg-slate-100 text-slate-600 border-0 font-normal">
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
        )}

        {!isLoading && featuredCars.length > 0 && (
          <div className="text-center mt-10">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-all shadow-md hover:shadow-lg">
              Browse More Cars
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCars;
