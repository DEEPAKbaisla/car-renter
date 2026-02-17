"use client";
import Link from "next/link";

const notfound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 px-6 text-center text-white">
      <h1 className="text-7xl font-extrabold tracking-tight text-indigo-500">
        404
      </h1>

      <p className="mt-4 text-2xl font-semibold">Page Not Found</p>

      <p className="mt-2 max-w-md text-gray-400">
        Sorry, the page you’re looking for doesn’t exist or has been moved.
      </p>

      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-500">
          Go Home
        </Link>

        <button
          onClick={() => window.history.back()}
          className="rounded-lg border border-gray-600 px-6 py-3 font-medium text-gray-300 transition hover:bg-gray-800">
          Go Back
        </button>
      </div>
    </div>
  );
};

export default notfound;
