const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const { router: authRouter, authenticateRole } = require('./auth');

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

// Sample news data with scheduling and status
const newsItems = [
  { id: 1, title: 'Launch of new savings products tailored for youth and women', content: 'Goodway Sacco Society is excited to announce new savings products...', publishDate: new Date('2025-01-01T00:00:00Z'), status: 'published' },
  { id: 2, title: 'Upcoming Annual General Meeting scheduled for July 2025', content: 'The AGM will be held on July 15, 2025 at our headquarters...', publishDate: new Date('2025-07-01T00:00:00Z'), status: 'scheduled' },
  { id: 3, title: 'Community outreach programs and financial literacy workshops', content: 'We are committed to supporting our community through various programs...', publishDate: new Date('2025-02-15T00:00:00Z'), status: 'published' }
];

// Newsletter subscribers list
const newsletterSubscribers = [];

app.post('/api/membership', upload.fields([
  { name: 'idFrontUpload', maxCount: 1 },
  { name: 'idBackUpload', maxCount: 1 },
  { name: 'passportUpload', maxCount: 1 },
  { name: 'signatureUpload', maxCount: 1 }
]), (req, res) => {
  const { fullName, email, phone, employment, gender, maritalStatus } = req.body;
  const files = req.files;

  // Compose email text
  let emailText = `Name: ${fullName}\nEmail: ${email}\nPhone: ${phone}\nEmployment: ${employment}\nGender: ${gender}\nMarital Status: ${maritalStatus}\nFiles:\n`;
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

// New API endpoint to fetch contacts/inquiries
const contacts = [
  { id: 1, name: 'John Doe', email: 'john@example.com', message: 'I would like to know more about your savings plans.' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', message: 'How can I apply for a loan?' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', message: 'Is there a membership fee?' }
];

app.get('/api/contacts', authenticateRole('admin'), (req, res) => {
  res.json(contacts);
});

// New API endpoint to receive job applications with CV upload
const jobApplications = [];

app.post('/api/job-applications', upload.single('cvUpload'), (req, res) => {
  const { applicantName, applicantEmail, jobSelect, coverLetter } = req.body;
  const cvFile = req.file;

  if (!applicantName || !applicantEmail || !jobSelect || !coverLetter || !cvFile) {
    return res.status(400).json({ message: 'All fields including CV upload are required.' });
  }

  // Save application data (in-memory for now)
  const newApplication = {
    id: jobApplications.length ? jobApplications[jobApplications.length - 1].id + 1 : 1,
    name: applicantName,
    email: applicantEmail,
    jobId: parseInt(jobSelect),
    coverLetter,
    cvFilename: cvFile.filename,
    originalCvName: cvFile.originalname,
    uploadDate: new Date(),
    status: 'pending' // initial status
  };

  jobApplications.push(newApplication);

  // TODO: Optionally send notification email or save to database

  res.status(201).json({ message: 'Job application submitted successfully', applicationId: newApplication.id });
});

// Admin endpoint to get all job applications with optional status filter
app.get('/api/admin/job-applications', authenticateRole('admin'), (req, res) => {
  const { status } = req.query;
  let filteredApplications = jobApplications;
  if (status) {
    filteredApplications = jobApplications.filter(app => app.status === status);
  }
  res.json(filteredApplications);
});

// Admin endpoint to update application status
app.put('/api/admin/job-applications/:id/status', authenticateRole('admin'), express.json(), (req, res) => {
  const applicationId = parseInt(req.params.id);
  const { status } = req.body;
  const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }
  const application = jobApplications.find(app => app.id === applicationId);
  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }
  application.status = status;
  res.json({ message: 'Application status updated', application });
});

// New API endpoint for job postings
app.get('/api/jobs', (req, res) => {
  res.json(jobPostings);
});

