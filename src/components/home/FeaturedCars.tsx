"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CarCardSkeletonGrid } from "@/components/ui/car-card-skeleton";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Users } from "lucide-react";
import { getThreeCars } from "@/actions/cars";

const FeaturedCars = () => {
  const [featuredCars, setFeaturedCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCars() {
      setIsLoading(true);
      try {
        const cars = await getThreeCars(); // calling your function
        setFeaturedCars(cars);
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCars();
  }, []);

  return (
    <div>
      <section className="py-15">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Featured Cars</h2>
            <Link href="/browse">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          {/* href={`/car/${car.id}`} */}
          {isLoading ? (
            <CarCardSkeletonGrid count={3} />
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {featuredCars.map((car) => (
                <Link key={car._id} href={`/car/${car._id}`}>
                  <Card className="overflow-hidden group shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all rounded-2xl">
                    <div className="relative  rounded-t-xl overflow-hidden">
                      <Image
                        src={car.image[0]}
                        alt={car.name}
                        width={400}
                        height={250}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 rounded-t-2xl"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold ">{car.name}</h3>
                          <Badge
                            variant="secondary"
                            className="mt-2 mr-4 w-fit ">
                            {car.type}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            ₹{car.price}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            per day
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {/* <Star className="h-4 w-4 fill-accent text-accent" />
                        <span>{car.rating}</span> */}
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
          <Button className="mx-auto mt-10 block md:py-0" variant={"own"}>
            Browser more
          </Button>
        </div>
      </section>
    </div>
  );
};

export default FeaturedCars;
