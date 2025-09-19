import { File } from "../entity/file.entity.js";

export class FileRepository {
	constructor(private readonly repo: PouchDB.Database<File>) {}

	async get(fileId: string): Promise<File | null> {
		try {
			const res = await this.repo.get(fileId);
			return res as File;
		} catch {
			return null;
		}
	}

	async insert(file: File): Promise<File | null> {
		try {
			await this.repo.put(file);
			return file;
		} catch {
			return null;
		}
	}
}
