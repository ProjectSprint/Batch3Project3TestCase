import { Type } from "@fastify/type-provider-typebox";
import { StatusCodes } from "http-status-codes";
import { PSServer } from "../types.js";
import { ProductRepository } from "../repository/repo.product.js";
import { ProductTypes } from "../const/product_type.const.js";

export function productGetterHandler(
	s: PSServer,
	productRepo: ProductRepository,
) {
	const ProductTypeSchema = Type.Union(
		ProductTypes.map((v) => Type.Literal(v)),
	);

	/**
	 * GET /v1/product
	 */
	s.get(
		"/v1/product",
		{
			schema: {
				querystring: Type.Object({
					limit: Type.Optional(Type.String()),
					offset: Type.Optional(Type.String()),
					productId: Type.Optional(Type.String()),
					sku: Type.Optional(Type.String()),
					category: Type.Optional(ProductTypeSchema),
					sortBy: Type.Optional(
						Type.Union([
							Type.Literal("newest"),
							Type.Literal("oldest"),
							Type.Literal("cheapest"),
							Type.Literal("expensive"),
						]),
					),
				}),
			},
		},
		async (req, res) => {
			const { limit, offset, productId, sku, category, sortBy } = req.query;

			const products = await productRepo.findAll({
				limit: parseInt(limit || "0"),
				offset: parseInt(offset || "0"),
				productId,
				sku,
				category,
				sortBy,
			});

			res.status(StatusCodes.OK).send(products);
		},
	);
}
