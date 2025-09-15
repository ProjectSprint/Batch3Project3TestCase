// src/provider.db.ts
import Datastore from "@seald-io/nedb";

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
