const express = require("express");
const { Pool } = require("pg");
const { Kafka } = require("kafkajs");
const { Server } = require("socket.io");
const http = require("http");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Kafka Producer
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const producer = kafka.producer();
producer.connect();

// Create a Poll
app.post("/polls", async (req, res) => {
  const { question, options } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO polls (question, options) VALUES ($1, $2) RETURNING *",
      [question, JSON.stringify(options)]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vote on a Poll
app.post("/polls/:id/vote", async (req, res) => {
  const { option } = req.body;
  const { id } = req.params;

  await producer.send({
    topic: "votes",
    messages: [{ value: JSON.stringify({ poll_id: id, option }) }],
  });

  res.json({ message: "Vote submitted successfully!" });
});

// Poll Results
app.get("/polls/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT options, (SELECT COUNT(*) FROM votes WHERE poll_id = $1) AS total_votes FROM polls WHERE id = $1",
      [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket Connection
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("joinPoll", (pollId) => {
    socket.join(pollId);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
