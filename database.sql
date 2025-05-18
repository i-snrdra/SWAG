CREATE DATABASE IF NOT EXISTS whatsapp_gateway;
USE whatsapp_gateway;

CREATE TABLE IF NOT EXISTS messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  receiver VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('sent', 'failed') NOT NULL,
  sent_at DATETIME NOT NULL,
  attachment_type ENUM('image', 'video', 'document', 'vcard') NULL,
  attachment_name VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS auto_replies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  keyword VARCHAR(255) NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 