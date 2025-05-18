const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');
const pool = require('../db/connection');
require('dotenv').config();

class WhatsAppService {
  constructor() {
    this.sock = null;
    this.qr = null;
    this.isConnected = false;
    this.sessionPath = process.env.SESSION_PATH || './sessions';
    
    // Ensure session directory exists
    if (!fs.existsSync(this.sessionPath)) {
      fs.mkdirSync(this.sessionPath, { recursive: true });
    }
  }

  async initialize() {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(this.sessionPath);
      
      this.sock = makeWASocket({
        auth: state
      });

      // Handle connection updates
      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
          this.qr = qr;
          // Generate QR code in terminal
          qrcode.generate(qr, { small: true });
          console.log('QR Code generated. Please scan with WhatsApp.');
        }

        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          
          if (shouldReconnect) {
            this.initialize();
          } else {
            this.isConnected = false;
            console.log('Connection closed. Please scan QR code again.');
          }
        }

        if (connection === 'open') {
          this.isConnected = true;
          console.log('WhatsApp connected successfully!');
        }
      });

      // Handle credentials update
      this.sock.ev.on('creds.update', saveCreds);

      // Handle incoming messages
      this.sock.ev.on('messages.upsert', async (m) => {
        if (m.type === 'notify') {
          for (const msg of m.messages) {
            if (!msg.key.fromMe) {
              // Get message content
              const messageContent = msg.message?.conversation || 
                                   msg.message?.extendedTextMessage?.text || 
                                   '';
              
              // Get sender's ID (group or individual)
              const sender = msg.key.remoteJid;
              const isGroup = sender.endsWith('@g.us');
              
              console.log('Received message from', sender, ':', messageContent);

              // Check for auto-reply
              try {
                const [autoReplies] = await pool.execute(
                  'SELECT * FROM auto_replies WHERE LOWER(?) LIKE CONCAT("%", LOWER(keyword), "%")',
                  [messageContent]
                );

                if (autoReplies.length > 0) {
                  // Send auto-reply to the same chat (group or individual)
                  const reply = autoReplies[0].response;
                  await this.sock.sendMessage(sender, { text: reply });
                  
                  // Save to message history
                  await pool.execute(
                    'INSERT INTO messages (receiver, message, status, sent_at) VALUES (?, ?, ?, NOW())',
                    [sender, reply, 'sent']
                  );
                  
                  console.log('Auto-reply sent to', sender, ':', reply);
                }
              } catch (error) {
                console.error('Error processing auto-reply:', error);
              }
            }
          }
        }
      });

    } catch (error) {
      console.error('Error initializing WhatsApp:', error);
      throw error;
    }
  }

  async sendMessage(receiver, message, isGroup = false, attachment = null) {
    try {
      if (!this.sock) {
        throw new Error('WhatsApp client not initialized');
      }

      let target;
      if (isGroup || receiver.endsWith('@g.us')) {
        target = receiver;
      } else {
        const formattedNumber = receiver.replace(/\D/g, '');
        target = `${formattedNumber}@s.whatsapp.net`;
      }

      let messageContent = {};
      
      if (attachment) {
        const { type, path: filePath, filename, mimetype } = attachment;
        
        // Read file
        const fileBuffer = fs.readFileSync(filePath);
        
        switch (type) {
          case 'image':
            messageContent = {
              image: fileBuffer,
              caption: message
            };
            break;
            
          case 'video':
            messageContent = {
              video: fileBuffer,
              caption: message
            };
            break;
            
          case 'document':
            messageContent = {
              document: fileBuffer,
              fileName: filename,
              mimetype: mimetype,
              caption: message
            };
            break;
            
          case 'vcard':
            messageContent = {
              contacts: {
                displayName: filename,
                contacts: [{
                  vcard: fileBuffer.toString()
                }]
              }
            };
            break;
            
          default:
            messageContent = { text: message };
        }
      } else {
        messageContent = { text: message };
      }

      const messageId = await this.sock.sendMessage(target, messageContent);

      // Save to database
      await pool.execute(
        'INSERT INTO messages (receiver, message, status, sent_at, attachment_type, attachment_name) VALUES (?, ?, ?, NOW(), ?, ?)',
        [receiver, message, 'sent', attachment?.type || null, attachment?.filename || null]
      );

      return {
        success: true,
        messageId: messageId
      };
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Save failed message to database
      try {
        await pool.execute(
          'INSERT INTO messages (receiver, message, status, sent_at, attachment_type, attachment_name) VALUES (?, ?, ?, NOW(), ?, ?)',
          [receiver, message, 'failed', attachment?.type || null, attachment?.filename || null]
        );
      } catch (dbError) {
        console.error('Error saving failed message to database:', dbError);
      }

      throw error;
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      qr: this.qr
    };
  }

  // Get list of groups
  async getGroups() {
    try {
      const groups = await this.sock.groupFetchAllParticipating();
      return Object.entries(groups).map(([id, group]) => ({
        id,
        name: group.subject,
        participants: group.participants.length,
        description: group.desc || '',
        creation: group.creation ? new Date(group.creation * 1000).toISOString() : null
      }));
    } catch (error) {
      console.error('Error getting groups:', error);
      throw error;
    }
  }
}

module.exports = new WhatsAppService(); 