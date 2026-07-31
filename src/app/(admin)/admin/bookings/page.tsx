import BookingsList from "./_components/bookings-list";

export const metadata = {
  title: "Bookings | RideOwn Admin",
  description: "Manage all bookings for RideOwn",
};

const BookingsPage = () => {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Bookings Management
        </h1>
        <p className="text-muted-foreground mt-1">
          View and manage all customer bookings.
        </p>
      </div>
      <BookingsList />
    </div>
  );
};

export default BookingsPage;
