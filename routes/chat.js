const express = require('express');
const router = express.Router();
const ChatService = require('../service/chatService');
const chatService = new ChatService();

const {getActiveUsers} = require('../io/websocket')

router.get('/active-users/:chatRoomId', async (req, res) => {
  const { chatRoomId } = req.params;
  if (!chatRoomId) {
    return res.status(400).json({ error: 'Invalid chatRoomId' });
  }
  try {
    const users = getActiveUsers(chatRoomId);
    if (!users.length) return res.status(500).json({ message: 'no  active users' });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving active users' });
  }
});

router.get('/chat-history/:chatRoomId', async (req, res) => {
    const { chatRoomId } = req.params;  // Extract the chatRoomId from the URL params
    const limit = parseInt(req.query.limit) || 50;  // Get the 'limit' from query params, default to 50
  
    try {
      // Fetch chat history for the given chatRoomId, with the specified limit
      const history = await chatService.getChatHistory(chatRoomId, limit);
  
      // Return the chat history as JSON response
      res.json({
        chatRoomId,
        limit,
        messages: history,
      });
    } catch (error) {
      // Handle any errors, returning an error message
      res.status(500).json({
        error: 'Error retrieving chat history',
        details: error.message,
      });
    }
  });

router.post('/create-room', async (req, res) => {
    const { chatRoomId } = req.body;
  
    if (!chatRoomId) {
      return res.status(400).json({ error: 'chatRoomId is required' });
    }
  
    try {
      await chatService.createChatRoom(chatRoomId);
    
      // chatService.eventEmitter.emit('roomCreated', { chatRoomId });
      return res.status(201).json({ message: 'Chat room created successfully', chatRoomId });
    } catch (error) {
      return res.status(500).json({ error: 'Error creating chat room' });
    }
  });
  
module.exports = router;
