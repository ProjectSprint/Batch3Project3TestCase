import { userCollection } from "./provider.db.ts";
import { User } from "./model.user.js";

export class UserRepository {
  private collection;

  constructor() {
    this.collection = userCollection;
  }

  async insert(user: User): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.collection.insert(user, (err, newDoc) => {
          if (err) return reject(err);
          resolve(newDoc);
        });
    });
  }

  async get(user: User): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const orQuery: any[] = [];
      if (user.id) orQuery.push({ id: user.id });
      if (user.email) orQuery.push({ email: user.email });
      if (user.phone) orQuery.push({ phone: user.phone });

      if (orQuery.length === 0) return resolve(null);

      this.collection.findOne<User>({ $or: orQuery }, (err, doc) => {
        if (err) return reject(err);
        resolve(doc ?? null);
      });
    });
  }
}

export const userRepository = new UserRepository();
