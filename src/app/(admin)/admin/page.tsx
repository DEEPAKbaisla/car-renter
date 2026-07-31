import { Car, TrendingUp, Users, Calendar } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard | RideOwn",
  description: "Admin dashboard for RideOwn car marketplace",
};

const stats = [
  {
    label: "Total Cars",
    value: "--",
    icon: Car,
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Active Bookings",
    value: "--",
    icon: Calendar,
    gradient: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Total Users",
    value: "--",
    icon: Users,
    gradient: "from-violet-500 to-violet-600",
    bg: "bg-violet-50",
  },
  {
    label: "Revenue",
    value: "--",
    icon: TrendingUp,
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
  },
];

const DashboardPage = () => {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back. Here&apos;s an overview of your platform.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bg} w-12 h-12 rounded-xl flex items-center justify-center`}>
                <stat.icon className="h-6 w-6 text-slate-700" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/cars/create"
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center group-hover:bg-slate-800 transition-colors">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-slate-900 text-sm">Add New Car</p>
                <p className="text-xs text-muted-foreground">List a car on the marketplace</p>
              </div>
            </Link>
            <Link
              href="/admin/cars"
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center group-hover:bg-slate-800 transition-colors">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-slate-900 text-sm">Manage Cars</p>
                <p className="text-xs text-muted-foreground">View and update your inventory</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <Calendar className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm text-muted-foreground">
              No recent activity to display.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
