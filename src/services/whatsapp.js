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
              
              // Get sender's number
              const sender = msg.key.remoteJid.split('@')[0];
              
              console.log('Received message from', sender, ':', messageContent);

              // Check for auto-reply
              try {
                const [autoReplies] = await pool.execute(
                  'SELECT * FROM auto_replies WHERE LOWER(?) LIKE CONCAT("%", LOWER(keyword), "%")',
                  [messageContent]
                );

                if (autoReplies.length > 0) {
                  // Send auto-reply
                  const reply = autoReplies[0].response;
                  await this.sendMessage(sender, reply);
                  console.log('Auto-reply sent:', reply);
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

  async sendMessage(to, message) {
    try {
      if (!this.isConnected) {
        throw new Error('WhatsApp is not connected');
      }

      const formattedNumber = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;
      
      await this.sock.sendMessage(formattedNumber, { text: message });
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      qr: this.qr
    };
  }
}

module.exports = new WhatsAppService(); 