export enum ContactType {
	phone = "phone",
	email = "email",
}

export enum ProductCategory {
	Food = "Food",
	Beverage = "Beverage",
	Clothes = "Clothes",
	Furniture = "Furniture",
	Tools = "Tools",
}

export type User = {
	fileId?: string;
	fileUri?: string;
	bankAccountName?: string;
	bankAccountHolder?: string;
	bankAccountNumber?: string;
	imageUri?: string;
	email: string;
	phone: string;
	password: string;
	token: string;
};

export type UploadedFile = {
	fileId: string;
	fileUri: string;
	fileThumbnailUri: string;
};

export type Profile = {
	email: string;
	phone: string;
	fileId: string;
	fileUri: string;
	fileThumbnailUri: string;
	bankAccontName: string;
	bankAccontHolder: string;
	bankAccontNumber: string;
};

export type UserLogin = {
	email: string;
	phone: string;
	password: string;
};

export type Product = {
	productId: string;
	name: string;
	category: ProductCategory;
	qty: number;
	price: number;
	sku: string;
	fileId: string;
	fileUri?: string;
	fileThumbnailUri?: string;
	createdAt?: string;
	updatedAt?: string;
};

export type PostProduct = {
	name: string;
	category: ProductCategory;
	qty: number;
	price: number;
	sku: string;
	fileId: string;
};

export type PurchaseRequest = {
	purchasedItems: Array<{
		productId: string;
		qty: number;
	}>;
	senderName: string | null;
	senderContactType: ContactType;
	senderContactDetail: string;
};

export type PurchaseResponse = {
	purchasedItems: Array<Product>;
	totalPrice: number;
	paymentDetails: Array<{
		bankAccountName: string;
		bankAccountHolder: string;
		bankAccountNumber: string;
		totalPrice: number;
	}>;
};
