"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar, Car, Clock, CreditCard, Loader2, Wallet } from "lucide-react";
import Image from "next/image";
import Header from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrencyINR } from "@/lib/helpers";
import Link from "next/link";
import { toast } from "sonner";

interface Booking {
  _id: string;
  car: {
    name: string;
    brand: string;
    model: string;
    image: string[];
  };
  startDate: string;
  endDate: string;
  totalDays: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  paymentPlan: string;
  status: string;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  pending_payment: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
  completed: "bg-slate-100 text-slate-600 border-slate-200",
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function MyBookingsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchBookings = useCallback(() => {
    fetch("/api/bookings/list")
      .then((res) => res.json())
      .then((data) => {
        const paid = (data.bookings || []).filter(
          (b: Booking) => b.amountPaid > 0 || b.status === "confirmed" || b.status === "completed"
        );
        setBookings(paid);
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchBookings();
    }
  }, [status, fetchBookings]);

  const handlePayRemaining = async (booking: Booking) => {
    setPayingId(booking._id);

    try {
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk) {
        toast.error("Failed to load payment gateway. Please try again.");
        setPayingId(null);
        return;
      }

      const res = await fetch("/api/bookings/pay-remaining", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking._id }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to initiate payment");
        setPayingId(null);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const options: any = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "RideOwn",
        description: `Remaining payment for ${booking.car?.brand} ${booking.car?.model}`,
        order_id: data.orderId,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/bookings/verify-remaining", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingId: booking._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              toast.success("Remaining payment confirmed!");
              fetchBookings();
            } else {
              toast.error("Payment received but confirmation pending. Contact support.");
            }
          } catch {
            toast.error("Payment received but confirmation pending. Contact support.");
          } finally {
            setPayingId(null);
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#1e293b",
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled. You can retry anytime.");
            setPayingId(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setPayingId(null);
      });
      rzp.open();
    } catch (error) {
      console.error("Pay remaining error:", error);
      toast.error("Something went wrong. Please try again.");
      setPayingId(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 md:px-8 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
          My Bookings
        </h1>

        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Car className="h-8 w-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">No bookings yet</h2>
            <p className="text-muted-foreground mt-1">Start by browsing available cars</p>
            <Link
              href="/browse"
              className="inline-block mt-6 px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-all">
              Browse Cars
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Car Image */}
                  <div className="w-full md:w-32 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                    {booking.car?.image?.[0] ? (
                      <Image
                        src={booking.car.image[0]}
                        alt={booking.car.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="h-8 w-8 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {booking.car?.brand} {booking.car?.model}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Booked on {format(new Date(booking.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`capitalize text-xs shrink-0 ${statusStyles[booking.status] || ""}`}>
                        {booking.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {format(new Date(booking.startDate), "MMM d")} →{" "}
                        {format(new Date(booking.endDate), "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {booking.totalDays} {booking.totalDays === 1 ? "day" : "days"}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1.5 font-medium text-slate-900">
                        <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                        Total: {formatCurrencyINR(booking.totalAmount)}
                      </span>
                      <span className="text-slate-500">
                        Paid: {formatCurrencyINR(booking.amountPaid)}
                      </span>
                      {booking.amountDue > 0 && (
                        <span className="text-amber-600 font-medium">
                          Due: {formatCurrencyINR(booking.amountDue)}
                        </span>
                      )}
                      <span className="text-muted-foreground capitalize">
                        ({booking.paymentPlan} payment)
                      </span>
                    </div>

                    {/* Pay Remaining Button */}
                    {booking.amountDue > 0 && booking.status === "confirmed" && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <Button
                          onClick={() => handlePayRemaining(booking)}
                          disabled={payingId === booking._id}
                          className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all">
                          {payingId === booking._id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Wallet className="h-4 w-4 mr-2" />
                          )}
                          Pay Remaining {formatCurrencyINR(booking.amountDue)}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1.5">
                          Remaining amount is due at pickup. Pay now to confirm fully.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
