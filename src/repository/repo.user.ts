import { randomUUID } from "crypto";
import { User, UserCredential } from "../entity/user.entity.js";
import { File } from "../entity/file.entity.js";

export class UserRepository {
	constructor(private readonly repo: PouchDB.Database<User>) {}

	async get(userId: string): Promise<User | null> {
		try {
			const res = await this.repo.get(userId);
			return res as User;
		} catch {
			return null;
		}
	}

	async insertByPhone(
		phone: string,
		password: string,
	): Promise<UserCredential | null> {
		try {
			const findRes = await this.repo.find({
				selector: { phone },
			});
			if (findRes.docs.length) return null;

			const res = await this.repo.put({
				_id: randomUUID(),
				email: "",
				phone,
				password,
				bankAccountHolder: "",
				bankAccountName: "",
				bankAccountNumber: "",
				fileId: "",
				fileThumbnailUri: "",
				fileUri: "",
			});
			return {
				_id: res.id,
				phone,
				password,
				email: "",
			};
		} catch {
			return null;
		}
	}
	async insertByEmail(
		email: string,
		password: string,
	): Promise<UserCredential | null> {
		try {
			const findRes = await this.repo.find({
				selector: { email },
			});
			if (findRes.docs.length) return null;

			const res = await this.repo.put({
				_id: randomUUID(),
				email,
				password,
				phone: "",
				bankAccountHolder: "",
				bankAccountName: "",
				bankAccountNumber: "",
				fileId: "",
				fileThumbnailUri: "",
				fileUri: "",
			});
			return {
				_id: res.id,
				phone: "",
				password,
				email,
			};
		} catch {
			return null;
		}
	}

	async getByPhone(phone: string): Promise<User | null> {
		try {
			const res = await this.repo.find({
				selector: { phone },
			});
			return res.docs[0] as User;
		} catch {
			return null;
		}
	}

	async getByEmail(email: string): Promise<User | null> {
		try {
			const res = await this.repo.find({
				selector: { email },
			});
			return res.docs[0] as User;
		} catch {
			return null;
		}
	}

	async updateEmail(user: User, email: string): Promise<User | null> {
		try {
			const findRes = await this.repo.find({
				selector: { email },
			});
			if (findRes.docs.length) return null;

			const updatePayload = {
				...user,
				email,
			};
			await this.repo.put(updatePayload);

			return updatePayload as User;
		} catch {
			return null;
		}
	}

	async updatePhone(user: User, phone: string): Promise<User | null> {
		try {
			const findRes = await this.repo.find({
				selector: { phone },
			});
			if (findRes.docs.length) return null;

			const updatePayload = {
				...user,
				phone,
			};
			await this.repo.put(updatePayload);

			return updatePayload as User;
		} catch {
			return null;
		}
	}

	async updateProfile(
		userId: string,
		file: File,
		bankAccountName: string,
		bankAccountHolder: string,
		bankAccountNumber: string,
	): Promise<User | null> {
		try {
			const res = await this.repo.get(userId);
			const updatePayload = {
				...res,
				_id: res._id,
				fileId: file.fileId,
				fileThumbnailUri: file.fileThumbnailUri,
				fileUri: file.fileUri,
				bankAccountName,
				bankAccountHolder,
				bankAccountNumber,
			};
			await this.repo.put(updatePayload);

			return updatePayload as User;
		} catch {
			return null;
		}
	}
}
