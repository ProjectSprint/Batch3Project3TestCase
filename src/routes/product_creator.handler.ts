import { Type } from "@fastify/type-provider-typebox";
import { PSServer } from "../types.js";
import { ActivityTypes } from "../const/activity_type.const.js";

export function productCreatorHandler(s: PSServer) {
	const ActivityTypeSchema = Type.Union(
		ActivityTypes.map((v) => Type.Literal(v)),
	);

	s.get(
		"/v1/product",
		{
			schema: {
				body: Type.Object({
					name: Type.String({
						minLength: 4,
						maxLength: 32,
					}),
					category: ActivityTypeSchema,
					qty: Type.Number({
						minimum: 1,
					}),
					price: Type.Number({
						minimum: 100,
					}),
					sku: Type.String({
						minLength: 0,
						maxLength: 32,
					}),
					fileId: Type.String({
						description: "Should be a valid fileId",
					}),
				}),
			},
		},
		async (req, res) => {
			const usr = req.user;
		},
	);
}
