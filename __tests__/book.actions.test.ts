import { describe, it, expect, beforeEach } from "vitest";
import { createBook } from "@/lib/actions/book.actions";
import Book from "@/database/models/book.model";
import mongoose from "mongoose";

beforeEach(async () => {
  await Book.deleteMany({});
});

const validBook = {
  clerkId: "user_123",
  title: "Test Book",
  author: "Test Author",
  fileURL: "https://example.com/book.pdf",
  fileBlobKey: "blob-key-123",
  fileSize: 1024,
};

describe("createBook", () => {
  it("creates a new book and returns success", async () => {
    const result = await createBook(validBook);

    expect(result.success).toBe(true);
    expect(result).not.toHaveProperty("alreadyExisting");
    expect(result.data).toMatchObject({
      title: "Test Book",
      author: "Test Author",
      slug: "test-book",
      clerkId: "user_123",
      fileSize: 1024,
    });
  });

  it("returns alreadyExisting when slug conflicts", async () => {
    await createBook(validBook);
    const duplicate = await createBook(validBook);

    expect(duplicate.success).toBe(true);
    expect(duplicate.alreadyExisting).toBe(true);
  });

  it("returns success false on database error", async () => {
    await mongoose.disconnect();
    const result = await createBook(validBook);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
