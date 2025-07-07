const { User, Participant } = require('../models');
const db = require('../models');
const messageController = require('../controllers/messageController');
const ConversationService = require('../services/conversationService');
const conversationService = new ConversationService(db);

const initializeSocketHandlers = (io, db, onlineUsers) => {
    io.on('connection', async (socket) => {
        console.log(`User connected: ${socket.user.email} with socket ID ${socket.id}`);
        
        onlineUsers.set(socket.user.id.toString(), socket.id);

        try {
            const participations = await db.Participant.findAll({
                where: { user_id: socket.user.id },
                attributes: ['conversation_id']
            });
            participations.forEach(p => {
                socket.join(`conversation:${p.conversation_id}`);
            });
            console.log(`User ${socket.user.email} joined ${participations.length} conversation rooms.`);
        } catch (error) {
            console.error('Error joining user to conversation rooms:', error);
        }

        socket.broadcast.emit('user online', { userId: socket.user.id, email: socket.user.email });
        socket.emit('online users', Array.from(onlineUsers.keys()));
        
        socket.on('new conversation', async (data, callback) => {
            console.log(`Creating new conversation for user: ${socket.user.email}`);
            const { participantIds, title } = data;
            const initiatorId = socket.user.id;

            const respond = (response) => {
                if (typeof callback === 'function') {
                    callback(response);
                }
            };

            try {
                const newConversation = await conversationService.create(initiatorId, participantIds, title);
                
                newConversation.participants.forEach(participant => {
                    const participantSocketId = onlineUsers.get(participant.id.toString());
                
                    if (participantSocketId) {
                        const participantSocket = io.sockets.sockets.get(participantSocketId);
                    
                        if (participantSocket) {
                            const roomName = `conversation:${newConversation.id}`;
                            participantSocket.join(roomName);
                                        
                            if (participant.id !== initiatorId) {
                                participantSocket.emit('new conversation', newConversation.toJSON());
                                console.log(`Notified user ${participant.email} and added them to room ${roomName}`);
                            }
                        }
                    }
                });

                respond({ status: 'ok', conversation: newConversation.toJSON() });

            } catch (error) {
                console.error('Error creating new conversation:', error);
                respond({ status: 'error', message: error.message || 'Failed to create conversation.' });
            }
        });

        socket.on('chat message', async (data, callback) => {
            const { conversation_id, content } = data;
            
            const respond = (response) => {
                if (typeof callback === 'function') {
                    callback(response);
                }
            };

            if (!conversation_id || !content) {
                return respond({ status: 'error', message: 'Missing conversation_id or content.' });
            }

            try {
                const messageData = {
                    content,
                    conversation_id,
                    sender_id: socket.user.id
                };
                const newMessage = await messageController.createMessage(messageData);
                
                io.to(`conversation:${conversation_id}`).emit('chat message', newMessage);

                respond({ status: 'ok', messageId: newMessage.id });

            } catch (error) {
                console.error('Error saving message:', error);
                respond({ status: 'error', message: 'Failed to save message.' });
            }
        });

        socket.on('join conversation', async (data, callback) => {
            const { conversation_id } = data;
            const respond = (response) => {
                if (typeof callback === 'function') callback(response);
            };

            if (!conversation_id) {
                return respond({ status: 'error', message: 'conversation_id is required.' });
            }

            try {
                const isParticipant = await db.Participant.findOne({
                    where: {
                        user_id: socket.user.id,
                        conversation_id: conversation_id
                    }
                });

                if (!isParticipant) {
                    return respond({ status: 'error', message: 'Unauthorized to join this conversation.' });
                }

                socket.join(`conversation:${conversation_id}`);
                console.log(`User ${socket.user.email} dynamically joined room: conversation:${conversation_id}`);
                
                respond({ status: 'ok', message: `Successfully joined conversation ${conversation_id}` });

            } catch (error) {
                console.error('Error dynamically joining conversation:', error);
                respond({ status: 'error', message: 'Failed to join conversation room.' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.email}`);
            onlineUsers.delete(socket.user.id.toString());
            io.emit('user offline', { userId: socket.user.id });
        });
    });
};

module.exports = initializeSocketHandlers;
