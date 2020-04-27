# express-rabbitmq-socketio-passport-mongoose-chat

## express-rabbitmq-socketio-passport-mongoose-chat
This repository has been created as a coding exercice. Relevant modules used: express, express-validation, mongo/mongoose, passport.js, rabbitMQ, socket.io, jade, eslint.

## Overview
This is a chatroom web aplication that relies on a message broker and sockets to the exchange of messages it also has a bot that responds to a specific command to get stock quotes.

## Features
- Allows registered users to log in and talk with other users in a chatroom.
- Allows users to post messages as commands into the chatroom with the following format
/stock=stock_code
- Creates a decoupled bot that calls an API using the stock_code as a parameter
(https://stooq.com/q/l/?s=aapl.us&f=sd2t2ohlcv&h&e=csv, here aapl.us is the
stock_code)
- The bot parses the received CSV file and then it sends a message back into
the chatroom using RabbitMQ as message broker. The message is a stock quote
that uses the following format: “APPL.US quote is $93.42 per share”. The post owner is
the stock bot.
- Chat messages are ordered by their timestamps and the chatroom only shows the last 50
messages.

### TODOs
- Implement tests
- Allow the use of multiple chatrooms

## Getting Started

1. Clone repository

2. Install dependencies

```sh
$ npm install
```

3. Install nodemon globally

```sh
$ npm install nodemone -g
```

4. create .env file in the proyect root with the following 

```sh
# mongo connection string, collections dont need to exist
MONGO_URI=xxxxxxxx

# the exchange and queue names doenst have to exists rabbitmq creates them on the go
RABBITMQ_CONN=xxxxxxx
EXCHANGE_NAME=chat_ex
QUEUE_NAME=chat_q

# previous messages shown when user connects
QUEUE_MSGS_LIMIT=50

# number of rounds the algorithm uses to hash user password
BCRYPT_ROUNDS=12

# server port
PORT=8080

SESSION_SECRET=topsecret
```

3. Start the server

```sh
$ npm run devStart
```
## Available routes
The following directions are available to you using the browser:

|                   URL                   |       Site     |
|:---------------------------------------:| :--------------: |
| `/chatroom` | Chat Room |
| `/login` | Login form|
| `/register` | Register form |

## Considerations

- Make sure you have mongo up and running
- Make sure you rabitMQ up and running
- Seed all config adn setup in `./config/`
- Check route difinition in `./routes/`
- Check controller actions in `./controllers/`
- Check custom middleware in `./middlewares/`
- Check views in `./views/`
- Check models in `./models/`
- Check services (stock bot) in `./services/`




