import Footer from "@/components/Footer";
import dynamic from "next/dynamic";

const HeroSection = dynamic(() => import("@/components/home/HeroSection"));
const FeaturedCars = dynamic(() => import("@/components/home/FeaturedCars"), {
  loading: () => <p className="text-center">Loading cars...</p>,
});
const WhyChoose = dynamic(() => import("@/components/home/WhyChoose"));
const FAQSection = dynamic(() => import("@/components/home/FAQSection"));
const CTASection = dynamic(() => import("@/components/home/CTASection"));

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedCars />
      <WhyChoose />
      <FAQSection />
      <CTASection />
      <Footer />
    </>
  );
}