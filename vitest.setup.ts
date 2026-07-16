import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { Mongoose } from "mongoose";
import { vi } from "vitest";

let mongoServer: MongoMemoryServer;

process.env.MONGODB_URI = "mongodb://placeholder";

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

const cache: MongooseCache = { conn: null, promise: null };
(global as unknown as { mongooseCache: MongooseCache }).mongooseCache = cache;

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(() => ({
    userId: "user_123",
    has: vi.fn(() => false),
    getToken: vi.fn(),
    protect: vi.fn(),
    isAuthenticated: true,
  })),
}));

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
