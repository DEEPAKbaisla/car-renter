"use client";
import { deleteCar, getCars, updateCarStatus } from "@/actions/cars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useFetch from "@/hooks/use-fetch";
import { formatCurrencyINR } from "@/lib/helpers";
import { SerializedCar } from "@/types";
import {
  CarIcon,
  Eye,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const CarList = () => {
  const [search, setSearch] = useState("");
  const [carToDelete, setCarToDelete] = useState<SerializedCar | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const {
    loading: loadingCars,
    fn: fetchCars,
    data: carsData,
    error: carsError,
  } = useFetch(getCars);
  useEffect(() => {
    fetchCars(search);
  }, [search]);

  const {
    loading: deletingCar,
    fn: deleteCarFn,
    data: deleteResult,
    error: deleteError,
  } = useFetch(deleteCar);

  const {
    loading: updatingCar,
    fn: updateCarStatusFn,
    data: updateResult,
    error: updateError,
  } = useFetch(updateCarStatus);

  const handleSearchSumbit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchCars(search);
  };

  useEffect(() => {
    if (deleteResult?.success) {
      toast.success("Car deleted successfully");
      fetchCars(search);
    }
    if (updateResult?.success) {
      toast.success("Car status updated successfully");
      fetchCars(search);
    }
  }, [updateResult, deleteResult]);

  useEffect(() => {
    if (carsError) {
      toast.error("Failed to load cars");
    }
    if (deleteError) {
      toast.error("Failed to delete car");
    }
    if (updateError) {
      toast.error("Failed to update car");
    }
  }, [carsError, deleteError, updateError]);

  const handleDeleteCar = async () => {
    if (!carToDelete) return;
    await deleteCarFn(carToDelete.id);
    setCarToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleStatusUpdate = async (carId: string, status: string) => {
    try {
      await updateCarStatusFn(carId, status);
      await fetchCars();
    } catch (error) {
      console.error("Something went wrong", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-medium">
            Available
          </Badge>
        );
      case "unavailable":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 font-medium">
            Unavailable
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <Button
          onClick={() => router.push("/admin/cars/create")}
          className="bg-slate-900 hover:bg-slate-800 shadow-sm">
          <Plus className="h-4 w-4 mr-1.5" /> Add Car
        </Button>
        <form onSubmit={handleSearchSumbit} className="flex w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-10 w-full sm:w-64 h-10 border-slate-200"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              type="search"
              placeholder="Search cars..."
            />
          </div>
        </form>
      </div>

      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-0">
          {loadingCars && !carsData ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : carsData?.success && carsData.data && carsData.data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100">
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="font-semibold text-slate-700">Make & Model</TableHead>
                    <TableHead className="font-semibold text-slate-700">Year</TableHead>
                    <TableHead className="font-semibold text-slate-700">Price</TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700">Trips</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {carsData.data.map((car) => (
                    <TableRow key={car.id} className="border-slate-50 hover:bg-slate-50/50">
                      <TableCell className="h-11 w-11 rounded-lg overflow-hidden">
                        {car.image && car.image.length > 0 ? (
                          <Image
                            src={car.image[0]}
                            alt={`${car.name} ${car.model}`}
                            height={44}
                            width={44}
                            className="w-full h-full object-cover rounded-lg"
                            priority
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center">
                            <CarIcon className="h-5 w-5 text-slate-400" />
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="font-medium text-slate-900">{car.name}</TableCell>
                      <TableCell className="text-slate-600">{car.year}</TableCell>
                      <TableCell className="font-medium text-slate-900">{formatCurrencyINR(car.price)}</TableCell>
                      <TableCell>{getStatusBadge(car.status)}</TableCell>
                      <TableCell className="text-slate-600">{car.trips}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-8 w-8 hover:bg-slate-100">
                              <MoreHorizontal className="h-4 w-4 text-slate-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel className="text-xs text-muted-foreground">Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => router.push(`/car/${car.id}`)}
                              className="cursor-pointer">
                              <Eye className="h-4 w-4 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs text-muted-foreground">Status</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(car.id, "available")}
                              disabled={car.status === "available" || updatingCar}
                              className="cursor-pointer">
                              Set Available
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(car.id, "unavailable")}
                              disabled={car.status === "unavailable" || updatingCar}
                              className="cursor-pointer">
                              Set Unavailable
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 cursor-pointer"
                              onClick={() => {
                                setCarToDelete(car);
                                setDeleteDialogOpen(true);
                              }}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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
                <CarIcon className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                No cars found
              </h3>
              <p className="text-muted-foreground text-sm mb-5 max-w-sm">
                {search
                  ? "No cars match your search criteria. Try a different query."
                  : "Your inventory is empty. Add your first car to get started."}
              </p>
              <Button
                onClick={() => router.push("/admin/cars/create")}
                className="bg-slate-900 hover:bg-slate-800">
                <Plus className="h-4 w-4 mr-1.5" /> Add Your First Car
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this car? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deletingCar}
              className="border-slate-200">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCar}
              disabled={deletingCar}>
              {deletingCar ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Car"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarList;
