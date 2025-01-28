const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3000');

ws.on('open', () => {
  console.log('Connected to WebSocket server')
  const chatMessage = {
    eventType: 'message', 
    chatRoomId: '2',
    userId: 'user123',
    message: 'Hello from ws-client!',       
    timestamp: new Date().toISOString()
  };

  ws.send(JSON.stringify(chatMessage));
});

ws.on('message', (data) => {
  console.log('Received message:',  JSON.parse(data));
});
ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

ws.on('close', () => {
  console.log('Disconnected from WebSocket server');
});
