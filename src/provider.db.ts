import Datastore from "nedb";

export const userCollection = new Datastore({
  filename: "./data/users.db",
  autoload: true,
});

export const activityCollection = new Datastore({
  filename: "./data/activities.db",
  autoload: true,
});
