"use client";

import Header from "@/components/header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Car, KeySquare, MapPinHouse, Star, Users } from "lucide-react";
import { faqItems } from "@/lib/data";
import { useSession } from "next-auth/react";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { getThreeCars } from "@/actions/cars";
import { useEffect, useState } from "react";
import { CarCardSkeletonGrid } from "@/components/ui/car-card-skeleton";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function Home() {
  const { data } = useSession();
  console.log(data); //to get user data

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
    <>
      {/* Hero Content */}
      {/* bg-[url('https://res.cloudinary.com/dxmmbkhq8/image/upload/v1765886927/swift_fjsxh0.jpg')] */}

      <section
        className={`${poppins.className} flex flex-col items-center text-sm
         bg-[url('https://res.cloudinary.com/dxmmbkhq8/image/upload/v1771155904/swift_qvuk6a.png')]
        bg-cover bg-center bg-no-repeat`}>
        <Header />
        <main className="flex flex-col items-center text-center px-4">
          <h1 className="mt-32 text-5xl md:text-6xl font-semibold max-w-4xl text-white">
            Rent Your Dream Car
          </h1>

          <p className=" text-white max-w-lg mt-4 lg:text-xl">
            Find the perfect vehicle for your journey or earn money by sharing
            your car
          </p>

          <div className="flex gap-4 mt-8 mb-9">
            <Button variant={"own"}>Get started</Button>
            <Button variant={"pricing"}>Pricing</Button>
          </div>
        </main>
      </section>

      {/* feature car  */}
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
                          <Badge variant="secondary" className="mt-2 mr-4 w-fit ">
                            {car.type}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            ₹{car.price}
                          </p>
                          <p className="text-sm text-muted-foreground">per day</p>
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
          <Button className="mx-auto mt-10 block" variant={"own"}>
            Browser more
          </Button>
        </div>
      </section>

      {/* why choose ours */}

      <section className="py-16">
        <div className="container mx-auto px-4 mb-8 ">
          <h2 className="text-2xl font-bold text-center mb-12">
            why Choose Our Platform
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Wide Selection</h3>
              <p className="text-gray-600">
                Thousands of verified vehicles for self rendering
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 text-blue-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <KeySquare className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Self-Drive Freedom</h3>
              <p className="text-gray-600">
                No drivers, no restrictions. Enjoy complete privacy and control
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 text-blue-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPinHouse className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Flexible Pickup & Drop Locations
              </h3>
              <p className="text-gray-600">
                Pick up and return cars from multiple locations making your
                trips smoother
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Questions */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Ask Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((faq, index) => {
              return (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </section>

      {/*join us section   */}
      <section>
        <div className="text-center p-3 py-24 dotted-background">
          <p className=" text-white max-w-xl mx-auto text-3xl font-semibold mb-5">
            Turn Your Car Into Cash
          </p>
          <p className="text-2xl font-normal text-center mx-auto mt-4 text-white mb-8">
            Join thousands of car owners earning extra income by sharing their
            vehicles
          </p>
          <Button variant={"pricing"} className="mt-2">
            Start Earning Today
          </Button>
        </div>
      </section>

      {/* footer */}
      <Footer />
    </>
  );
}
