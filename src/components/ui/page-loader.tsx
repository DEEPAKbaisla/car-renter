"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = "Loading..." }: PageLoaderProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Delay showing loader to avoid flash for fast loads
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col items-center gap-4 p-8 rounded-lg bg-card shadow-lg border">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium text-foreground">{message}</p>
      </div>
    </div>
  );
}
