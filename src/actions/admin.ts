"use server";

import { useSession } from "next-auth/react";
import { notFound } from "next/navigation";

export async function getAdmin() {
  const { data } = useSession();
  if (data?.user && data.user.role === "admin") {
    return data.user;
  }
  return notFound();
}

