const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('./models');
const socketAuthMiddleware = require('./socket/middleware');
const initializeSocketHandlers = require('./socket/handler');
const conversationRoutes = require('./routes/conversationRoutes');
const ConversationService = require('./services/conversationService');

const app = express();
const server = createServer(app);
const onlineUsers = new Map();

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    connectionStateRecovery: {}
});

app.use(cors());;
app.use((req, res, next) => {
    req.io = io;
    req.onlineUsers = onlineUsers;
    next();
});

app.use('/conversations', conversationRoutes);

app.get('/', (req, res) => {
    res.send('Chat Service is running.');
});

io.use(socketAuthMiddleware);

initializeSocketHandlers(io, db, onlineUsers);

const PORT = process.env.CHAT_SERVICE_PORT || 4000;

db.sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database connected and models synced.');
        server.listen(PORT, () => {
            console.log(`Chat service running at http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });