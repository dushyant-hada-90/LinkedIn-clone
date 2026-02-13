import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs/promises';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
      api_key: process.env.CLOUDINARY_API_KEY || 'demo',
      api_secret: process.env.CLOUDINARY_API_SECRET || 'demo',
    });
  }

  async upload(localPath: string) {
    if (!localPath) return null;
    try {
      const result = await cloudinary.uploader.upload(localPath);
      await fs.unlink(localPath);
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      await fs.unlink(localPath).catch(() => undefined);
      throw error;
    }
  }

  async delete(publicId?: string) {
    if (!publicId) return null;
    try {
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      return null;
    }
  }
}
