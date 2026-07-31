"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  MoreHorizontal,
  Search,
  User,
  XCircle,
} from "lucide-react";
import { formatCurrencyINR } from "@/lib/helpers";

interface BookingUser {
  name: string;
  email: string;
}

interface BookingCar {
  name: string;
  brand: string;
  model: string;
  image: string[];
}

interface Booking {
  _id: string;
  user: BookingUser;
  car: BookingCar;
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

const BookingsList = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/bookings?${params.toString()}`);
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch {
      toast.error("Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleUpdateStatus = async (bookingId: string, action: string) => {
    setUpdatingId(bookingId);
    try {
      const res = await fetch("/api/admin/bookings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, action }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Booking ${action === "confirm" ? "confirmed" : action === "cancel" ? "cancelled" : "completed"}`);
        fetchBookings();
      } else {
        toast.error(data.error || "Failed to update booking");
      }
    } catch {
      toast.error("Failed to update booking");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-600">From Date</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-10 border-slate-200 w-full sm:w-44"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-600">To Date</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-10 border-slate-200 w-full sm:w-44"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-600">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 border-slate-200 w-full sm:w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending_payment">Pending Payment</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" variant="outline" className="border-slate-200 h-10">
          <Search className="h-4 w-4 mr-1.5" />
          Filter
        </Button>
      </form>

      {/* Table */}
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100">
                    <TableHead className="font-semibold text-slate-700">Customer</TableHead>
                    <TableHead className="font-semibold text-slate-700">Car</TableHead>
                    <TableHead className="font-semibold text-slate-700">Dates</TableHead>
                    <TableHead className="font-semibold text-slate-700">Amount</TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking._id} className="border-slate-50 hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-slate-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {booking.user?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {booking.user?.email || ""}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium text-slate-900">
                          {booking.car?.brand} {booking.car?.model}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {format(new Date(booking.startDate), "MMM d")} →{" "}
                          {format(new Date(booking.endDate), "MMM d, yyyy")}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {booking.totalDays} {booking.totalDays === 1 ? "day" : "days"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium text-slate-900">
                          {formatCurrencyINR(booking.totalAmount)}
                        </p>
                        <div className="flex gap-2 text-xs mt-0.5">
                          <span className="text-emerald-600">
                            Paid: {formatCurrencyINR(booking.amountPaid)}
                          </span>
                          {booking.amountDue > 0 && (
                            <span className="text-amber-600">
                              Due: {formatCurrencyINR(booking.amountDue)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize text-xs ${statusStyles[booking.status] || ""}`}>
                          {booking.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-8 w-8 hover:bg-slate-100"
                              disabled={updatingId === booking._id}>
                              {updatingId === booking._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4 text-slate-500" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                              Manage Booking
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(booking._id, "confirm")}
                              disabled={booking.status === "confirmed" || booking.status === "completed"}
                              className="cursor-pointer">
                              <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                              Confirm
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(booking._id, "complete")}
                              disabled={booking.status !== "confirmed"}
                              className="cursor-pointer">
                              <Clock className="h-4 w-4 mr-2 text-blue-600" />
                              Mark Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(booking._id, "cancel")}
                              disabled={booking.status === "cancelled" || booking.status === "completed"}
                              className="text-red-600 focus:text-red-600 cursor-pointer">
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Calendar className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                No bookings found
              </h3>
              <p className="text-muted-foreground text-sm mb-5 max-w-sm">
                {startDate || endDate || statusFilter !== "all"
                  ? "No bookings match your filters. Try different criteria."
                  : "No bookings have been made yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingsList;
