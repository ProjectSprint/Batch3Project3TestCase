import { ProductTypeValue } from "../const/product_type.const.js";

export type Product = {
	_id: string; // should be the same value as productId
	productId: string;
	name: string;
	category: ProductTypeValue;
	qty: number;
	price: number;
	sku: string;
	fileId: string;
	fileUri: string;
	fileThumbnailUri: string;
	createdBy: string;
	createdAt: Date;
	updatedAt: Date;
};
