
# Chat Room Microservice

A  chat room microservice designed using WebSocket connections and REST APIs.

# Features

Create and manage chat rooms in real-time.
REST APIs for chat room creation and management.
WebSocket for real-time messaging.

# Prerequisites
Node.js (v16 or above)

npm 

Redis 

WSS
## Installation

1. Clone the Repository:

```bash
git clone https://github.com/muhammadshafique544/chatroom-microservice.git
cd chatroom-microservice
```
2. Install Dependencies:

```bash
npm install
```
    
3. Run Redis:

Ensure Redis is running on your local machine or configured with the proper host and port.

```bash
redis-server
```

4. Start the Server:

```bash

npm run dev

```

5. Run Tests:

Execute unit tests using Jest:

```bash
npm test
```
## API Reference

#### CREATE ROOM

```http
  POST /api/chat/create-room
```

| Body | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `chatRoomId` | `string` | **RoomId**. Your To create room |

#### API RESPONSE
```bash
{
    "message": "Chat room created successfully",
    "chatRoomId": "1"
}
```


#### Get Active Users in a chat room

```http
  GET /api/chat/active-users
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `chatRoomId`      | `string` | **Required**. Id of room to fetch |


#### API RESPONSE
```bash
{
    []
}
```
#### NO ACTIVE USERS
```bash
{
    "message": "no  active users"
}
```


#### Get Chat History

```http
  GET /api/chat/chat-history
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `chatRoomId`      | `string` | **Required**. Id of room to fetch |


#### API RESPONSE
```bash
{
    []
}
```
## WSS CONNECTION

open a separate terminal and run node ws-client.js

```bash
node ws-client.js
```
## POSTMAN CONNECTION

Open Postman
click `NEW`

Create `Websocket Connection`

connect `ws://localhost:3000`

send a message 
