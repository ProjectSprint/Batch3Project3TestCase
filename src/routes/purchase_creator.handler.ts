import { Type } from "@fastify/type-provider-typebox";
import { StatusCodes } from "http-status-codes";
import { PSServer } from "../types.js";
import { PurchaseRepository } from "../repository/repo.purchase.js";
import { ProductRepository } from "../repository/repo.product.js";
import { UserRepository } from "../repository/repo.user.js";
import { FileRepository } from "../repository/repo.file.js";
import { PaymentDetail, PurchaseItem } from "../entity/purchase.entity.js";
import { callingCodes } from "../const/calling_code.const.js";

const pattern = "^\\+(" + callingCodes.join("|") + ")\\d*$";
const PurchaseSchema = Type.Object(
	{
		purchasedItems: Type.Array(
			Type.Object({
				productId: Type.String(),
				qty: Type.Number({ minimum: 1 }),
			}),
			{ minItems: 1 },
		),
		senderName: Type.String({ minLength: 4, maxLength: 55 }),
		senderContactType: Type.Union([
			Type.Literal("email"),
			Type.Literal("phone"),
		]),
		senderContactDetail: Type.String(),
	},
	{
		allOf: [
			{
				if: { properties: { senderContactType: { const: "email" } } },
				then: {
					properties: {
						senderContactDetail: { type: "string", format: "email" },
					},
				},
			},
			{
				if: { properties: { senderContactType: { const: "phone" } } },
				then: {
					properties: {
						senderContactDetail: { type: "string", pattern },
					},
				},
			},
		],
	},
);
export function purchaseHandlers(
	s: PSServer,
	purchaseRepo: PurchaseRepository,
	productRepo: ProductRepository,
	userRepo: UserRepository,
	fileRepo: FileRepository,
) {
	// POST /v1/purchase
	s.post(
		"/v1/purchase",
		{
			schema: {
				body: PurchaseSchema,
			},
		},
		async (req, res) => {
			const {
				purchasedItems,
				senderName,
				senderContactType,
				senderContactDetail,
			} = req.body;

			const items: PurchaseItem[] = [];
			const sellerTotals: Map<string, number> = new Map();

			for (const { productId, qty } of purchasedItems) {
				const product = await productRepo.getById(productId);
				if (!product) {
					return res
						.status(StatusCodes.BAD_REQUEST)
						.send({ message: "Invalid productId" });
				}
				if (qty > product.qty) {
					return res
						.status(StatusCodes.BAD_REQUEST)
						.send({ message: "Product qty exceeded" });
				}

				// copy product snapshot
				items.push({
					productId: product.productId,
					name: product.name,
					category: product.category,
					qty,
					price: product.price,
					sku: product.sku,
					fileId: product.fileId,
					fileUri: product.fileUri,
					fileThumbnailUri: product.fileThumbnailUri,
					createdAt: product.createdAt,
					updatedAt: product.updatedAt,
					sellerId: product.createdBy,
				});

				const subtotal = product.price * qty;
				sellerTotals.set(
					product.createdBy,
					(sellerTotals.get(product.createdBy) || 0) + subtotal,
				);
			}

			// payment details from sellers
			const paymentDetails: PaymentDetail[] = [];
			for (const [sellerId, totalPrice] of sellerTotals) {
				const seller = await userRepo.get(sellerId);
				if (
					!seller ||
					!seller.bankAccountName ||
					!seller.bankAccountHolder ||
					!seller.bankAccountNumber
				)
					continue;

				paymentDetails.push({
					bankAccountName: seller.bankAccountName,
					bankAccountHolder: seller.bankAccountHolder,
					bankAccountNumber: seller.bankAccountNumber,
					totalPrice,
				});
			}

			const totalPrice = items.reduce((sum, i) => sum + i.price * i.qty, 0);

			const purchase = await purchaseRepo.insert({
				purchasedItems: items,
				totalPrice,
				paymentDetails,
				senderName,
				senderContactType,
				senderContactDetail,
				fileIds: [],
			});

			if (!purchase) {
				return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
			}

			res.status(StatusCodes.CREATED).send(purchase);
		},
	);

	// POST /v1/purchase/:purchaseId
	s.post(
		"/v1/purchase/:purchaseId",
		{
			schema: {
				body: Type.Object({
					fileIds: Type.Array(Type.String(), { minItems: 1 }),
				}),
				params: Type.Object({
					purchaseId: Type.String(),
				}),
			},
		},
		async (req, res) => {
			const { purchaseId } = req.params;
			const { fileIds } = req.body;

			const purchase = await purchaseRepo.get(purchaseId);
			if (!purchase) {
				return res
					.status(StatusCodes.NOT_FOUND)
					.send({ message: "Invalid purchaseId" });
			}

			if (fileIds.length !== purchase.paymentDetails.length) {
				return res
					.status(StatusCodes.BAD_REQUEST)
					.send({ message: "FileIds length mismatch" });
			}

			// validate files
			for (const f of fileIds) {
				const file = await fileRepo.get(f);
				if (!file) {
					return res
						.status(StatusCodes.BAD_REQUEST)
						.send({ message: "Invalid fileId" });
				}
			}

			// decrease real product qty (can go negative)
			for (const item of purchase.purchasedItems) {
				const product = await productRepo.getById(item.productId);
				if (product) {
					await productRepo.update(product.productId, {
						...product,
						qty: product.qty - item.qty,
					});
				}
			}

			const updated = { ...purchase, fileIds };
			const saved = await purchaseRepo.update(updated);
			if (!saved) {
				return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
			}

			res.status(StatusCodes.CREATED).send(saved);
		},
	);
}
