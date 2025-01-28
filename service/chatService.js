const { EventEmitter } = require('../utils/eventEmitter');
const Redis = require("ioredis");
const redisClient = new Redis();

class ChatService {
  constructor() {
      
    //   this.redisClient = redisClient;
      this.eventEmitter = new EventEmitter();
  }

  async handleEvent(event) {
    // Validate the event structure
    if (!event || typeof event !== 'object') {
      throw new Error('Invalid event data');
    }
  
    const { eventType, userId, chatRoomId, message, timestamp } = event;
  
    // Ensure chat room exists or create it
    await this.createChatRoom(chatRoomId);
  
    switch (eventType) {
      case 'join':
        await this.addUserToChatRoom(chatRoomId, userId);
        this.eventEmitter.emit('userJoined', { chatRoomId, userId });
        break;
  
      case 'leave':
        await this.removeUserFromChatRoom(chatRoomId, userId);
        this.eventEmitter.emit('userLeft', { chatRoomId, userId });
        break;
  
      case 'message':
        const newMessage = { userId, message, timestamp };
        await this.addMessageToChatHistory(chatRoomId, newMessage);
        this.eventEmitter.emit('newMessage', { chatRoomId, message: newMessage });
        break;
  
      default:
        throw new Error('Invalid event type');
    }
  }

  async addUserToChatRoom(chatRoomId, userId) {
    await redisClient.sadd(`chatRoom:${chatRoomId}:users`, userId);
  }

  async addMessageToChatHistory(chatRoomId, message) {
    await redisClient.rpush(`chatRoom:${chatRoomId}:history`, JSON.stringify(message));
  }

  async getActiveUsers(chatRoomId) {
    return await redisClient.smembers(`chatRoom:${chatRoomId}:users`);
  }

  async getChatHistory(chatRoomId, limit = 50) {
    try {
      // Retrieve the last `limit` messages for the specified chat room
      const history = await redisClient.lrange(`chatRoom:${chatRoomId}:history`, -limit, -1);
  
      // If no history is found, return an empty array
      if (!history.length) {
        return [];
      }
  
      // Map and return the history as parsed JSON objects
      return history.map(msg => JSON.parse(msg));
    } catch (error) {
      throw new Error('Error fetching chat history: ' + error.message);
    }
  }
  

  async createChatRoom(chatRoomId) {
    
    
    const exists = await redisClient.exists(`chatRoom:${chatRoomId}:users`);
    if (!exists) {
      const pipeline = redisClient.pipeline();
      pipeline.sadd(`chatRoom:${chatRoomId}:users`, '');
      pipeline.lpush(`chatRoom:${chatRoomId}:history`, JSON.stringify([]));
      await pipeline.exec();
      this.eventEmitter.emit('roomCreated', { chatRoomId });
    }
  }
}

module.exports = ChatService;
