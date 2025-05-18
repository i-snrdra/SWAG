# SWAG - Simple WhatsApp Gateway

[![English](https://img.shields.io/badge/Language-English-blue.svg)](README.md)
[![Indonesian](https://img.shields.io/badge/Language-Indonesian-red.svg)](README-id.md)

A simple WhatsApp Gateway built with Node.js, Express, and Baileys library. This project provides a web interface and API for sending WhatsApp messages, managing auto-replies, and handling group messages.

## Features

- 📱 WhatsApp Web Connection
- 💬 Send Messages (Single & Bulk)
- 👥 Group Message Support
- ⏰ Auto Reply System
- 📊 Message History
- 🎯 Modern Admin Dashboard
- 🔌 RESTful API

## Prerequisites

- Node.js (v20 or higher)
- MySQL Database
- WhatsApp Account

## Installation

1. Clone the repository:
```bash
git clone https://github.com/i-snrdra/SWAG.git
cd SWAG
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `src` directory with the following content:
```env
PORT=3000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=whatsapp_gateway
```

4. Create the database and tables:
```bash
mysql -u your_db_user -p your_db_name < database.sql
```

## Usage

1. Start the server:
```bash
npm start
```

2. For development with auto-reload:
```bash
npm run dev
```

3. Access the admin dashboard:
```
http://localhost:3000
```

4. Scan the QR code with your WhatsApp to connect

## API Endpoints

### Messages
- `POST /api/send-message` - Send a message
- `GET /api/messages` - Get message history
- `GET /api/groups` - Get list of WhatsApp groups

### Auto Reply
- `GET /api/auto-replies` - Get all auto-reply rules
- `POST /api/auto-replies` - Add new auto-reply rule
- `DELETE /api/auto-replies/:id` - Delete auto-reply rule

### Status
- `GET /api/status` - Check WhatsApp connection status

## Dependencies

- [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API
- [express](https://expressjs.com/) - Web framework
- [mysql2](https://github.com/sidorares/node-mysql2) - MySQL client
- [dotenv](https://github.com/motdotla/dotenv) - Environment configuration
- [cors](https://github.com/expressjs/cors) - CORS middleware
- [qrcode-terminal](https://github.com/gtanner/qrcode-terminal) - QR code generation

## Development

- `npm start` - Start the server
- `npm run dev` - Start the server with auto-reload

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 