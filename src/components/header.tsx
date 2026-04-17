"use client";
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
  console.log("User Role:", role);
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  return (
    <div className="w-full">
      <nav className="sticky top-0 z-50 flex items-center justify-between w-full py-4 px-6 md:px-16 lg:px-24 backdrop-blur text-slate-800">
        <Link href="/">
          <span className="font-bold text-xl text-amber-50">
            <Image src="/favicon.ico" alt="Logo" width={32} height={32} />
          </span>
        </Link>

        <div className="hidden md:flex gap-8 text-white font-medium text-xl">
          <Link href="/">Home</Link>
          <Link href="/browse">Browser cars</Link>
        </div>

        {data?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="outline-none">
                {data.user.image ? (
                  <img
                    src={data.user.image}
                    alt="user"
                    className="h-10 w-10 rounded-full border object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/user.webp";
                    }}
                  />
                ) : (
                  <User className="h-9 w-9 rounded-full bg-zinc-300 p-1" />
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">{data.user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {data.user.email}
                  </span>
                  <span
                    className={`mt-1 w-fit rounded-full px-2 py-0.5 text-xs capitalize ${
                      role === "admin"
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                    {role}
                  </span>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {/* User Links */}
              <DropdownMenuItem asChild>
                <Link href="/my-bookings" className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  My Bookings
                </Link>
              </DropdownMenuItem>

              {/* Admin Only */}
              {role === "admin" && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Admin Portal
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {/* Logout */}
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-600 focus:text-red-600 cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex gap-3">
            <Button variant="own">Get started</Button>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Header;
