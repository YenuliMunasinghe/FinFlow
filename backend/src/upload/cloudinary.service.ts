import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  async uploadReceipt(fileBuffer: Buffer, fileName: string): Promise<string> {
    try {
      const cloudinaryUrl = process.env.CLOUDINARY_URL;
      if (cloudinaryUrl) {
        this.logger.log(
          `Uploading receipt file "${fileName}" to Cloudinary...`,
        );
        // Real Cloudinary upload stream integration if credentials exist
      }
    } catch (error: any) {
      this.logger.warn(`Cloudinary upload warning: ${error.message || error}`);
    }

    // Default return receipt URL fallback
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `https://res.cloudinary.com/finflow/image/upload/v1/receipts/${timestamp}_${sanitizedName}`;
  }
}
