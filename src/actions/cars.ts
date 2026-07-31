"use server";
import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import { serializeCarData } from "@/lib/helpers";
import { imagekit } from "@/lib/image";
import Car from "@/model/carModels";
import User from "@/model/userModel";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

async function fileToBase64(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString("base64");
}
export async function processCarImageWithAI(file: File) {
  try {
    //check api key
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing Gemini API Key");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "models/gemini-1.5-pro-vision-latest",
    });
    const base64Image = await fileToBase64(file);
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: file.type,
      },
    };
    const prompt = `
    Analyze this car image and extract the following information:
    1.Make (manufacturer)
    2.Model
    3.Year(approximately)
    4.Color
5.Body type ( sedan, SUV, coupe, hatchback, etc.)
    6.Fuel type (your best guess)
    7.Transmission type (automatic or manual)
    8.Price (your best guess)
    9.Short Description as to be added to a car listing 
    10.Mileage
    
    format the response as a JSON object with keys:
   { 
    "make":"",
    "model":"",
    "year":0000,
    "color":"",
    "bodyType":"",
    "price":"",
    "mileage":""
    "fuelType":"",
    "transmission":"",
    "description":""
    "confidence":0.0
    }
    For confidence ,provide a value between 0 and 1 representing how confident you are in your overall identification.
    Only respond with the JSON object , nothing else.
    
    `;

    const result = await model.generateContent([imagePart, prompt]);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const cardetails = JSON.parse(cleanedText);

      const requiredfields = [
        "make",
        "model",
        "year",
        "color",
        "bodyType",
        "price",
        "mileage",
        "fuelType",
        "transmission",
        "description",
        "confidence",
      ];
      const missingFields = requiredfields.filter(
        (field) => !(field in cardetails),
      );
      if (missingFields.length > 0) {
        throw new Error(
          `AI response missing required fields: ${missingFields.join(", ")}`,
        );
      }
      return {
        success: true,
        data: cardetails,
      };
    } catch {
      return {
        success: false,
        error: "Failed to parse AI response",
      };
    }
  } catch (error) {
    throw new Error(
      "Gemini API error:" +
        (error instanceof Error ? error.message : String(error)),
    );
  }
}

interface ImageData {
  name: string;
  type: string;
  size: number;
  data: string; // base64 string
}

interface AddCarParams {
  carData: Record<string, unknown>;
  images: ImageData | ImageData[];
}

const addCarSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.union([z.string(), z.number()]).refine((val) => {
    const year = Number(val);
    return !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1;
  }, "Valid year required"),
  price: z.union([z.string(), z.number()]).refine((val) => {
    const price = Number(val);
    return !isNaN(price) && price > 0;
  }, "Valid price required"),
  mileage: z.union([z.string(), z.number()]).refine((val) => {
    const mileage = Number(val);
    return !isNaN(mileage) && mileage >= 0;
  }, "Valid mileage required"),
  color: z.string().min(1, "Color is required"),
  fuelType: z.string().min(1, "Fuel type is required"),
  transmission: z.string().min(1, "Transmission is required"),
  bodyType: z.string().min(1, "Body type is required"),
  seats: z.union([z.string(), z.number()]).optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: z.enum(["available", "unavailable"]).optional(),
  featured: z.boolean().optional(),
});

export async function AddCar({ carData, images }: AddCarParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized: No session found");

    await connectDb();
    const user = await User.findById(session.user.id);
    if (!user) throw new Error("User not found");

    if (user.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    const carResult = addCarSchema.safeParse(carData);
    if (!carResult.success) {
      const firstError = carResult.error.issues[0].message;
      throw new Error(firstError);
    }

    const carId = uuidv4();
    const folderPath = `cars/${carId}`;

    const imagesData: { url: string; fileId: string }[] = [];
    const imageArray = Array.isArray(images) ? images : [images];

    for (let i = 0; i < imageArray.length; i++) {
      const imageData = imageArray[i];

      const mimeMatch = imageData.type?.match(/image\/(.+)/);
      const fileExtension = mimeMatch ? mimeMatch[1] : "jpeg";
      const fileName = `image-${Date.now()}-${i}.${fileExtension}`;

      const uploadResponse = await imagekit.upload({
        file: imageData.data, // base64 string
        fileName,
        folder: folderPath,
      });

      if (!uploadResponse?.url || !uploadResponse?.fileId) {
        throw new Error("Image upload failed");
      }

      imagesData.push({
        url: uploadResponse.url,
        fileId: uploadResponse.fileId,
      });
    }

    if (imagesData.length === 0) {
      throw new Error("No images uploaded");
    }

    const car = await Car.create({
      name: `${carData.make} ${carData.model}`,
      brand: carData.make,
      model: carData.model,
      year: Number(carData.year),
      color: carData.color,
      description: carData.description,
      mileage: carData.mileage,
      bodyType: carData.bodyType,

      type: String(carData.bodyType ?? "").toLowerCase().includes("suv")
        ? "suv"
        : String(carData.bodyType ?? "").toLowerCase().includes("sedan")
          ? "sedan"
          : String(carData.bodyType ?? "").toLowerCase().includes("hatch")
            ? "hatchback"
            : "luxury",

      transmission: String(carData.transmission).toLowerCase(),
      fuelType: String(carData.fuelType).toLowerCase(),

      seats: Number(carData.seats ?? 5),
      price: Number(carData.price),

      status: "available",
      image: imagesData,
      createdBy: user._id,
    });

    revalidatePath("/admin/cars");

    return {
      success: true,
      car: {
        id: car._id.toString(),
        name: car.name,
        price: car.price,
        image: car.image,
        year: car.year,
        status: car.status,
        featured: car.featured,
        bodyType: car.bodyType,
        description: car.description,
      },
    };
  } catch (error) {
    console.error("AddCar Error:", error);
    throw error;
  }
}

