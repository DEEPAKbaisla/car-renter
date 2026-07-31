"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { format, differenceInCalendarDays, addDays } from "date-fns";
import { Calendar, CreditCard, Wallet, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrencyINR } from "@/lib/helpers";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  car: {
    id: string;
    name: string;
    price: number;
  };
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export default function BookingModal({ open, onOpenChange, car }: BookingModalProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [paymentPlan, setPaymentPlan] = useState<"full" | "half" | null>(null);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (open) {
      setStartDate(undefined);
      setEndDate(undefined);
      setPaymentPlan(null);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const loadRazorpayScript = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      if (scriptLoaded && window.Razorpay) {
        resolve(true);
        return;
      }
      const existing = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );
      if (existing) {
        setScriptLoaded(true);
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        setScriptLoaded(true);
        resolve(true);
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, [scriptLoaded]);

  const totalDays =
    startDate && endDate ? Math.max(1, differenceInCalendarDays(endDate, startDate)) : 0;
  const totalAmount = totalDays * car.price;
  const amountToPayNow =
    paymentPlan === "full" ? totalAmount : paymentPlan === "half" ? Math.round(totalAmount / 2) : 0;
  const amountDue = totalAmount - amountToPayNow;

  const handleBooking = async () => {
    if (!startDate || !endDate || !paymentPlan) {
      toast.error("Please select dates and a payment plan");
      return;
    }

    setLoading(true);

    try {
      const scriptLoadedOk = await loadRazorpayScript();
      if (!scriptLoadedOk) {
        toast.error("Failed to load payment gateway. Please try again.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: car.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          paymentPlan,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create booking");
        setLoading(false);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const options: any = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "RideOwn",
        description: `Booking for ${car.name}`,
        order_id: data.orderId,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/bookings/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingId: data.bookingId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              if (paymentPlan === "half") {
                toast.success("Booking confirmed! You can pay the remaining amount from My Bookings.");
              } else {
                toast.success("Booking confirmed!");
              }
              onOpenChange(false);
              router.push("/my-bookings");
            } else {
              toast.error("Payment verified but booking update failed. Contact support.");
            }
          } catch {
            toast.error("Payment received but confirmation pending. Contact support.");
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
            toast.info("Payment cancelled.");
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!loading}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Book {car.name}
          </DialogTitle>
          <DialogDescription>
            Select your trip dates and payment option
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Date Picker */}
          <div>
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4" />
              Trip Dates
            </label>
            <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
              <DayPicker
                mode="range"
                selected={startDate && endDate ? { from: startDate, to: endDate } : undefined}
                onSelect={(range) => {
                  setStartDate(range?.from);
                  setEndDate(range?.to);
                }}
                disabled={{ before: addDays(new Date(), 0) }}
                numberOfMonths={1}
                className="text-sm"
              />
            </div>
            {startDate && endDate && (
              <p className="text-xs text-muted-foreground mt-1.5">
                {format(startDate, "MMM d, yyyy")} → {format(endDate, "MMM d, yyyy")}{" "}
                ({totalDays} {totalDays === 1 ? "day" : "days"})
              </p>
            )}
          </div>

          {/* Total Amount */}
          {totalDays > 0 && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total rental amount</span>
                <span className="text-xl font-bold text-slate-900">
                  {formatCurrencyINR(totalAmount)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatCurrencyINR(car.price)} × {totalDays} {totalDays === 1 ? "day" : "days"}
              </p>
            </div>
          )}

          {/* Payment Plan */}
          {totalDays > 0 && (
            <div>
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4" />
                Payment Option
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentPlan("full")}
                  className={cn(
                    "relative p-4 rounded-xl border-2 text-left transition-all",
                    paymentPlan === "full"
                      ? "border-slate-900 bg-slate-900 text-white shadow-md"
                      : "border-slate-200 bg-white hover:border-slate-400"
                  )}>
                  {paymentPlan === "full" && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                  <Wallet className={cn("h-5 w-5 mb-2", paymentPlan === "full" ? "text-white" : "text-slate-600")} />
                  <p className="font-semibold text-sm">Pay Full Amount</p>
                  <p className={cn("text-xs mt-1", paymentPlan === "full" ? "text-slate-200" : "text-muted-foreground")}>
                    {formatCurrencyINR(totalAmount)}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentPlan("half")}
                  className={cn(
                    "relative p-4 rounded-xl border-2 text-left transition-all",
                    paymentPlan === "half"
                      ? "border-slate-900 bg-slate-900 text-white shadow-md"
                      : "border-slate-200 bg-white hover:border-slate-400"
                  )}>
                  {paymentPlan === "half" && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                  <Wallet className={cn("h-5 w-5 mb-2", paymentPlan === "half" ? "text-white" : "text-slate-600")} />
                  <p className="font-semibold text-sm">Pay 50% Now</p>
                  <p className={cn("text-xs mt-1", paymentPlan === "half" ? "text-slate-200" : "text-muted-foreground")}>
                    {formatCurrencyINR(amountToPayNow)}
                  </p>
                </button>
              </div>
              {paymentPlan === "half" && (
                <p className="text-xs text-amber-600 mt-2 bg-amber-50 rounded-lg px-3 py-1.5">
                  Remaining {formatCurrencyINR(amountDue)} due at pickup
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-4">
          <Button
            onClick={handleBooking}
            disabled={!startDate || !endDate || !paymentPlan || loading}
            className="w-full py-6 text-base font-medium rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : null}
            {loading
              ? "Processing..."
              : paymentPlan === "half"
                ? `Pay ${formatCurrencyINR(amountToPayNow)} Now`
                : paymentPlan === "full"
                  ? `Pay ${formatCurrencyINR(totalAmount)}`
                  : "Select dates & payment plan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
