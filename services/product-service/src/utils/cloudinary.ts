import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const uploadToCloudinary = async (file: Express.Multer.File) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'easyshop',
      resource_type: 'auto',
    });
    return result;
  } catch (error) {
    throw new Error('Error uploading to Cloudinary');
  }
};

export const deleteFromCloudinary = async (url: string) => {
  try {
    const publicId = url.split('/').slice(-1)[0].split('.')[0];
    await cloudinary.uploader.destroy(`easyshop/${publicId}`);
  } catch (error) {
    throw new Error('Error deleting from Cloudinary');
  }
};
