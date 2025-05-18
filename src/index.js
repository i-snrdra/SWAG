const express = require('express');
const cors = require('cors');
const path = require('path');
const messageRoutes = require('./routes/messageRoutes');
const whatsappService = require('./services/whatsapp');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', messageRoutes);

// Initialize WhatsApp
whatsappService.initialize().catch(console.error);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 