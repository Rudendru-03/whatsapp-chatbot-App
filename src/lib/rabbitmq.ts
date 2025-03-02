import amqp from "amqplib";

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

export default async function getRabbitMQChannel() {
    if (connection && channel) return channel;

    connection = await amqp.connect(`${process.env.RABBITMQ_URL}`);
    channel = await connection.createChannel();

    await channel.assertQueue("whatsapp_outgoing_queue", { durable: true });
    await channel.assertQueue("whatsapp_incoming_queue", { durable: true });

    await channel.assertExchange("whatsapp_broadcast", "fanout", { durable: true });

    console.log("RabbitMQ Connected!");
    return channel;
}
