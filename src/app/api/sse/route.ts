import type { NextRequest } from "next/server";

const clients = new Set<ReadableStreamDefaultController>();

export function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);
      req.signal.addEventListener("abort", () => {
        clients.delete(controller);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
