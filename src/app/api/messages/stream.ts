import { NextRequest } from "next/server";
import amqp from "amqplib";

const QUEUE_NAME = "whatsapp_incoming_queue";

export async function GET(req: NextRequest) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            try {
                const connection = await amqp.connect("amqp://localhost");
                const channel = await connection.createChannel();
                await channel.assertQueue(QUEUE_NAME, { durable: true });

                console.log("SSE Connection Established");

                while (true) {
                    try {
                        const msg = await channel.get(QUEUE_NAME, { noAck: false });
                        if (msg) {
                            const messageData = JSON.parse(msg.content.toString());
                            console.log("New message:", messageData);

                            controller.enqueue(encoder.encode(`data: ${JSON.stringify(messageData)}\n\n`));
                        }
                    } catch (err) {
                        console.error("Error reading from RabbitMQ:", err);
                        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: "RabbitMQ error" })}\n\n`));
                    }
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                }
            } catch (error) {
                console.error("SSE Error:", error);
                controller.close();
            }
        },
        cancel() {
            console.log("SSE Connection Closed");
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Access-Control-Allow-Origin": "*", // Fix CORS issues
        },
    });
}
