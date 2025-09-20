import { randomUUID } from "crypto";
import { Purchase } from "../entity/purchase.entity.js";

export class PurchaseRepository {
	constructor(private readonly repo: PouchDB.Database<Purchase>) {}

	async get(purchaseId: string): Promise<Purchase | null> {
		try {
			const res = await this.repo.get(purchaseId);
			return res as Purchase;
		} catch {
			return null;
		}
	}

	async insert(
		purchase: Omit<Purchase, "_id" | "purchaseId" | "createdAt">,
	): Promise<Purchase | null> {
		try {
			const purchaseId = randomUUID();
			const now = new Date();
			const payload: Purchase = {
				...purchase,
				_id: purchaseId,
				purchaseId,
				createdAt: now,
			};
			await this.repo.put(payload);
			return payload;
		} catch {
			return null;
		}
	}

	async update(purchase: Purchase): Promise<Purchase | null> {
		try {
			await this.repo.put(purchase);
			return purchase;
		} catch {
			return null;
		}
	}
}
