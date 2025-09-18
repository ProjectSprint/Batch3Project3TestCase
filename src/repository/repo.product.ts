import { randomUUID } from "crypto";
import { Product } from "../entity/product.entity.js";

export class ProductRepository {
	constructor(private readonly repo: PouchDB.Database<Product>) {}

	async insertByPhone(userId: string, p: Product): Promise<Product | null> {
		try {
			const findRes = await this.repo.find({
				selector: { sku: p.sku },
			});
			if (findRes.docs.length) return null;

			await this.repo.put({
				...p,
				userId,
			});
			return p;
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

	async updateEmail(userId: string, email: string): Promise<User | null> {
		try {
			const res = await this.repo.get(userId);
			const updatePayload = {
				...res,
				_id: res._id,
				email,
			};
			await this.repo.put(updatePayload);

			return updatePayload as User;
		} catch {
			return null;
		}
	}

	async updatePhone(userId: string, phone: string): Promise<User | null> {
		try {
			const res = await this.repo.get(userId);
			const updatePayload = {
				...res,
				_id: res._id,
				phone,
			};
			await this.repo.put(updatePayload);

			return updatePayload as User;
		} catch {
			return null;
		}
	}
}
