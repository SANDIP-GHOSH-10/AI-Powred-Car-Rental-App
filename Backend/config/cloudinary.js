import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

export const ensureCloudinaryConfig = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
};


export const uploadToCloudinary = async (filePath, folder = "car-rental/cars") => {
  ensureCloudinaryConfig();
  return await cloudinary.uploader.upload(filePath, { folder });
};


export const deleteFromCloudinary = async (publicId) => {
  ensureCloudinaryConfig();
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    console.log(
      "Cloudinary delete result:",
      publicId,
      "→",
      result.result
    );

    return result;
  } catch (error) {
    console.error(
      "Error deleting from Cloudinary:",
      publicId,
      error
    );

    throw error;
  }
};

export default cloudinary;
