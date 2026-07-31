import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="relative flex flex-col items-center bg-[url('https://res.cloudinary.com/dxmmbkhq8/image/upload/v1771155904/swift_qvuk6a.png')] bg-cover bg-center bg-no-repeat overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/80" />

      <div className="relative z-10 w-full">
        <Header />
      </div>

      <main className="relative z-10 flex flex-col items-center text-center px-4 py-24 md:py-32 lg:py-40">
        <div className="animate-fade-in-up opacity-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold max-w-4xl text-white leading-[1.1] tracking-tight">
            Rent Your Dream Car
          </h1>
        </div>

        <div className="animate-fade-in-up opacity-0 animate-delay-200">
          <p className="text-white/80 max-w-lg mt-5 text-base md:text-lg lg:text-xl leading-relaxed">
            Find the perfect vehicle for your journey or earn money by sharing
            your car
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8 animate-fade-in-up opacity-0 animate-delay-400">
          <Button
            size="lg"
            asChild
            className="bg-white text-slate-900 hover:bg-slate-100 shadow-xl hover:shadow-2xl transition-all duration-300 px-8">
            <Link href="/browse">Get Started</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="border-white/30 text-white bg-white/10 backdrop-blur-sm px-8 ">
            <Link href="#featured">View Cars</Link>
          </Button>
        </div>

        <div className="mt-16 flex items-center gap-8 text-white/60 text-sm animate-fade-in-up opacity-0 animate-delay-500">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
            <span>No hidden fees</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
            <span>24/7 support</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
            <span>Free cancellation</span>
          </div>
        </div>
      </main>
    </section>
  );
};

export default HeroSection;
