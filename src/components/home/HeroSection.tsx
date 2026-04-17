import React from 'react'
import { Poppins } from "next/font/google";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const HeroSection = () => {
  return (
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
  )
}

export default HeroSection
