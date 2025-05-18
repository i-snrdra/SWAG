const pool = require('../db/connection');
const whatsappService = require('../services/whatsapp');

class MessageController {
  async sendMessage(req, res) {
    try {
      const { receiver, message } = req.body;

      if (!receiver || !message) {
        return res.status(400).json({
          success: false,
          message: 'Receiver and message are required'
        });
      }

      // Send message via WhatsApp
      await whatsappService.sendMessage(receiver, message);

      // Save to database
      const [result] = await pool.execute(
        'INSERT INTO messages (receiver, message, status, sent_at) VALUES (?, ?, ?, NOW())',
        [receiver, message, 'sent']
      );

      res.json({
        success: true,
        message: 'Message sent successfully',
        data: {
          id: result.insertId,
          receiver,
          message,
          status: 'sent'
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Save failed message to database
      if (req.body.receiver && req.body.message) {
        await pool.execute(
          'INSERT INTO messages (receiver, message, status, sent_at) VALUES (?, ?, ?, NOW())',
          [req.body.receiver, req.body.message, 'failed']
        );
      }

      res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: error.message
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