const WebSocket = require('ws');
const { log } = require('console');
const Redis = require('ioredis');
const redisClient = new Redis();
// WebSocket clients store by chatRoomId
const clients = {};  // Store active WebSocket clients in memory by chatRoomId

// WebSocket connection handling
function initializeWebSocket(wss, chatService) {
  wss.on('connection', (ws) => {
    // Handle the connection first, only once, and avoid triggering join twice
    handleWebSocketConnection(ws, clients, chatService);
  });

  // Event Listener for `newMessage` event
  chatService.eventEmitter.on('newMessage', (data) => {
    handleNewMessageEvent(data, clients);
  });
}

// Handle a new WebSocket connection
function handleWebSocketConnection(ws, clients, chatService) {
  // Check if this connection is from Postman (no chatRoomId or userId) and assign default values if so
  if (!ws.chatRoomId || !ws.userId) {
    // If it's a Postman connection, set default values
    ws.chatRoomId = 'defaultRoomId'; // Assign a default or dynamic chat room
    ws.userId = `user_${Date.now()}`; // Generate a unique userId for Postman
  }

  // Handle join event for WebSocket clients, but only once
  handleJoinEvent(ws, { eventType: 'join' }, clients);

  ws.on('message', async (message) => {
    const data = JSON.parse(message);

    // Ensure we handle both join and message events
    if (data.eventType === 'join' && !ws.userId) {
      // If it's a join event from a client (not Postman), handle it
      handleJoinEvent(ws, data, clients);
    } else if (data.eventType === 'message') {
      handleMessageEvent(ws, data, chatService);
    }
  });

  ws.on('close', () => {
    handleDisconnection(ws, clients);
  });
}

// Handle the join event: add user to the chat room
async function handleJoinEvent(ws, data, clients) {
  // Extract chatRoomId and userId, using defaults if not provided
  const { chatRoomId = '2', userId = `user_${Date.now()}` } = data;
  
  ws.chatRoomId = chatRoomId;
  ws.userId = userId;

  // Initialize the chat room in the clients object if it doesn't exist
  if (!clients[chatRoomId]) {
    clients[chatRoomId] = [];
  }

  // Add the user to the active clients list
  clients[chatRoomId].push(ws);
  await redisClient.sadd(`chatRoom:${chatRoomId}:users`, userId);

  log(`User ${userId} joined chatRoom ${chatRoomId}`);
}

// Handle the message event: broadcast to other users in the chat room
async function handleMessageEvent(ws, data, chatService) {
  const timestamp = new Date().toISOString();
  const { chatRoomId, userId, message } = data;

  const newMessage = { userId, message, timestamp };
  await chatService.addMessageToChatHistory(chatRoomId, newMessage);
  chatService.eventEmitter.emit('newMessage', {
    chatRoomId,
    message: newMessage,
  });
}

// Handle disconnection: remove the client from the chat room
async function handleDisconnection(ws, clients) {
  const { chatRoomId, userId } = ws;
  if (clients[chatRoomId]) {
    const index = clients[chatRoomId].indexOf(ws);
    if (index !== -1) {
      clients[chatRoomId].splice(index, 1);  // Remove the user from active clients
    }
  }

  // Optionally, you can remove the user from Redis (if persistence is still needed)
  if (chatRoomId && userId) {
    await redisClient.srem(`chatRoom:${chatRoomId}:users`, userId);
  }

  log(`${userId} left chatRoom ${chatRoomId}`);
}

// Handle newMessage event: broadcast the message to all clients in the chat room
function handleNewMessageEvent(data, clients) {
  const { chatRoomId, message } = data;
  if (clients[chatRoomId]) {
    clients[chatRoomId].forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  } else {
    log(`No clients connected to chatRoom ${chatRoomId}`);
  }
}

// Function to get active users in a chat room (current session only)
function getActiveUsers(chatRoomId) {
  if (clients[chatRoomId]) {
    return clients[chatRoomId].map(client => client.userId);
  }
  return [];
}

module.exports = { 
  initializeWebSocket, 
  getActiveUsers  // Export the function to get active users
};
