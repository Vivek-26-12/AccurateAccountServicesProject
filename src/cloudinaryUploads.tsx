import axios from 'axios';

const CLOUDINARY_CLOUD_NAME = "dakkqbr4g";
const CLOUDINARY_UPLOAD_PRESET = "demo-upload";

export const uploadThumbnailToCloudinary = async (thumbnailFile: File): Promise<string> => {
  if (!thumbnailFile) throw new Error("No image file provided");

  const formData = new FormData();
  formData.append("file", thumbnailFile);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    formData
  );

  return response.data.secure_url;
};

export const uploadPDFToCloudinary = async (pdfFile: File): Promise<string> => {
  if (!pdfFile) throw new Error("No PDF file provided");

  const formData = new FormData();
  formData.append("file", pdfFile);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("resource_type", "raw");

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
    formData
  );
  // console.log("Uploaded Cloudinary URL (PDF):", response.data.secure_url); // ✅

  return response.data.secure_url;
};
