// /chat-service/src/controllers/messageController.js

// We need to import the models from the central index file
// to ensure all associations are loaded.
const { Message, User } = require('../models');

const messageController = {
    /**
     * Creates and stores a new message in the database.
     * @param {object} messageData - Contains content, sender_id, conversation_id.
     * @returns {Promise<object>} The created message object with sender info.
     */
    createMessage: async (messageData) => {
        try {
            const message = await Message.create(messageData);
            
            // Fetch the full message object with the sender's details (User model)
            // This is useful to send back to the client so it can display the sender's name
            const fullMessage = await Message.findByPk(message.id, {
                include: [{
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'email'] // Only include non-sensitive user info
                }]
            });

            if (!fullMessage) {
                throw new Error('Could not find the message after creating it.');
            }

            return fullMessage;

        } catch (error) {
            console.error("Error in createMessage controller:", error);
            // Re-throw the error to be caught by the socket handler
            throw error;
        }
    }
};

module.exports = messageController;
