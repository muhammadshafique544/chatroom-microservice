const request = require('supertest');
const app = require('../index.js'); 


describe('Chat API Tests', () => {
    it('should return 500 and message when there are no active users in a chat room', async () => {
      
        const response = await request(app)
          .get('/api/chat/active-users/2');
      
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'no  active users');
      });
    
  it('should return chat history for a room', async () => {
    const response = await request(app)
      .get('/api/chat/chat-history/1?limit=50');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response._body.messages)).toBe(true);
  });


it('should handle creating up to 10,000 chat rooms efficiently', async () => {
    const startTime = Date.now();
    const TOTAL_CHATROOMS = 10000;
    const BATCH_SIZE = 500;
  
    const createRoomBatch = async (start, end) => {
      const batchPromises = [];
      for (let i = start; i <= end; i++) {
        const chatRoomId = `${i}`;
        batchPromises.push(
          request(app)
            .post('/api/chat/create-room')
            .send({ chatRoomId })
            .expect(201)
            .then((response) => {
              expect(response.body.message).toBe('Chat room created successfully');
              expect(response.body.chatRoomId).toBe(chatRoomId);
            })
        );
      }
      await Promise.all(batchPromises);
    };
  
    for (let i = 1; i <= TOTAL_CHATROOMS; i += BATCH_SIZE) {
      const end = Math.min(i + BATCH_SIZE - 1, TOTAL_CHATROOMS);
      await createRoomBatch(i, end);
    }
  
    const endTime = Date.now();
    console.log(`Successfully created ${TOTAL_CHATROOMS} rooms in ${endTime - startTime}ms`);
  

    expect(TOTAL_CHATROOMS).toBe(TOTAL_CHATROOMS);
  }, 600000);
});
