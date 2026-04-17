
import { Car, KeySquare, MapPinHouse } from "lucide-react";

const WhyChoose = () => {
  return (
    <div>
      <section className="py-16">
        <div className="container mx-auto px-4 mb-8 ">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
            why Choose Our Platform
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Wide Selection</h3>
              <p className="text-gray-600 text-xl leading-relaxed">
                Thousands of verified vehicles for self rendering
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 text-blue-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <KeySquare className="h-8 w-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Self-Drive Freedom</h3>
              <p className="text-gray-600 text-xl leading-relaxed">
                No drivers, no restrictions. Enjoy complete privacy and control
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 text-blue-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPinHouse className="h-8 w-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">
                Flexible Pickup & Drop Locations
              </h3>
              <p className="text-gray-600 text-xl leading-relaxed">
                Pick up and return cars from multiple locations making your
                trips smoother
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default WhyChoose
