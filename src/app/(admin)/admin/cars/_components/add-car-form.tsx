"use client";
import React, { useState, useCallback, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useDropzone, FileRejection } from "react-dropzone";
import { Camera, Loader2, Upload, X } from "lucide-react";
import { AddCar, processCarImageWithAI } from "@/actions/cars";
import useFetch from "@/hooks/use-fetch";
import { useRouter } from "next/navigation";

const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"];
const transmissions = ["Automatic", "Manual", "Semi-Automatic"];
const bodyTypes = [
  "SUV",
  "Sedan",
  "Hatchback",
  "Convertible",
  "Coupe",
  "Wagon",
  "Pickup",
];
const carStatuses = ["AVAILABLE", "UNAVAILABLE"];

const AddCarForm = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("manual");
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string>("");
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [uploadAiImage, setUploadAiImage] = useState<File | null>(null);

  const carFormSchema = z.object({
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.string().refine((val) => {
      const year = parseInt(val);
      return (
        !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1
      );
    }, "Valid year required"),
    price: z.string().min(1, "Price is required"),
    mileage: z.string().min(1, "Mileage is required"),
    color: z.string().min(1, "Color is required"),
    fuelType: z.string().min(1, "Fuel type is required"),
    transmission: z.string().min(1, "Transmission is required"),
    bodyType: z.string().min(1, "Body type is required"),
    seats: z.string().optional(),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    status: z.enum(["AVAILABLE", "UNAVAILABLE"]),
    featured: z.boolean().default(false),
  });

  const {
    register,
    setValue,
    getValues,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      make: "",
      model: "",
      year: "",
      price: "",
      mileage: "",
      color: "",
      fuelType: "",
      transmission: "",
      bodyType: "",
      seats: "",
      description: "",
      status: "AVAILABLE",
      featured: false,
    },
  });

  const {
    data: addCarResult,
    loading: addCarLoading,
    fn: addCarFn,
    error: addCarError,
  } = useFetch(AddCar);

  useEffect(() => {
    if (!addCarLoading && isSubmitting) {
      if (addCarError) {
        setIsSubmitting(false);
      } else {
        toast.success("Car added successfully!");
        setImagePreview([]);
        setImageFiles([]);
        setValue("make", "");
        setValue("model", "");
        setValue("year", "");
        setValue("price", "");
        setValue("mileage", "");
        setValue("color", "");
        setValue("fuelType", "");
        setValue("transmission", "");
        setValue("bodyType", "");
        setValue("seats", "");
        setValue("description", "");
        setValue("status", "AVAILABLE");
        setValue("featured", false);
        setIsSubmitting(false);
      }
    }
  }, [addCarLoading, addCarError, isSubmitting, setValue]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (imageFiles.length === 0) {
      setImageError("Please upload at least one image");
      return;
    }

    setImageError("");
    setIsSubmitting(true);

    try {
      const carData = {
        make: data.make,
        model: data.model,
        year: parseInt(data.year),
        price: parseFloat(data.price),
        mileage: parseFloat(data.mileage),
        color: data.color,
        fuelType: data.fuelType,
        transmission: data.transmission,
        bodyType: data.bodyType,
        seats: data.seats ? parseInt(data.seats) : 5,
        description: data.description,
        status: data.status.toLowerCase(),
        featured: data.featured,
      };

      const imageData = await Promise.all(
        imageFiles.map(async (file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
          data: await fileToBase64(file),
        }))
      );

      await addCarFn({
        carData,
        images: imageData,
      });
    } catch (error) {
      console.error("Error preparing form data:", error);
      toast.error("Failed to prepare form data");
      setIsSubmitting(false);
    }
  };

  const onMultiImagesDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        fileRejections.forEach(({ file, errors }) => {
          errors.forEach((error) => {
            if (error.code === "file-too-large") {
              toast.error(`${file.name} is larger than 5MB`);
            } else if (error.code === "file-invalid-type") {
              toast.error(`${file.name} is not a valid image type`);
            } else {
              toast.error(`${file.name}: ${error.message}`);
            }
          });
        });
      }

      const validFiles = acceptedFiles.filter((file) => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is larger than 5MB and was not added.`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      setIsUploading(true);
      setImageError("");

      let processedCount = 0;
      const results: Array<{ preview: string; file: File }> = [];

      validFiles.forEach((file, index) => {
        const reader = new FileReader();

        reader.onloadend = () => {
          results[index] = {
            preview: reader.result as string,
            file: file,
          };
          processedCount++;

          if (processedCount === validFiles.length) {
            const successfulResults = results.filter((r) => r !== undefined);
            if (successfulResults.length > 0) {
              setImagePreview((prev) => [
                ...prev,
                ...successfulResults.map((r) => r.preview),
              ]);
              setImageFiles((prev) => [
                ...prev,
                ...successfulResults.map((r) => r.file),
              ]);
              toast.success(
                `${successfulResults.length} image(s) added successfully`
              );
            }
            setIsUploading(false);
          }
        };

        reader.onerror = () => {
          processedCount++;
          toast.error(`Failed to read ${file.name}`);
          if (processedCount === validFiles.length) {
            const successfulResults = results.filter((r) => r !== undefined);
            if (successfulResults.length > 0) {
              setImagePreview((prev) => [
                ...prev,
                ...successfulResults.map((r) => r.preview),
              ]);
              setImageFiles((prev) => [
                ...prev,
                ...successfulResults.map((r) => r.file),
              ]);
            }
            setIsUploading(false);
          }
        };

        reader.readAsDataURL(file);
      });
    },
    []
  );

  const onAiDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadAiImage(file);

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target && typeof e.target.result === "string") {
        setAiImage(e.target.result);
        toast.success("AI image uploaded successfully");
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps: getAiRootProps, getInputProps: getAiInputProps } =
    useDropzone({
      onDrop: onAiDrop,
      accept: {
        "image/*": [".jpeg", ".jpg", ".png", ".webp"],
      },
      maxFiles: 1,
      multiple: false,
    });

  const {
    loading: processImageLoading,
    fn: processImageFn,
    data: processImageResult,
    error: processImageError,
  } = useFetch(processCarImageWithAI);

  const processWithAI = async () => {
    if (!uploadAiImage) {
      toast.error("Please upload an image first");
      return;
    }
    await processImageFn(uploadAiImage);
  };

  useEffect(() => {
    if (processImageError) {
      toast.error(processImageError.message || "Failed to upload car");
    }
  }, [processImageError]);

  useEffect(() => {
    if (processImageResult?.success) {
      const carDetails = processImageResult.data;
      setValue("make", carDetails.make);
      setValue("model", carDetails.model);
      setValue("year", carDetails.year.toString());
      setValue("color", carDetails.color);
      setValue("bodyType", carDetails.bodyType);
      setValue("fuelType", carDetails.fuelType);
      setValue("price", carDetails.price);
      setValue("mileage", carDetails.mileage);
      setValue("transmission", carDetails.transmission);
      setValue("description", carDetails.description);

      if (uploadAiImage) {
        const reader = new FileReader();

        reader.onload = () => {
          if (reader.result) {
            setImagePreview((prev) => [...prev, reader.result as string]);
            setImageFiles((prev) => [...prev, uploadAiImage]);
            setIsUploading(false);
          }
        };

        reader.readAsDataURL(uploadAiImage);

        toast.success("Successfully extracted car details", {
          description: `Detected ${carDetails.year} ${carDetails.make} ${
            carDetails.model
          } with ${Math.round(carDetails.confidence * 100)}% confidence`,
        });

        setActiveTab("manual");
      }
    }
  }, [processImageResult, uploadAiImage]);

  const removeImage = (index: number) => {
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const {
    getRootProps: getMultiImageRootProps,
    getInputProps: getMultiImageInputProps,
    isDragActive,
    isDragReject,
  } = useDropzone({
    onDrop: onMultiImagesDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: true,
  });

  useEffect(() => {
    if (addCarResult?.success) {
      toast.success("Car added successfully");
      router.push("/admin/cars");
    }
  }, [addCarResult, addCarLoading]);

  return (
    <div className="w-full overflow-x-hidden">
      <Tabs
        defaultValue="manual"
        className="mt-6 w-full"
        value={activeTab}
        onValueChange={setActiveTab}>
        <TabsList className="!grid w-full grid-cols-2 min-w-0 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger
            value="manual"
            className="w-full text-xs sm:text-sm min-w-0 truncate rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Manual Entry
          </TabsTrigger>
          <TabsTrigger
            value="ai"
            className="w-full text-xs sm:text-sm min-w-0 truncate rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            AI Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-6 w-full overflow-visible">
          <Card className="w-full border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-slate-900">Car Details</CardTitle>
              <CardDescription>
                Enter the details of the car you want to add
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* make */}
                  <div className="space-y-2">
                    <Label htmlFor="make" className="text-slate-700 font-medium">Make</Label>
                    <Input
                      id="make"
                      {...register("make")}
                      placeholder="e.g Toyota"
                      className={`h-10 border-slate-200 ${errors.make ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                    />
                    {errors.make && (
                      <p className="text-xs text-red-500">{errors.make.message}</p>
                    )}
                  </div>

                  {/* model */}
                  <div className="space-y-2">
                    <Label htmlFor="model" className="text-slate-700 font-medium">Model</Label>
                    <Input
                      id="model"
                      {...register("model")}
                      placeholder="e.g. Camry"
                      className={`h-10 border-slate-200 ${errors.model ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                    />
                    {errors.model && (
                      <p className="text-xs text-red-500">{errors.model.message}</p>
                    )}
                  </div>

                  {/* year */}
                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-slate-700 font-medium">Year</Label>
                    <Input
                      id="year"
                      {...register("year")}
                      placeholder="e.g. 2022"
                      className={`h-10 border-slate-200 ${errors.year ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                    />
                    {errors.year && (
                      <p className="text-xs text-red-500">{errors.year.message}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-slate-700 font-medium">Price (₹)</Label>
                    <Input
                      id="price"
                      {...register("price")}
                      placeholder="e.g. 2500"
                      className={`h-10 border-slate-200 ${errors.price ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                    />
                    {errors.price && (
                      <p className="text-xs text-red-500">{errors.price.message}</p>
                    )}
                  </div>

                  {/* Mileage */}
                  <div className="space-y-2">
                    <Label htmlFor="mileage" className="text-slate-700 font-medium">Mileage</Label>
                    <Input
                      id="mileage"
                      {...register("mileage")}
                      placeholder="e.g. 15000"
                      className={`h-10 border-slate-200 ${errors.mileage ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                    />
                    {errors.mileage && (
                      <p className="text-xs text-red-500">{errors.mileage.message}</p>
                    )}
                  </div>

                  {/* Color */}
                  <div className="space-y-2">
                    <Label htmlFor="color" className="text-slate-700 font-medium">Color</Label>
                    <Input
                      id="color"
                      {...register("color")}
                      placeholder="e.g. Blue"
                      className={`h-10 border-slate-200 ${errors.color ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                    />
                    {errors.color && (
                      <p className="text-xs text-red-500">{errors.color.message}</p>
                    )}
                  </div>

                  {/* Fuel type */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Fuel Type</Label>
                    <Select
                      value={watch("fuelType")}
                      onValueChange={(value) => setValue("fuelType", value)}>
                      <SelectTrigger
                        className={`h-10 border-slate-200 ${errors.fuelType ? "border-red-400" : ""}`}>
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.fuelType && (
                      <p className="text-xs text-red-500">{errors.fuelType.message}</p>
                    )}
                  </div>

                  {/* Transmission */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Transmission</Label>
                    <Select
                      onValueChange={(value) => setValue("transmission", value)}
                      defaultValue={getValues("transmission")}>
                      <SelectTrigger
                        className={`h-10 border-slate-200 ${errors.transmission ? "border-red-400" : ""}`}>
                        <SelectValue placeholder="Select transmission" />
                      </SelectTrigger>
                      <SelectContent>
                        {transmissions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.transmission && (
                      <p className="text-xs text-red-500">{errors.transmission.message}</p>
                    )}
                  </div>

                  {/* Body Type */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Body Type</Label>
                    <Select
                      onValueChange={(value) => setValue("bodyType", value)}
                      defaultValue={getValues("bodyType")}>
                      <SelectTrigger
                        className={`h-10 border-slate-200 ${errors.bodyType ? "border-red-400" : ""}`}>
                        <SelectValue placeholder="Select body type" />
                      </SelectTrigger>
                      <SelectContent>
                        {bodyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.bodyType && (
                      <p className="text-xs text-red-500">{errors.bodyType.message}</p>
                    )}
                  </div>

                  {/* Seats */}
                  <div className="space-y-2">
                    <Label htmlFor="seats" className="text-slate-700 font-medium">
                      Number of Seats{" "}
                      <span className="text-sm text-slate-400 font-normal">(Optional)</span>
                    </Label>
                    <Input
                      id="seats"
                      {...register("seats")}
                      placeholder="e.g. 5"
                      className="h-10 border-slate-200"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Status</Label>
                    <Select
                      onValueChange={(value) =>
                        setValue("status", value as "AVAILABLE" | "UNAVAILABLE")
                      }
                      defaultValue={getValues("status")}>
                      <SelectTrigger className="h-10 border-slate-200">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {carStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-700 font-medium">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Enter detailed description of the car..."
                    className={`min-h-28 border-slate-200 ${
                      errors.description ? "border-red-400 focus-visible:ring-red-400" : ""
                    }`}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500">{errors.description.message}</p>
                  )}
                </div>

                {/* Featured */}
                <div className="flex items-start space-x-3 space-y-0 rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                  <Checkbox
                    id="featured"
                    checked={watch("featured")}
                    onCheckedChange={(checked) => {
                      setValue("featured", checked === true);
                    }}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="featured" className="text-slate-700 font-medium">Feature this car</Label>
                    <p className="text-sm text-muted-foreground">
                      Featured cars appear on the homepage
                    </p>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <Label
                    htmlFor="images"
                    className={`text-slate-700 font-medium ${imageError ? "text-red-500" : ""}`}>
                    Images
                    {imageError && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <div
                    {...getMultiImageRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50 transition-all mt-2 ${
                      imageError ? "border-red-400 bg-red-50/50" : "border-slate-200 hover:border-slate-300"
                    } ${isDragActive ? "border-blue-400 bg-blue-50/50" : ""}`}>
                    <input {...getMultiImageInputProps()} />
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                        <Upload className="h-6 w-6 text-slate-400" />
                      </div>
                      {isUploading ? (
                        <p className="text-muted-foreground mb-1 text-sm">
                          Processing images...
                        </p>
                      ) : (
                        <>
                          <p className="text-muted-foreground mb-1 text-sm">
                            Drag & drop car images or click to select
                          </p>
                          {isDragReject && (
                            <p className="text-red-500 mb-2 text-sm">
                              Invalid image type
                            </p>
                          )}
                          <p className="text-slate-400 text-xs">
                            Supports: JPG, PNG, WEBP (max 5MB per image)
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  {imageError && (
                    <p className="text-xs text-red-500 mt-1.5">{imageError}</p>
                  )}

                  {imagePreview.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {imagePreview.map((preview, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-slate-900/80 text-white rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hover:bg-red-600">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4 pb-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || isUploading || addCarLoading}
                    className="bg-slate-900 hover:bg-slate-800 shadow-sm px-6">
                    {isSubmitting || addCarLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding Car...
                      </>
                    ) : (
                      "Add Car"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-6 w-full overflow-visible">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-slate-900">AI-Powered Car Details Extraction</CardTitle>
              <CardDescription>
                Upload an image of a car and let AI extract its details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-slate-300 transition-colors">
                  {aiImage ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={aiImage}
                        alt="AI Preview"
                        className="max-h-56 max-w-full object-contain mb-4 rounded-lg"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setAiImage(null);
                            setUploadAiImage(null);
                          }}>
                          Remove Image
                        </Button>
                        <Button
                          size="sm"
                          onClick={processWithAI}
                          disabled={processImageLoading}
                          className="bg-slate-900 hover:bg-slate-800">
                          {processImageLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Camera className="mr-2 h-4 w-4" />
                              Extract Details
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      {...getAiRootProps()}
                      className="cursor-pointer hover:bg-slate-50 transition-colors rounded-lg p-4">
                      <input {...getAiInputProps()} />
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                          <Camera className="h-7 w-7 text-slate-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          Drag & drop or click to upload a car image
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          JPG, PNG, WebP, max 5MB
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h3 className="font-medium text-slate-900 mb-2.5 text-sm">How it works</h3>
                  <ol className="space-y-2 text-sm text-muted-foreground list-decimal pl-4">
                    <li>Upload a clear image of the car</li>
                    <li>Click &quot;Extract Details&quot; to analyze with Gemini AI</li>
                    <li>Review the extracted information</li>
                    <li>Fill in any missing details manually</li>
                    <li>Add the car to your inventory</li>
                  </ol>
                </div>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <h3 className="font-medium text-amber-800 mb-1.5 text-sm">
                    Tips for best results
                  </h3>
                  <ul className="space-y-1.5 text-sm text-amber-700">
                    <li>• Use clear, well-lit images</li>
                    <li>• Try to capture the entire vehicle</li>
                    <li>• For difficult models, use multiple views</li>
                    <li>• Always verify AI-extracted information</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AddCarForm;
