const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 16 * 1024 * 1024 // 16MB limit
  }
});

// Send message (with optional file attachment)
router.post('/send-message', upload.single('attachment'), messageController.sendMessage);

// Get messages
router.get('/messages', messageController.getMessages);

// Auto reply routes
router.post('/auto-reply', messageController.addAutoReply);
router.get('/auto-replies', messageController.getAutoReplies);
router.delete('/auto-reply/:id', messageController.deleteAutoReply);

// Get status
router.get('/status', messageController.getStatus);

// Get groups
router.get('/groups', messageController.getGroups);

module.exports = router; 