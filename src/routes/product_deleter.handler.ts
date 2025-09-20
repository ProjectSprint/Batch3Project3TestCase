import { Type } from "@fastify/type-provider-typebox";
import { StatusCodes } from "http-status-codes";
import { PSServer } from "../types.js";
import { ProductRepository } from "../repository/repo.product.js";

export function productDeleterHandler(
	s: PSServer,
	productRepo: ProductRepository,
) {
	/**
	 * DELETE /v1/product/:productId
	 */
	s.delete(
		"/v1/product/:productId",
		{
			schema: {
				params: Type.Object({
					productId: Type.String(),
				}),
			},
		},
		async (req, res) => {
			const { productId } = req.params;
			const deleted = await productRepo.delete(productId);

			if (!deleted) {
				return res.status(StatusCodes.NOT_FOUND).send({
					message: "Product not found",
				});
			}

			res.status(StatusCodes.OK).send({ message: "deleted" });
		},
	);
}
