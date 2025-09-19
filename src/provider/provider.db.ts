import PouchDB from "pouchdb";
import PouchDBMemory from "pouchdb-adapter-memory";
import PouchDBLike from "pouchdb-find";
import { User } from "../entity/user.entity.js";
import { File } from "../entity/file.entity.js";
import { Product } from "../entity/product.entity.js";
PouchDB.plugin(PouchDBMemory);
PouchDB.plugin(PouchDBLike);
const userCollection = new PouchDB<User>("users", {
	adapter: "memory",
});

export { userCollection };

export const fileCollection = new PouchDB<File>("files", { adapter: "memory" });
export const productCollection = new PouchDB<Product>("products", {
	adapter: "memory",
});
export const purchaseCollection = new PouchDB("purchases", {
	adapter: "memory",
});
