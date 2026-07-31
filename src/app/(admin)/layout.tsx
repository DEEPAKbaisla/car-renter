import Header from "@/components/header";
import { ReactNode } from "react";
import Sidebar from "./admin/_components/Sidebar";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="h-screen bg-slate-50/50">
      <header className="fixed top-0 w-full z-50">
        <Header />
      </header>
      <div className="flex h-full w-56 flex-col top-[65px] fixed inset-y-0 z-40">
        <Sidebar />
      </div>
      <main className="md:pl-56 pt-[65px] h-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
