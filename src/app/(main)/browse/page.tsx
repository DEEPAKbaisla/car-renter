import { AllCars } from "@/actions/cars";
import Header from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Star, Users } from "lucide-react";
import Link from "next/link";


// const allCars = [
//   {
//     id: 1,
//     name: "Tesla Model 3",
//     type: "Electric",
//     price: 89,
//     rating: 4.9,
//     trips: 234,
//     image:
//       "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop",
//   },
//   {
//     id: 2,
//     name: "BMW X5",
//     type: "SUV",
//     price: 125,
//     rating: 4.8,
//     trips: 189,
//     image:
//       "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop",
//   },
//   {
//     id: 3,
//     name: "Mercedes C-Class",
//     type: "Luxury",
//     price: 110,
//     rating: 4.9,
//     trips: 312,
//     image:
//       "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop",
//   },
//   {
//     id: 4,
//     name: "Audi A4",
//     type: "Sedan",
//     price: 95,
//     rating: 4.7,
//     trips: 156,
//     image:
//       "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop",
//   },
//   {
//     id: 5,
//     name: "Porsche 911",
//     type: "Sports",
//     price: 299,
//     rating: 5.0,
//     trips: 78,
//     image:
//       "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop",
//   },
//   {
//     id: 6,
//     name: "Range Rover Sport",
//     type: "SUV",
//     price: 175,
//     rating: 4.8,
//     trips: 201,
//     image:
//       "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop",
//   },
// ];

const allCars= await AllCars()

const BrowseCars = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* <Navbar /> */}
      <Header/>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Browse Available Cars</h1>
          <p className="text-muted-foreground text-lg mb-6">
            Find the perfect vehicle for your next adventure
          </p>

          {/* <div className="flex gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by make, model, or type..." 
                className="pl-10"
              />
            </div>
            <Button>Search</Button>
          </div> */}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCars.map((car: any) => (
            <Link key={car._id} href={`/car/${car._id}`}>
              <Card className="overflow-hidden group shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all h-full">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={car.image[0]}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">{car.name}</h3>
                      <Badge variant="secondary" className="mt-2">
                        {car.type}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        ${car.price}
                      </p>
                      <p className="text-sm text-muted-foreground">per day</p>
                    </div>
                  </div>
                </CardHeader>
                <CardFooter className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span>{car.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{car.trips} trips</span>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrowseCars;
