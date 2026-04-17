import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqItems } from "@/lib/data";

const FAQSection = () => {
  return (
    <div>
      <section className="py-12 bg-gray-50">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl lg:text-4xl font-bold text-center mb-8">
                  Frequently Ask Questions
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((faq, index) => {
                    return (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-xl hover:no-underline">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-[16px] md:text-[22px]">{faq.answer}</AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            </section>
    </div>
  )
}

export default FAQSection
