import React from "react";
import AddCarForm from "../_components/add-car-form";
export const metadata = {
  title: " Add new car | RideOwn",
  description: "Add a new car to the Rideown marketplace",
};

const AddCarPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Add New car</h1>
      <AddCarForm /> 
    </div>
  );
};

export default AddCarPage;
