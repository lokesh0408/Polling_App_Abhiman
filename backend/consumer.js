const { Kafka } = require("kafkajs");
const { Pool } = require("pg");
const { Server } = require("socket.io");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID });
const io = new Server(process.env.WEBSOCKET_PORT);

io.on("connection", (socket) => {
  console.log("WebSocket connected");
});

const waitForKafka = async () => {
  let retries = 10;
  while (retries) {
    try {
      await consumer.connect();
      console.log("Kafka connected successfully.");
      return;
    } catch (error) {
      console.error("Kafka not ready yet. Retrying in 5s...");
      retries--;
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
  throw new Error("Kafka failed to start after multiple attempts.");
};

const processVotes = async () => {
  await waitForKafka();
  await consumer.subscribe({ topic: "votes", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const { poll_id, option } = JSON.parse(message.value.toString());

      await pool.query("INSERT INTO votes (poll_id, option) VALUES ($1, $2)", [
        poll_id,
        option,
      ]);

      io.to(poll_id).emit("voteUpdate", { poll_id, option });
    },
  });
};

processVotes();
