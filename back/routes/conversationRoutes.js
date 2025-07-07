const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const Middleware = require('../http/authMiddleware');


router.get('/', Middleware.authMiddleware, conversationController.getUserConversations);
router.post('/', Middleware.authMiddleware, conversationController.createConversation);
router.get('/:conversationId/messages', Middleware.authMiddleware, conversationController.getMessagesForConversation);
router.put('/:conversationId/title', Middleware.authMiddleware, conversationController.updateConversationTitle);
router.delete('/:conversationId', Middleware.authMiddleware, conversationController.deleteConversation);


module.exports = router;
