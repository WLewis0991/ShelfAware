import { NextResponse } from "next/server";
import { searchBookSegments } from "@/lib/actions/book.actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const toolCall = body.message?.type === "function-call"
      ? { name: body.message.functionName, args: body.message.parameters }
      : body.toolCall?.function
        ? {
            name: body.toolCall.function.name,
            args: JSON.parse(body.toolCall.function.arguments),
          }
        : body.toolCall
          ? { name: body.toolCall.name, args: body.toolCall.parameters ?? body.toolCall.args }
          : null;

    if (!toolCall || toolCall.name !== "search-book") {
      return NextResponse.json(
        { error: "Invalid tool call" },
        { status: 400 },
      );
    }

    const { bookId, query } = toolCall.args as {
      bookId: string;
      query: string;
    };

    if (!bookId || !query) {
      return NextResponse.json(
        { error: "Missing bookId or query" },
        { status: 400 },
      );
    }

    const { success, data } = await searchBookSegments(bookId, query, 3);

    if (!success || !data || !data.length) {
      return NextResponse.json({
        result: "no information found about this topic",
      });
    }

    const content = data
      .map((segment: { content: string }) => segment.content)
      .join("\n\n");

    return NextResponse.json({ result: content });
  } catch (e) {
    const message = e instanceof Error ? e.message : "An unknown error occurred";
    console.error("Vapi search-book error", e);
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
