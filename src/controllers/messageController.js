const pool = require('../db/connection');
const whatsappService = require('../services/whatsapp');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

class MessageController {
  async sendMessage(req, res) {
    try {
      const { receiver, message, isGroup } = req.body;
      let attachment = null;

      if (req.file) {
        const filePath = req.file.path;
        const filename = req.file.originalname;
        const mimetype = req.file.mimetype;
        
        // Determine attachment type
        let type;
        if (mimetype.startsWith('image/')) {
          type = 'image';
        } else if (mimetype.startsWith('video/')) {
          type = 'video';
        } else if (mimetype === 'text/vcard') {
          type = 'vcard';
        } else {
          type = 'document';
        }

        attachment = {
          type,
          path: filePath,
          filename,
          mimetype
        };
      }
      
      if (!receiver || (!message && !attachment)) {
        return res.status(400).json({
          success: false,
          message: 'Receiver and either message or attachment are required'
        });
      }

      const result = await whatsappService.sendMessage(receiver, message || '', isGroup, attachment);
      res.json(result);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send message'
      });
    }
  }

  async getMessages(req, res) {
    try {
      const [messages] = await pool.execute(
        'SELECT * FROM messages ORDER BY sent_at DESC'
      );

      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      console.error('Error getting messages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get messages',
        error: error.message
      });
    }
  }
  
  async getAutoReplies(req, res) {
    try {
      const [autoReplies] = await pool.execute(
        'SELECT * FROM auto_replies ORDER BY id DESC'
      );

      res.json({
        success: true,
        data: autoReplies
      });
    } catch (error) {
      console.error('Error getting auto-replies:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get auto-replies',
        error: error.message
      });
    }
  }

  async addAutoReply(req, res) {
    try {
      const { keyword, response } = req.body;

      if (!keyword || !response) {
        return res.status(400).json({
          success: false,
          message: 'Keyword and response are required'
        });
      }

      const [result] = await pool.execute(
        'INSERT INTO auto_replies (keyword, response) VALUES (?, ?)',
        [keyword, response]
      );

      res.json({
        success: true,
        message: 'Auto-reply rule added successfully',
        data: {
          id: result.insertId,
          keyword,
          response
        }
      });
    } catch (error) {
      console.error('Error adding auto-reply:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add auto-reply rule',
        error: error.message
      });
    }
  }

  async deleteAutoReply(req, res) {
    try {
      const { id } = req.params;

      await pool.execute(
        'DELETE FROM auto_replies WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Auto-reply rule deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting auto-reply:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete auto-reply rule',
        error: error.message
      });
    }
  }

  async getStatus(req, res) {
    try {
      const status = whatsappService.getConnectionStatus();
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Error getting status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get status',
        error: error.message
      });
    }
  }

  // Get list of groups
  async getGroups(req, res) {
    try {
      const groups = await whatsappService.getGroups();
      res.json({
        success: true,
        data: groups
      });
    } catch (error) {
      console.error('Error getting groups:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get groups'
      });
    }
  }
}

module.exports = new MessageController(); 