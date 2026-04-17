import Header from "@/components/header";
import React from "react";
import Sidebar from "./admin/_components/Sidebar";


const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen">
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
        <Header />
      </header>
      <div className="flex h-full w-56 flex-col top-20 fixed inset-y-0 z-50">
        <Sidebar />
      </div>
      <main className="md:pl-56 pt-[80px] h-full">{children}</main>
    </div>
  );
};

export default Layout;
