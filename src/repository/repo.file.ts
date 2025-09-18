import { fileCollection } from "./provider.db.ts";
import { FileMetadata } from "./model.file.js";

export class FileRepository {
  private collection;

  constructor() {
    this.collection = fileCollection;
  }

  async insert(file: FileMetadata): Promise<FileMetadata | null> {
    return new Promise((resolve, reject) => {
      this.collection.insert(file, (err, newDoc) => {
          if (err) return reject(err);
          resolve(newDoc);
        });
    });
  }

  async get(file: FileMetadata): Promise<FileMetadata | null> {
    return new Promise((resolve, reject) => {
      const orQuery: any[] = [];
      if (file.fileId) orQuery.push({ fileId: file.fileId });
      if (file.fileUri) orQuery.push({ fileUri: file.fileUri });
      if (file.fileThumbnailUri) orQuery.push({ fileThumbnailUri : file.fileThumbnailUri });

      if (orQuery.length === 0) return resolve(null);

      this.collection.findOne<User>({ $or: orQuery }, (err, doc) => {
        if (err) return reject(err);
        resolve(doc ?? null);
      });
    });
  }
}

export const fileRepository = new FileRepository();
