// src/provider.db.ts
import Datastore from "nedb";

export const userCollection = new Datastore({
  filename: "./data/users.db",
  autoload: true,
});

export const fileCollection = new Datastore({
  filename: "./data/files.db",
  autoload: true,
});

export const productCollection = new Datastore({
  filename: "./data/products.db",
  autoload: true,
});

export const purchaseCollection = new Datastore({
  filename: "./data/purchases.db",
  autoload: true,
});

// Ensure unique indexes
userCollection.ensureIndex({ fieldName: "email", unique: true, sparse: true });
userCollection.ensureIndex({ fieldName: "phone", unique: true, sparse: true });
fileCollection.ensureIndex({ fieldName: "fileId", unique: true });
productCollection.ensureIndex({ fieldName: "productId", unique: true });
productCollection.ensureIndex({ fieldName: "userId" });
purchaseCollection.ensureIndex({ fieldName: "purchaseId", unique: true });
