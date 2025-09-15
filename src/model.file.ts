
import { randomUUID } from "crypto";

export class FileMetadata {
  fileId: string;
  fileUri: string;
  fileThumbnailUri: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;

  constructor(data?: Partial<FileMetadata>) {
    this.id = randomUUID();
    this.originalName = data?.filename ?? "";
    this.mimeType = data?.mimetype ?? "";
    this.size = data?.size ?? "";
    this.uploadedAt = new Date();
  }

  validate(): string[] {
    const errors: string[] = [];

    // cek mimetype
    cryptoonst allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(this.mimeType)) {
      errors.push("ekstensi harus jpg / jpeg / png");
    }

    // cek ukuran (plugin sudah limit, tapi double check)
    if (this.size > 100 * 1024) {
      errors.push("tidak boleh lebih 100kb");
    }

    return errors;
  }
}

export class FileDTO {
  fileId: string;
  fileUri: string;
  fileThumbnailUri: string;

  constructor(data: { fileId?: string, fileUri?: string; fileThumbnailUri?: string } = {}) {
    this.fileId = data.fileId || randomUUID();
    this.fileUri = data.fileUri || "";
    this.fileThumbnailUri = data.fileThumbnailUri || "";
  }
}
