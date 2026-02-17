"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface CarProps {
  car?: {
    name: string;
    brand: string;
    model: string;
    transmission: string;
    fuelType: string;
    seats: number;
    price: number;
    year: number;
    color: string;
    description: string;
    mileage: number;
    bodyType: string;
    status: string;
    trips: number;
    image?: string[];
  };
}

export default function CarDetails({ car }: CarProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!car) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Loading car details...</p>
      </div>
    );
  }

  const images =
    car.image && car.image.length > 0 ? car.image : ["/placeholder.jpg"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* ================= IMAGE GALLERY ================= */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[450px] rounded-xl overflow-hidden border">
          <Image
            src={images[selectedImage]}
            alt={car.name}
            fill
            priority
            className="object-cover transition-all duration-300"
          />
        </div>

        {/* Thumbnails */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <div
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative min-w-[80px] h-[70px] rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                selectedImage === index
                  ? "border-primary"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}>
              <Image
                src={img}
                alt={`car-${index}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ================= DETAILS SECTION ================= */}
      <Card className="shadow-lg rounded-2xl">
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">
                {car.brand} {car.model}
              </h1>
              <p className="text-muted-foreground text-sm">{car.year}</p>
            </div>

            <Badge
              variant={car.status === "available" ? "success" : "destructive"}
              className="capitalize">
              {car.status}
            </Badge>
          </div>

          <Separator />

          {/* Price */}
          <h2 className="text-3xl font-bold text-primary">
            ₹{car.price}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              / day
            </span>
          </h2>

          <Separator />

          {/* Specs */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Spec label="Fuel Type" value={car.fuelType} />
            <Spec label="Transmission" value={car.transmission} />
            <Spec label="Seats" value={car.seats.toString()} />
            <Spec label="Mileage" value={`${car.mileage} km/l`} />
            <Spec label="Color" value={car.color} />
            <Spec label="Body Type" value={car.bodyType} />
            <Spec label="Trips Completed" value={car.trips.toString()} />
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {car.description}
            </p>
          </div>

          {/* <Button className="w-full mt-4">Book Now</Button> */}
          <Button
  className={`w-full mt-4 ${
    car.status !== "available" ? "bg-gray-400 hover:bg-gray-400" : ""
  }`}
  disabled={car.status !== "available"}
>
  {car.status === "available" ? "Book Now" : "Car Not Available"}
</Button>

        </CardContent>
      </Card>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted p-3 rounded-lg">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium capitalize">{value}</p>
    </div>
  );
}