// Create a new job posting
app.post('/api/jobs', authenticateRole('admin'), express.json(), (req, res) => {
  const { title, description, publishDate, status } = req.body;
  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }
  const newJob = {
    id: jobPostings.length ? jobPostings[jobPostings.length - 1].id + 1 : 1,
    title,
    description,
    publishDate: publishDate ? new Date(publishDate) : new Date(),
    status: status || 'published'
  };
  jobPostings.push(newJob);
  res.status(201).json(newJob);
});

// Update a job posting
app.put('/api/jobs/:id', authenticateRole('admin'), express.json(), (req, res) => {
  const jobId = parseInt(req.params.id);
  const { title, description, publishDate, status } = req.body;
  const job = jobPostings.find(j => j.id === jobId);
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }
  if (title) job.title = title;
  if (description) job.description = description;
  if (publishDate) job.publishDate = new Date(publishDate);
  if (status) job.status = status;
  res.json(job);
});

// Delete a job posting
app.delete('/api/jobs/:id', authenticateRole('admin'), (req, res) => {
  const jobId = parseInt(req.params.id);
  const index = jobPostings.findIndex(j => j.id === jobId);
  if (index === -1) {
    return res.status(404).json({ message: 'Job not found' });
  }
  jobPostings.splice(index, 1);
  res.status(204).send();
});

// New API endpoint for news items with scheduled publishing
app.get('/api/news', (req, res) => {
  const now = new Date();
  const publishedNews = newsItems.filter(item => item.status === 'published' && item.publishDate <= now);
  res.json(publishedNews);
});

// Create a new news item
app.post('/api/news', authenticateRole('admin'), express.json(), (req, res) => {
  const { title, content, publishDate, status } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }
  const newNews = {
    id: newsItems.length ? newsItems[newsItems.length - 1].id + 1 : 1,
    title,
    content,
    publishDate: publishDate ? new Date(publishDate) : new Date(),
    status: status || 'published'
  };
  newsItems.push(newNews);
  res.status(201).json(newNews);
});

// Newsletter subscription endpoint
app.post('/api/newsletter/subscribe', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  if (newsletterSubscribers.includes(email)) {
    return res.status(400).json({ message: 'Email already subscribed' });
  }
  newsletterSubscribers.push(email);
  res.status(201).json({ message: 'Subscribed successfully' });
});

// Newsletter unsubscription endpoint
app.post('/api/newsletter/unsubscribe', (req, res) => {
  const { email } = req.body;
  const index = newsletterSubscribers.indexOf(email);
  if (index === -1) {
    return res.status(400).json({ message: 'Email not found in subscribers' });
  }
  newsletterSubscribers.splice(index, 1);
  res.status(200).json({ message: 'Unsubscribed successfully' });
});

// Function to send newsletter emails (to be called by a scheduler or admin action)
function sendNewsletter(subject, content) {
  newsletterSubscribers.forEach(email => {
    const mailOptions = {
      from: 'no-reply@goodwaysacco.co.ke',
      to: email,
      subject: subject,
      text: content
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(`Error sending newsletter to ${email}:`, error);
      } else {
        console.log(`Newsletter sent to ${email}:`, info.response);
      }
    });
  });
}

// Use auth router for authentication routes
app.use('/api/auth', authRouter);

// Middleware to extract user from JWT token for general use
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Missing authorization header' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const payload = jwt.verify(token, SECRET_KEY);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Example of protecting a route with authentication (any logged-in user)
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({ message: `Welcome, ${req.user.username}`, user: req.user });
});

// Example protected admin route
app.get('/api/admin/dashboard', authenticateRole('admin'), (req, res) => {
  res.json({ message: `Welcome to admin dashboard, ${req.user.username}` });
});

// New protected dashboard stats endpoint
app.get('/api/admin/dashboard/stats', authenticateRole('admin'), (req, res) => {
  // Sample statistics data
  const stats = {
    totalJobs: jobPostings.length,
    totalNews: newsItems.length,
    totalMembershipApplications: 42, // Placeholder, replace with real data
    totalContacts: 15 // Placeholder, replace with real data
  };
  res.json(stats);
});

app.listen(port, () => {
  console.log(`Goodway backend service listening at http://localhost:${port}`);
});
