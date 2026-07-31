"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Fuel, Gauge, Users, Palette, Calendar, Route } from "lucide-react";

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
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
      {/* IMAGE GALLERY - takes 3 cols */}
      <div className="lg:col-span-3 space-y-4">
        <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <Image
            src={images[selectedImage]}
            alt={car.name}
            fill
            priority
            className="object-cover transition-all duration-300"
          />
        </div>

        {images.length > 1 && (
          <div className="flex gap-2.5 overflow-x-auto pb-2">
            {images.map((img, index) => (
              <div
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative min-w-[80px] h-[64px] rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                  selectedImage === index
                    ? "border-slate-900 shadow-md"
                    : "border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-400"
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
        )}
      </div>

      {/* DETAILS SECTION - takes 2 cols */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
          {/* Header */}
          <div className="flex justify-between items-start gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {car.brand} {car.model}
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">{car.year}</p>
            </div>
            <Badge
              variant={car.status === "available" ? "default" : "destructive"}
              className={`capitalize text-xs px-2.5 py-1 ${
                car.status === "available"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  : ""
              }`}>
              {car.status}
            </Badge>
          </div>

          <div className="mt-5 p-4 bg-slate-50 rounded-xl">
            <p className="text-3xl font-bold text-slate-900">
              ₹{car.price}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                / day
              </span>
            </p>
          </div>

          {/* Specs Grid */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Spec icon={Fuel} label="Fuel Type" value={car.fuelType} />
            <Spec icon={Gauge} label="Transmission" value={car.transmission} />
            <Spec icon={Users} label="Seats" value={`${car.seats} seats`} />
            <Spec icon={Gauge} label="Mileage" value={`${car.mileage} km/l`} />
            <Spec icon={Palette} label="Color" value={car.color} />
            <Spec icon={Calendar} label="Body Type" value={car.bodyType} />
          </div>

          {/* Trips */}
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Route className="h-4 w-4" />
            <span>{car.trips} trips completed</span>
          </div>

          {/* Description */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {car.description}
            </p>
          </div>

          {/* Book Now */}
          <Button
            className={`w-full mt-6 py-6 text-base font-medium rounded-xl transition-all ${
              car.status !== "available"
                ? "bg-slate-200 text-slate-500 hover:bg-slate-200 cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg"
            }`}
            disabled={car.status !== "available"}>
            {car.status === "available" ? "Book Now" : "Car Not Available"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Spec({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-slate-600" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-slate-900 capitalize">{value}</p>
      </div>
    </div>
  );
}
