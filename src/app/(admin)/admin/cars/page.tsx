import CarList from "./_components/car-list";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cars | RideOwn",
  description: "Manage cars for RideOwn car marketplace",
};

const CarPage = () => {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Cars Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your car inventory and listings.
        </p>
      </div>
      <CarList />
    </div>
  );
};

export default CarPage;
