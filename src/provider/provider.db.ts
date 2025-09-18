import PouchDB from "pouchdb";
import PouchDBMemory from "pouchdb-adapter-memory";
import PouchDBLike from "pouchdb-find";
import { User } from "../entity/user.entity.js";
PouchDB.plugin(PouchDBMemory);
PouchDB.plugin(PouchDBLike);
const userCollection = new PouchDB<User>("users", {
	adapter: "memory",
});

export { userCollection };

export const fileCollection = new PouchDB("files", { adapter: "memory" });
export const productCollection = new PouchDB("products", { adapter: "memory" });
export const purchaseCollection = new PouchDB("purchases", {
	adapter: "memory",
});
