
import Datastore from "nedb";
import { userCollection } from "./provider.db.ts";
import { User } from "./model.user.js";


export class UserRepository {
  private collection: Datastore;

  constructor() {
    this.collection = userCollection;
  }

  async insert(user: User): Promise<User> {
    return new Promise((resolve, reject) => {
      this.collection.insert(user, (err, doc) => {
        if (err) {
          reject(err);
        } else {
          resolve(doc);
        }
      });
    });
  }
  async get(id: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.collection.findOne<User>({ id }, (err, doc) => {
        if (err) {
          reject(err);
        } else {
          resolve(doc ?? null);
        }
      });
    });
  }
}

export const userRepository = new UserRepository();
