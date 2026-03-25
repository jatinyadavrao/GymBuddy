import cloudinary from "../config/cloudinary.js";

export const uploadImageBuffer = async (buffer, folder = "gymbuddy") => {
  const dataUri = `data:image/jpeg;base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image"
  });

  return result.secure_url;
};
