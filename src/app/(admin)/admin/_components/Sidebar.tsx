'use client'
import { Calendar, Car, Cog, LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    label: "Cars",
    icon: Car,
    href: "/admin/cars",
  },
  {
    label: "Bookings",
    icon: Calendar,
    href: "/admin/bookings",
  },
  {
    label: "Settings",
    icon: Cog,
    href: "/admin/settings",
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  return (
    <>
      <div className="hidden md:flex h-full flex-col overflow-y-auto bg-white border-r border-slate-200">
        {routes.map((route) => {
          const isActive = route.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(route.href);
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 text-sm font-medium pl-6 pr-4 transition-all duration-200",
                isActive
                  ? "text-slate-900 bg-slate-100 border-r-2 border-slate-900"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50",
                "h-11"
              )}>
              <route.icon className={cn("h-4.5 w-4.5", isActive ? "text-slate-900" : "text-slate-400")} />
              {route.label}
            </Link>
          );
        })}
      </div>

      {/* Mobile bottom tabs */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex justify-around items-center h-16 safe-area-pb">
        {routes.map((route) => {
          const isActive = route.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(route.href);
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex flex-col items-center justify-center text-xs font-medium transition-all duration-200 py-1 flex-1",
                isActive ? "text-slate-900" : "text-slate-400"
              )}>
              <route.icon
                className={cn(
                  "h-5 w-5 mb-1",
                  isActive ? "text-slate-900" : "text-slate-400"
                )}
              />
              {route.label}
            </Link>
          );
        })}
      </div>
    </>
  );
};

export default Sidebar;
