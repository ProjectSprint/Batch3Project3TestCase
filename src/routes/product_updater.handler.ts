import { Type } from "@fastify/type-provider-typebox";
import { StatusCodes } from "http-status-codes";
import { PSServer } from "../types.js";
import { ProductRepository } from "../repository/repo.product.js";
import { FileRepository } from "../repository/repo.file.js";
import { ActivityTypes } from "../const/activity_type.const.js";

export function productUpdaterHandler(
	s: PSServer,
	productRepo: ProductRepository,
	fileRepo: FileRepository,
) {
	const ActivityTypeSchema = Type.Union(
		ActivityTypes.map((v) => Type.Literal(v)),
	);

	/**
	 * PUT /v1/product/:productId
	 */
	s.put(
		"/v1/product/:productId",
		{
			schema: {
				body: Type.Object({
					name: Type.String({ minLength: 4, maxLength: 32 }),
					category: ActivityTypeSchema,
					qty: Type.Number({ minimum: 1 }),
					price: Type.Number({ minimum: 100 }),
					sku: Type.String({ minLength: 0, maxLength: 32 }),
					fileId: Type.String({}),
				}),
				params: Type.Object({
					productId: Type.String(),
				}),
			},
		},
		async (req, res) => {
			const { productId } = req.params;
			const { name, category, qty, price, sku, fileId } = req.body;

			const file = await fileRepo.get(fileId);
			if (!file) {
				return res.status(StatusCodes.BAD_REQUEST).send({
					message: "Invalid fileId",
				});
			}

			const updated = await productRepo.update(productId, {
				name,
				category,
				qty,
				price,
				sku,
				fileId,
				fileUri: file.fileUri,
				fileThumbnailUri: file.fileThumbnailUri,
			});

			if (!updated) {
				// Distinguish between conflict and not found
				const exists = await productRepo.getById(productId);
				if (!exists) {
					return res.status(StatusCodes.NOT_FOUND).send({
						message: "Product not found",
					});
				}
				return res.status(StatusCodes.CONFLICT).send({
					message: "SKU already exists",
				});
			}

			res.status(StatusCodes.OK).send(updated);
		},
	);
}
