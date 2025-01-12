import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const uploadToCloudinary = async (file: Express.Multer.File) => {
  try {
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'easyshop/shops',
        },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      );

      uploadStream.end(file.buffer);
    });

    return result;
  } catch (error) {
    throw new Error('Error uploading file to Cloudinary');
  }
};

export const deleteFromCloudinary = async (url: string) => {
  try {
    const publicId = url.split('/').slice(-1)[0].split('.')[0];
    await cloudinary.uploader.destroy(`easyshop/shops/${publicId}`);
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
  }
};
