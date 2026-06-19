import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer;

process.env.MONGODB_URI = "mongodb://placeholder";

const cache = { conn: null as any, promise: null as any };
(global as any).mongooseCache = cache;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;

  const conn = await mongoose.connect(uri, { bufferCommands: false });
  cache.conn = conn;
  cache.promise = Promise.resolve(conn);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
