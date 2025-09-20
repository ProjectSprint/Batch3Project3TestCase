export type PurchaseItem = {
	productId: string; // reference to original product
	name: string;
	category: string;
	qty: number;
	price: number;
	sku: string;
	fileId: string;
	fileUri: string;
	fileThumbnailUri: string;
	createdAt: Date;
	updatedAt: Date;
	sellerId: string; // who owns the product (from product)
};
export type PaymentDetail = {
	bankAccountName: string;
	bankAccountHolder: string;
	bankAccountNumber: string;
	totalPrice: number; // subtotal per seller
};
export type Purchase = {
	_id: string; // = purchaseId
	purchaseId: string;
	purchasedItems: PurchaseItem[];
	totalPrice: number;
	paymentDetails: PaymentDetail[];
	senderName: string;
	senderContactType: "email" | "phone";
	senderContactDetail: string;
	fileIds: string[]; // uploaded proofs (set later, initially empty)
	createdAt: Date;
};
