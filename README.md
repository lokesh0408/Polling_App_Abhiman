# Polling_App

Polling System with Kafka and WebSockets

```This is a real-time polling system built with Node.js, Express, PostgreSQL, Kafka, and WebSockets. It allows users to create polls, vote, and receive real-time updates on poll results.```

Features

Create Polls: Store poll data in PostgreSQL.

Vote on Polls: Votes are sent to Kafka for processing.

Real-time Updates: Uses WebSockets to update clients.

Scalability: Kafka handles high-concurrency voting.

Tech Stack

Backend: Node.js, Express, PostgreSQL

Messaging: Apache Kafka with Zookeeper

Real-time Communication: WebSockets via socket.io

Containerization: Docker, Docker Compose

Setup Instructions

1. Clone the repository

```git clone <repo-url>
cd polling-system
```
2. Set up environment variables

Create a .env file and add:
```

# Kafka Configuration
KAFKA_BROKER=kafka:9092
KAFKA_CLIENT_ID=polling-app
KAFKA_GROUP_ID=poll-group

# Server Configuration
PORT=3000
WEBSOCKET_PORT=3002
```
3. Run the application using Docker Compose
```
docker-compose up --build
```
This will start PostgreSQL, Kafka, Zookeeper, and the polling app.

API Endpoints

1. Create a Poll

POST /polls

Request Body:
```
{
  "question": "Which programming language do you prefer?",
  "options": ["JavaScript", "Python", "Java", "C++"]
}
```
Response:
```
{
  "id": 1,
  "question": "Which programming language do you prefer?",
  "options": ["JavaScript", "Python", "Java", "C++"]
}
```
2. Vote on a Poll

POST /polls/:id/vote

Request Body:
```
{
  "option": "JavaScript"
}
```
Response Body:
```
{
  "message": "Vote submitted successfully!"
}
```
3. Get Poll Results

GET /polls/:id

```Response:
{
  "options": ["JavaScript", "Python", "Java", "C++"],
  "total_votes": 15
}
```
WebSocket Events

1. Join a Poll Room
```
socket.emit("joinPoll", pollId);
```
3. Receive Real-time Vote Updates
```
socket.on("voteUpdate", (data) => {
  console.log("New vote received:", data);
});
```
Stopping the Application

To stop all services, run:

```docker-compose down```

Contributors

Lokesh Kumar
