const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const Redis = require('ioredis');
const chatRouter = require('./routes/chat');
const ChatService = require('./service/chatService');
const { log } = require('console');
const { initializeWebSocket } = require('./io/websocket');
const { WebSocketServer } = require('ws'); 

// Initialize application and services
const app = express();
const port = 3000;
const redisClient = initializeRedis();
const chatService = new ChatService(redisClient);
const server = http.createServer(app);

// Middleware to parse JSON
app.use(bodyParser.json());

// Create WebSocket server
const wss = new WebSocketServer({ noServer: true });  // Instantiate WebSocketServer correctly

// Initialize WebSocket functionality
initializeWebSocket(wss, chatService);

// Use chat API routes
app.use('/api/chat', chatRouter);

// Upgrade HTTP server to handle WebSocket connections
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Start the HTTP server
server.listen(port, () => {
  log(`Chatroom microservice listening on port ${port}`);
});

// Initialize Redis client
function initializeRedis() {
  const redisClient = new Redis();
  redisClient.on('connect', () => log('Redis Client Connected'));
  redisClient.on('error', (err) => log('Redis Client Error:', err));
  return redisClient;
}

module.exports = app;
