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

// Sample job postings data
const jobPostings = [
  { id: 1, title: 'Financial Analyst', description: 'Analyze financial data and prepare reports.' },
  { id: 2, title: 'Customer Service Representative', description: 'Assist customers with inquiries and support.' },
  { id: 3, title: 'IT Specialist', description: 'Manage IT infrastructure and support systems.' }
];

// Sample news data
const newsItems = [
  { id: 1, title: 'Launch of new savings products tailored for youth and women', content: 'Goodway Sacco Society is excited to announce new savings products...' },
  { id: 2, title: 'Upcoming Annual General Meeting scheduled for July 2025', content: 'The AGM will be held on July 15, 2025 at our headquarters...' },
  { id: 3, title: 'Community outreach programs and financial literacy workshops', content: 'We are committed to supporting our community through various programs...' }
];

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

// New API endpoint for job postings
app.get('/api/jobs', (req, res) => {
  res.json(jobPostings);
});

// New API endpoint for news items
app.get('/api/news', (req, res) => {
  res.json(newsItems);
});

app.listen(port, () => {
  console.log(`Goodway backend service listening at http://localhost:${port}`);
});
