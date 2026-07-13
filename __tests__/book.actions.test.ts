import { describe, it, expect, beforeEach } from "vitest";
import {
  createBook,
  checkBookExists,
  saveBookSegments,
} from "@/lib/actions/book.actions";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/bookSegment.model";
import mongoose from "mongoose";

beforeEach(async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI!, { bufferCommands: false });
  }
  await Book.deleteMany({});
  await BookSegment.deleteMany({});
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

describe("checkBookExists", () => {
  it("returns exists false when book does not exist", async () => {
    const result = await checkBookExists("Nonexistent Book");

    expect(result.exists).toBe(false);
  });

  it("returns exists true with book data when book exists", async () => {
    await createBook(validBook);
    const result = await checkBookExists(validBook.title);

    expect(result.exists).toBe(true);
    expect(result.book).toMatchObject({
      title: validBook.title,
      slug: "test-book",
    });
  });

  it("returns exists false with error on database error", async () => {
    await mongoose.disconnect();
    const result = await checkBookExists("Any Book");

    expect(result.exists).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("saveBookSegments", () => {
  let bookId: string;

  beforeEach(async () => {
    const book = await createBook(validBook);
    bookId = book.data._id;
  });

  it("saves segments and updates totalSegments on the book", async () => {
    const segments = [
      {
        text: "First segment content",
        segmentIndex: 0,
        pageNumber: 1,
        wordCount: 10,
      },
      {
        text: "Second segment content",
        segmentIndex: 1,
        pageNumber: 2,
        wordCount: 15,
      },
    ];

    const result = await saveBookSegments(bookId, validBook.clerkId, segments);

    expect(result.success).toBe(true);
    expect(result.data?.segmentsCreated).toBe(2);

    const savedSegments = await BookSegment.find({ bookId }).lean();
    expect(savedSegments).toHaveLength(2);
    expect(savedSegments[0].content).toBe("First segment content");

    const updatedBook = await Book.findById(bookId).lean();
    expect(updatedBook?.totalSegments).toBe(2);
  });

  it("saves segments without pageNumber", async () => {
    const segments = [
      { text: "No page number segment", segmentIndex: 0, wordCount: 5 },
    ];

    const result = await saveBookSegments(bookId, validBook.clerkId, segments);

    expect(result.success).toBe(true);
    expect(result.data?.segmentsCreated).toBe(1);
  });

  it("returns success false on database error", async () => {
    const segments = [
      { text: "Will fail", segmentIndex: 0, pageNumber: 1, wordCount: 5 },
    ];

    await mongoose.disconnect();
    const result = await saveBookSegments(bookId, validBook.clerkId, segments);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
