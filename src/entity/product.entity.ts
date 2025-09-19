import { ActivityTypeValue } from "../const/activity_type.const.js";

export type Product = {
	_id: string; // should be the same value as productId
	productId: string;
	name: string;
	category: ActivityTypeValue;
	qty: number;
	price: number;
	sku: string;
	fileId: string;
	fileUri: string;
	fileThumbnailUri: string;
	createdAt: Date;
	updatedAt: Date;
};
