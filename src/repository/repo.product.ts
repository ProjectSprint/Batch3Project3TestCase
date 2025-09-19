import { randomUUID } from "crypto";
import { Product } from "../entity/product.entity.js";

export class ProductRepository {
	constructor(private readonly repo: PouchDB.Database<Product>) {}

	async getById(productId: string): Promise<Product | null> {
		try {
			const res = await this.repo.get(productId);
			return res as Product;
		} catch {
			return null;
		}
	}

	async insert(
		product: Omit<Product, "_id" | "productId" | "createdAt" | "updatedAt">,
	): Promise<Product | null> {
		try {
			// Check SKU uniqueness
			const findRes = await this.repo.find({
				selector: { sku: product.sku },
			});
			if (findRes.docs.length) return null; // SKU conflict

			const now = new Date();
			const productId = randomUUID();
			const payload: Product = {
				...product,
				_id: productId,
				productId,
				createdAt: now,
				updatedAt: now,
			};
			await this.repo.put(payload);
			return payload;
		} catch {
			return null;
		}
	}

	async update(
		productId: string,
		product: Omit<Product, "_id" | "productId" | "createdAt" | "updatedAt">,
	): Promise<Product | null> {
		try {
			const existing = await this.repo.get(productId);

			// Check SKU uniqueness (ignore current product)
			const findRes = await this.repo.find({
				selector: { sku: product.sku },
			});
			if (
				findRes.docs.length &&
				findRes.docs[0] &&
				findRes.docs[0]._id !== productId
			) {
				return null; // SKU conflict
			}

			const now = new Date();
			const updatePayload: Product = {
				...existing,
				...product,
				_id: existing._id,
				productId: existing.productId,
				createdAt: existing.createdAt,
				updatedAt: now,
			};
			await this.repo.put(updatePayload);
			return updatePayload;
		} catch {
			return null;
		}
	}

	async delete(productId: string): Promise<boolean> {
		try {
			const res = await this.repo.get(productId);
			await this.repo.remove(res);
			return true;
		} catch {
			return false;
		}
	}

	async findAll({
		limit,
		offset,
		productId,
		sku,
		category,
		sortBy,
	}: {
		limit?: number | undefined;
		offset?: number | undefined;
		productId?: string | undefined;
		sku?: string | undefined;
		category?: string | undefined;
		sortBy?: "newest" | "oldest" | "cheapest" | "expensive" | undefined;
	}): Promise<Product[]> {
		try {
			const selector: any = {};
			if (productId) selector.productId = productId;
			if (sku) selector.sku = sku;
			if (category) selector.category = category;

			const sort: any[] = [];
			if (sortBy === "newest")
				sort.push({ updatedAt: "desc" }, { createdAt: "desc" });
			else if (sortBy === "oldest")
				sort.push({ updatedAt: "asc" }, { createdAt: "asc" });
			else if (sortBy === "cheapest") sort.push({ price: "asc" });
			else if (sortBy === "expensive") sort.push({ price: "desc" });

			const res = await this.repo.find({
				selector,
				limit: typeof limit === "number" ? limit : 5,
				skip: typeof offset === "number" ? offset : 0,
				sort: sort.length ? sort : undefined,
			});

			return res.docs as Product[];
		} catch {
			return [];
		}
	}
}