export async function getCars(search = "") {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized: No session found");
    // 2️⃣ DB + user
    await connectDb();
    const user = await User.findById(session.user.id);
    if (!user) throw new Error("User not found");

    if (user.role !== "admin") {
      throw new Error("Unauthorized: Only admins can access this");
    }

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { brand: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
        { color: { $regex: search, $options: "i" } },
      ];
    }

    const cars = await Car.find(filter).sort({ createdAt: -1 }).lean();

    const serializedCars = cars.map((car) => serializeCarData(car));

    return {
      success: true,
      data: serializedCars,
    };
  } catch (error) {
    console.error("Error fetching cars:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}


export async function deleteCar(id: string) {
  try {
    if (!id) throw new Error("Car ID is required");

    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized: No session found");

    await connectDb();

    const user = await User.findById(session.user.id);
    if (!user) throw new Error("User not found");

    if (user.role !== "admin") {
      throw new Error("Unauthorized: Only admins can delete cars");
    }

    const car = await Car.findById(id);
    if (!car) throw new Error("Car not found");

    // 🔥 Delete images from ImageKit
    if (Array.isArray(car.image) && car.image.length > 0) {
      await Promise.all(
        car.image.map(async (img: { url: string; fileId: string }) => {
          if (img?.fileId) {
            try {
              await imagekit.deleteFile(img.fileId);
            } catch (err) {
              console.error("ImageKit delete error:", err);
            }
          }
        }),
      );
    }

    await Car.findByIdAndDelete(id);

    revalidatePath("/admin/cars");

    return {
      success: true,
      message: "Car deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting car:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export const updateCarStatus = async (carId: string, status: string) => {
  try {
    const normalizedStatus = status.toLowerCase();
    const validStatuses = ["available", "unavailable", "booked", "maintenance"];
    if (!validStatuses.includes(normalizedStatus)) {
      return { success: false, error: "Invalid status value" };
    }

    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized: No session found");

    await connectDb();
    const user = await User.findById(session.user.id);
    if (!user) throw new Error("User not found");

    if (user.role !== "admin") {
      throw new Error("Unauthorized: Only admins can update car status");
    }

    const car = await Car.findByIdAndUpdate(
      carId,
      { status: normalizedStatus },
      { new: true }
    );

    if (!car) {
      return { success: false, error: "Car not found" };
    }

    return { success: true, car: serializeCarData(car) };
  } catch {
    return { success: false, error: "Failed to update status" };
  }
};

export async function getThreeCars() {
  try {
    await connectDb();

    const cars = await Car.find().sort({ createdAt: -1 }).limit(3).lean();

    return cars.map((car) => serializeCarData(car));
  } catch (error) {
    console.error("Error fetching featured cars:", error);
  }
}

export async function AllCars() {
  try {
    await connectDb();

    const cars = await Car.find().sort({ createdAt: -1 }).lean();

    return cars.map((car) => serializeCarData(car));
  } catch (error) {
    console.error("Error fetching featured cars:", error);
  }
}

export async function getCarById(carId: string) {
  try {
    await connectDb();

    if (!carId) {
      return {
        success: false,
        error: "Car ID is required",
      };
    }

    const car = await Car.findById(carId).lean();

    if (!car) {
      return {
        success: false,
        error: "Car not found",
      };
    }

    const safeCar = serializeCarData(car);

    return {
      success: true,
      data: safeCar,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
