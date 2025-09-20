import { Type } from "@fastify/type-provider-typebox";
import { StatusCodes } from "http-status-codes";
import { PSServer } from "../types.js";
import { ProductRepository } from "../repository/repo.product.js";
import { ActivityTypes } from "../const/activity_type.const.js";

export function productGetterHandler(
	s: PSServer,
	productRepo: ProductRepository,
) {
	const ActivityTypeSchema = Type.Union(
		ActivityTypes.map((v) => Type.Literal(v)),
	);

	/**
	 * GET /v1/product
	 */
	s.get(
		"/v1/product",
		{
			schema: {
				querystring: Type.Object({
					limit: Type.Optional(Type.Number()),
					offset: Type.Optional(Type.Number()),
					productId: Type.Optional(Type.String()),
					sku: Type.Optional(Type.String()),
					category: Type.Optional(ActivityTypeSchema),
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
				limit,
				offset,
				productId,
				sku,
				category,
				sortBy,
			});

			res.status(StatusCodes.OK).send(products);
		},
	);
}
