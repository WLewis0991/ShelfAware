"use server";

import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/database/mongoose";
import { CreateBook, TextSegment } from "@/types";
import { generateSlug, serializeData } from "../utils";
import { checkBookLimit } from "../plans";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/bookSegment.model";

export const checkBookExists = async (title: string) => {
  try {
    await connectToDatabase();

    const slug = generateSlug(title);

    const existingBook = await Book.findOne({ slug }).lean();

    if (existingBook) {
      return {
        exists: true,
        book: serializeData(existingBook),
      };
    }

    return {
      exists: false,
    };
  } catch (e) {
    console.error("Error checking book exists", e);
    return {
      exists: false,
      error: e,
    };
  }
};

export const createBook = async (data: CreateBook) => {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Not authenticated" };

    await connectToDatabase();

    const slug = generateSlug(data.title);

    const existingBook = await Book.findOne({ slug }).lean();

    if (existingBook) {
      return {
        success: true,
        data: serializeData(existingBook),
        alreadyExisting: true,
      };
    }

    const { allowed, current, limit } = await checkBookLimit(userId);
    if (!allowed) {
      return {
        success: false,
        error: `Book limit reached (${current}/${limit}). Upgrade your plan to add more books.`,
        isBillingError: true,
      };
    }

    const book = await Book.create({ ...data, slug, totalSegments: 0 });

    return {
      success: true,
      data: serializeData(book),
    };
  } catch (e) {
    console.error("Error creating a book:", e);
    return {
      success: false,
      error: e,
    };
  }
};

export const saveBookSegments = async (
  bookId: string,
  clerkId: string,
  segments: TextSegment[],
) => {
  try {
    await connectToDatabase();

    console.log("Saving book segments...");

    const segmentsToInsert = segments.map(
      ({ text, segmentIndex, pageNumber, wordCount }) => ({
        clerkId,
        bookId,
        content: text,
        segmentIndex,
        pageNumber,
        wordCount,
      }),
    );

    await BookSegment.insertMany(segmentsToInsert);

    await Book.findByIdAndUpdate(bookId, { totalSegments: segments.length });

    console.log("Book segments saved successfully.");

    return {
      success: true,
      data: { segmentsCreated: segments.length },
    };
  } catch (e) {
    console.error("Error saving book segments", e);

    return {
      success: false,
      error: e,
    };
  }
};

export const getBookBySlug = async (slug: string) => {
  try {
    await connectToDatabase();

    const book = await Book.findOne({ slug }).lean();

    if (!book) {
      return {
        success: false,
      };
    }

    return {
      success: true,
      data: serializeData(book),
    };
  } catch (e) {
    console.error("Error fetching book by slug:", e);
    return {
      success: false,
      error: e,
    };
  }
};

export const searchBookSegments = async (
  bookId: string,
  query: string,
  limit: number = 3,
) => {
  try {
    await connectToDatabase();

    const segments = await BookSegment.find(
      { bookId, $text: { $search: query } },
      { score: { $meta: "textScore" } },
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .lean();

    if (!segments.length) {
      return {
        success: true,
        data: [],
      };
    }

    return {
      success: true,
      data: serializeData(segments),
    };
  } catch (e) {
    console.error("Error searching book segments", e);
    return {
      success: false,
      error: e,
    };
  }
};

export const getAllBooks = async () => {
  try {
    await connectToDatabase();

    const books = await Book.find().sort({ createdAt: -1 }).lean();

    return {
      success: true,
      data: serializeData(books),
    };
  } catch (e) {
    console.error("Error connecting to database", e);
    return {
      success: false,
      error: e,
    };
  }
};
