import { Car, KeySquare, MapPinHouse } from "lucide-react";

const features = [
  {
    icon: Car,
    title: "Wide Selection",
    description: "Thousands of verified vehicles for self-drive rental",
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: KeySquare,
    title: "Self-Drive Freedom",
    description: "No drivers, no restrictions. Enjoy complete privacy and control",
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
  },
  {
    icon: MapPinHouse,
    title: "Flexible Pickup & Drop",
    description: "Pick up and return cars from multiple locations making your trips smoother",
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
  },
];

const WhyChoose = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12 md:mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Why Choose Our Platform
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Everything you need for a seamless car rental experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group text-center p-8 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className={`${feature.bg} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-8 w-8 text-slate-700" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
