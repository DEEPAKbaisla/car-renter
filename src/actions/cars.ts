"use server";
import authOptions from "@/lib/auth";
import connectDb from "@/lib/db";
import { extractSupabasePathFromUrl, serializeCarData } from "@/lib/helpers";
import { supabaseAdmin } from "@/lib/superbase";
import Car from "@/model/carModels";
import User from "@/model/userModel";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

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
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.log("Raw response:", text);
      return {
        success: false,
        error: "Failed to parse AI response",
      };
    }
  } catch (error) {
    console.error();
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
  carData: any;
  images: ImageData | ImageData[];
}

export async function AddCar({ carData, images }: AddCarParams) {
  try {
    // 1️⃣ Session check (NextAuth)
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized: No session found");

    // 2️⃣ DB + user
    await connectDb();
    const user = await User.findById(session.user.id);
    if (!user) throw new Error("User not found");

    // ✅ 3️⃣ ADMIN CHECK (THIS IS REQUIRED)
    if (user.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }

    // 4️⃣ Prepare car
    const carId = uuidv4();
    const folderPath = `cars/${carId}`;

    const imageUrls: string[] = [];
    const imageArray = Array.isArray(images) ? images : [images];

    // 5️⃣ Upload images
    for (let i = 0; i < imageArray.length; i++) {
      const imageData = imageArray[i];

      const imageBuffer = Uint8Array.from(
        Buffer.from(imageData.data, "base64"),
      );

      const mimeMatch = imageData.type?.match(/image\/(.+)/);
      const fileExtension = mimeMatch ? mimeMatch[1] : "jpeg";

      const fileName = `image-${Date.now()}-${i}.${fileExtension}`;
      const filePath = `${folderPath}/${fileName}`;

      // ✅ 6️⃣ UPLOAD USING SERVICE ROLE (NO RLS ISSUES)
      const { error } = await supabaseAdmin.storage
        .from("car-images")
        .upload(filePath, imageBuffer, {
          contentType: imageData.type || `image/${fileExtension}`,
          upsert: true,
        });

      if (error) {
        console.error("Error uploading image:", error);
        throw new Error(`Image upload failed: ${error.message}`);
      }

      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/car-images/${filePath}`;
      imageUrls.push(publicUrl);
    }

    if (imageUrls.length === 0) {
      throw new Error("No images uploaded");
    }

    // 7️⃣ Save car in MongoDB
    const car = await Car.create({
      name: `${carData.make} ${carData.model}`,
      brand: carData.make,
      model: carData.model,
      year: Number(carData.year),
      color: carData.color,
      description: carData.description,
      mileage: carData.mileage,
      bodyType: carData.bodyType,

      type: carData.bodyType?.toLowerCase().includes("suv")
        ? "suv"
        : carData.bodyType?.toLowerCase().includes("sedan")
          ? "sedan"
          : carData.bodyType?.toLowerCase().includes("hatch")
            ? "hatchback"
            : "luxury",

      transmission: carData.transmission.toLowerCase(),
      fuelType: carData.fuelType.toLowerCase(),

      seats: Number(carData.seats ?? 5),
      price: Number(carData.price),

      status: "available",
      image: imageUrls,
      createdBy: user._id,
    });
    console.log("Saved car object:", car.toObject());
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

    let filter: any = {};

    if (search) {
      filter.$or = [
        { make: { $regex: search, $options: "i" } },
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
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized: No session found");
    // 2️⃣ DB + user
    await connectDb();
    const user = await User.findById(session.user.id);
    if (!user) throw new Error("User not found");

    const car = await Car.findById(id);
    if (!car) throw new Error("Car not found");

    if (Array.isArray(car.image) && car.image.length > 0) {
      const paths = car.image
        .map((url: string) => extractSupabasePathFromUrl(url))
        .filter(Boolean);

      console.log("Deleting Supabase files:", paths);

      if (paths.length > 0) {
        const { error } = await supabaseAdmin.storage
          .from("car-images")
          .remove(paths);

        if (error) {
          console.error("Supabase delete error:", error);
          throw new Error("Failed to delete car images");
        }
      }
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

export async function updateCarStatus(
  id: string,
  { status, featured }: { status?: string; featured?: boolean },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized: No session found");
    // 2️⃣ DB + user
    await connectDb();
    const user = await User.findById(session.user.id);
    if (!user) throw new Error("User not found");

    const updateData = {};

    if (status !== undefined) {
      updateData.status = status;
    }

    if (featured !== undefined) {
      updateData.featured = featured;
    }

    // Update the car
    await Car.findByIdAndUpdate(id, updateData);

    // Revalidate the cars list page
    revalidatePath("/admin/cars");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating car status:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getThreeCars() {

  try {
    await connectDb();

  const cars = await Car.find()
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  return JSON.parse(JSON.stringify(cars));
  } catch (error) {
    console.error("Error fetching featured cars:", error);
  }
}

export async function AllCars(){
   try {
    await connectDb();

  const cars = await Car.find()
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(cars));
  } catch (error) {
    console.error("Error fetching featured cars:", error);
  }

}


/////isko dekhana h abhi ...

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

    // ✅ Convert ALL non-serializable fields
    const safeCar = {
      ...car,
      _id: car._id?.toString(),
      createdBy: car.createdBy?.toString(),
      createdAt: car.createdAt?.toISOString(),
      updatedAt: car.updatedAt?.toISOString(),
    };

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
