"use client";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data } = useSession();
  console.log(data); //to get user data
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-800  text-white">
      <div className="text-center space-y-6 px-6">
        <h1 className="text-4xl md:text-6xl font-bold">🚀 Coming Soon</h1>
        <p className="text-lg md:text-xl text-gray-300">
          We're working hard to give you something amazing. Stay tuned!
        </p>
      </div>
    </div>
  );
}
