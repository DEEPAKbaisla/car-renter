"use client";
import Link from "next/link";
import { Car } from "lucide-react";

const notfound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 text-center text-white">
      <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-6">
        <Car className="h-10 w-10 text-white/80" />
      </div>

      <h1 className="text-7xl md:text-8xl font-extrabold tracking-tight text-white">
        404
      </h1>

      <p className="mt-3 text-xl md:text-2xl font-semibold text-white/90">
        Page Not Found
      </p>

      <p className="mt-2 max-w-md text-slate-400 leading-relaxed">
        Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="rounded-xl bg-white text-slate-900 px-6 py-3 font-medium transition-all hover:bg-slate-100 shadow-lg hover:shadow-xl">
          Go Home
        </Link>

        <button
          onClick={() => window.history.back()}
          className="rounded-xl border border-white/20 px-6 py-3 font-medium text-white/80 transition-all hover:bg-white/10 backdrop-blur-sm">
          Go Back
        </button>
      </div>
    </div>
  );
};

export default notfound;
