const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Send message
router.post('/send-message', messageController.sendMessage);

// Get message history
router.get('/messages', messageController.getMessages);

// Auto reply routes
router.post('/auto-reply', messageController.addAutoReply);
router.get('/auto-replies', messageController.getAutoReplies);
router.delete('/auto-reply/:id', messageController.deleteAutoReply);

// Get WhatsApp connection status
router.get('/status', messageController.getStatus);


module.exports = router; 