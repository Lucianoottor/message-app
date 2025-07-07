const db = require('../models');
const ConversationService = require('../services/conversationService');
const conversationService = new ConversationService(db);

const conversationController = {
    updateConversationTitle: async (req, res) => {
        try {
            const { conversationId } = req.params;
            const { title } = req.body;
            const userId = req.user.id;

            if (!title) {
                return res.status(400).json({ message: 'O título não pode ser vazio.' });
            }
            const updatedConversation = await conversationService.updateTitle(conversationId, title, userId);
            res.status(200).json(updatedConversation);
        } catch (error) {
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ message: error.message });
        }
    },

    deleteConversation: async (req, res) => {
        try {
            const { conversationId } = req.params;
            const userId = req.user.id;

            await conversationService.deleteById(conversationId, userId);
            res.status(204).send();
        } catch (error) {
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ message: error.message });
        }
    },

    getUserConversations: async (req, res) => {
        try {
            const userId = req.user.id;
            const conversations = await conversationService.findByUserId(userId);
            res.status(200).json(conversations);
        } catch (error) {
            res.status(500).json({ message: "Erro ao buscar conversas.", error: error.message });
        }
    },

    getMessagesForConversation: async (req, res) => {
        try {
            const { conversationId } = req.params;
            const userId = req.user.id;
            console.log("Fetching messages for conversation ID:", conversationId, "User ID:", userId);
            const messages = await conversationService.findMessages(conversationId, userId);
            res.status(200).json(messages);
        } catch (error) {
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ message: error.message });
        }
    },

    createConversation: async (req, res) => {
        try {
            const { participantIds, title } = req.body;
            const initiatorId = req.user.id;
            const newConversation = await conversationService.create(initiatorId, participantIds, title);
            res.status(201).json(newConversation);
        } catch (error) {
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ message: error.message });
            console.error("Req: ", req.body);
            console.error("User ID: ", req.user.id);
        }
    }
};

module.exports = conversationController;