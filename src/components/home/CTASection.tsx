import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const CTASection = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="dotted-background py-20 md:py-28 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
            Turn Your Car Into Cash
          </h2>
          <p className="text-white/70 text-base md:text-lg mt-4 max-w-xl mx-auto leading-relaxed">
            Join thousands of car owners earning extra income by sharing their
            vehicles
          </p>
          <Button
            size="lg"
            asChild
            className="mt-8 bg-white text-slate-900 hover:bg-slate-100 shadow-xl hover:shadow-2xl transition-all duration-300 px-8">
            <Link href="/signup" className="inline-flex items-center gap-2">
              Start Earning Today
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
