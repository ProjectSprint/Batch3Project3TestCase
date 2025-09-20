import { Type } from "@fastify/type-provider-typebox";
import { StatusCodes } from "http-status-codes";
import { PSServer } from "../types.js";
import { ProductRepository } from "../repository/repo.product.js";
import { FileRepository } from "../repository/repo.file.js";
import { ProductTypes } from "../const/product_type.const.js";

export function productCreatorHandler(
	s: PSServer,
	productRepo: ProductRepository,
	fileRepo: FileRepository,
) {
	const ProductTypeSchema = Type.Union(
		ProductTypes.map((v) => Type.Literal(v)),
	);

	/**
	 * POST /v1/product
	 */
	s.post(
		"/v1/product",
		{
			schema: {
				body: Type.Object({
					name: Type.String({ minLength: 4, maxLength: 32 }),
					category: ProductTypeSchema,
					qty: Type.Number({ minimum: 1 }),
					price: Type.Number({ minimum: 100 }),
					sku: Type.String({ minLength: 0, maxLength: 32 }),
					fileId: Type.String({}),
				}),
			},
		},
		async (req, res) => {
			const { name, category, qty, price, sku, fileId } = req.body;

			// validate file existence
			const file = await fileRepo.get(fileId);
			if (!file) {
				return res.status(StatusCodes.BAD_REQUEST).send({
					message: "Invalid fileId",
				});
			}

			const product = await productRepo.insert({
				name,
				category,
				qty,
				price,
				sku,
				fileId,
				fileUri: file.fileUri,
				fileThumbnailUri: file.fileThumbnailUri,
			});

			if (!product) {
				return res.status(StatusCodes.CONFLICT).send({
					message: "SKU already exists",
				});
			}

			res.status(StatusCodes.CREATED).send(product);
		},
	);
}
