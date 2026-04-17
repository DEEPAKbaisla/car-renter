import { Button } from "../ui/button"

const CTASection = () => {
  return (
    <div>
      <section>
        <div className="text-center p-3 py-24 dotted-background">
          <p className=" text-white text-2xl max-w-xl mx-auto md:text-4xl mb-5">
            Turn Your Car Into Cash
          </p>
          <p className="text-2xl md:text-3xl text-center mx-auto mt-4 text-white mb-8">
            Join thousands of car owners earning extra income by sharing their
            vehicles
          </p>
          <Button variant={"pricing"} className="mt-2">
            Start Earning Today
          </Button>
        </div>
      </section>
    </div>
  )
}

export default CTASection
