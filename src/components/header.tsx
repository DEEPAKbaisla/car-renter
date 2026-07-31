"use client";
import { useEffect, useState } from "react";
import { Car, LayoutDashboard, LogOut, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const Header = () => {
  const { data } = useSession();
  const role = data?.user?.role;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="w-full">
      <nav className="sticky top-0 z-50 flex items-center justify-between w-full py-4 px-6 md:px-16 lg:px-24 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 transition-all">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <Image src="/favicon.ico" alt="Logo" width={20} height={20}  />
          </div>
          <span className="font-heading font-bold text-xl text-slate-900 hidden sm:block tracking-tight">
            RideOwn
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link href="/" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200">
            Home
          </Link>
          <Link href="/browse" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200">
            Browse Cars
          </Link>
        </div>

        {mounted && data?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="outline-none ring-0 focus:ring-0">
                {data.user.image ? (
                  <img
                    src={data.user.image}
                    alt="user"
                    className="h-10 w-10 rounded-full border-2 border-slate-200 object-cover hover:border-slate-400 transition-colors"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/user.webp";
                    }}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white hover:from-slate-600 hover:to-slate-800 transition-all">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-60 p-1.5">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-0.5 px-2 py-1">
                  <span className="font-semibold text-sm">{data.user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {data.user.email}
                  </span>
                  <span
                    className={`mt-1.5 w-fit rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      role === "admin"
                        ? "bg-red-50 text-red-600 border border-red-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                    {role}
                  </span>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                <Link href="/my-bookings" className="flex items-center gap-2.5 px-2 py-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  My Bookings
                </Link>
              </DropdownMenuItem>

              {role === "admin" && (
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link href="/admin" className="flex items-center gap-2.5 px-2 py-2">
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    Admin Portal
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-600 focus:text-red-600 cursor-pointer rounded-lg px-2 py-2">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="text-slate-700 hover:text-slate-900">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg transition-all">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Header;
