import AddCarForm from "../_components/add-car-form";

export const metadata = {
  title: "Add New Car | RideOwn",
  description: "Add a new car to the RideOwn marketplace",
};

const AddCarPage = () => {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Add New Car
        </h1>
        <p className="text-muted-foreground mt-1">
          List a new car on the marketplace.
        </p>
      </div>
      <AddCarForm />
    </div>
  );
};

export default AddCarPage;
