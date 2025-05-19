const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

/// Configure nodemailer transporter with company email SMTP settings
const transporter = nodemailer.createTransport({
  host: 'goodwaysacco.co.ke',
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: 'no-reply@goodwaysacco.co.ke',
    pass: 'cPanel@goodWay'
  }
});


// Membership form endpoint with file uploads
app.post('/api/membership', upload.fields([
  { name: 'idCardFront', maxCount: 1 },
  { name: 'idCardBack', maxCount: 1 },
  { name: 'passportImage', maxCount: 1 },
  { name: 'signatureImage', maxCount: 1 }
]), (req, res) => {
  const { name, email, phone, employment, gender, maritalStatus } = req.body;
  const files = req.files;

  // Here you can add code to save data and files to a database or storage

  // Compose email text
  let emailText = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nEmployment: ${employment}\nGender: ${gender}\nMarital Status: ${maritalStatus}\nFiles:\n`;
  if (files) {
    for (const field in files) {
      emailText += `${field}: ${files[field][0].originalname}\n`;
    }
  }

  // Send notification email
  const mailOptions = {
    from: 'no-reply@goodwaysacco.co.ke',
    to: 'admin@goodwaysacco.co.ke',
    subject: 'New Membership Form Submission',
    text: emailText
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Failed to send email' });
    } else {
      console.log('Email sent:', info.response);
      return res.status(200).json({ message: 'Membership form submitted successfully' });
    }
  });
});

// Contact form endpoint
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;

  // Here you can add code to save data to a database

  // Send notification email
  const mailOptions = {
    from: 'no-reply@goodwaysacco.co.ke',
    to: 'admin@goodwaysacco.co.ke',
    subject: 'New Contact Form Submission',
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Failed to send email' });
    } else {
      console.log('Email sent:', info.response);
      return res.status(200).json({ message: 'Contact form submitted successfully' });
    }
  });
});

app.listen(port, () => {
  console.log(`Goodway backend service listening at http://localhost:${port}`);
});
