import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs-extra";

const UPLOAD_DIR = "./uploads";
fs.ensureDirSync(UPLOAD_DIR);

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 }, // 100 KiB
  fileFilter: (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) => {
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, JPEG, PNG allowed."));
    }
  },
}).single("file");

export function generateFileUri(email: string, originalName: string): string {
  const ext = path.extname(originalName);
  const safeName = `${email}/${uuidv4()}${ext}`;
  return safeName;
}

export async function saveFile(buffer: Buffer, uri: string): Promise<void> {
  const filePath = path.join(UPLOAD_DIR, uri);
  const dir = path.dirname(filePath);
  await fs.ensureDir(dir);
  await fs.writeFile(filePath, buffer);
}
