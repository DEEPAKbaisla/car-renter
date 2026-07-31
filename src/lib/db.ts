import { connect } from "mongoose";

const mongodbUrl = process.env.MONGODB_URI;
if (!mongodbUrl) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDb = async () => {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = connect(mongodbUrl).then((c) => c.connection);
  }
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
  return cached.conn;
};

export default connectDb;
