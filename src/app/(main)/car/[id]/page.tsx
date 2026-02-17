
// "use client";

import { getCarById } from "@/actions/cars";
import CarDetails from "../../_components/car-details"
import Header from "@/components/header";

// import { useParams } from "next/navigation";

// const CarPage = () => {
//   const params = useParams();
//   const id = params.id as string;

//   console.log("Car ID:", id); // browser console

//   return <div>Car ID: {id}</div>;
// };

// export default CarPage;




interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CarPage({ params }: PageProps) {
  // ✅ unwrap params
  const { id } = await params

  try {
    const res = await getCarById(id)

    if (!res.success) {
      return (
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold">
            Car not found
          </h2>
        </div>
      )
    }

    const data = res.data

    return (<>
        <Header/>
      <div className="container mx-auto px-4 py-8">
        <CarDetails car={data} />
      </div>
      </>
    )
  } catch (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">
          Something went wrong
        </h2>
      </div>
    )
  }
}
