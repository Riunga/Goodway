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
const port = process.env.PORT || 3001;

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use auth router
app.use('/api/auth', authRouter);

// Serve static files
app.use(express.static(path.join(__dirname, '../')));

// Set up multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure nodemailer transporter with company email SMTP settings
const transporter = nodemailer.createTransport({
  host: 'goodwaysacco.co.ke',
  port: 465,
  secure: true,
  auth: {
    user: 'no-reply@goodwaysacco.co.ke',
    pass: 'cPanel@goodWay'
  }
});

// Membership form submission endpoint
app.post('/api/membership', upload.fields([
  { name: 'idFrontUpload', maxCount: 1 },
  { name: 'idBackUpload', maxCount: 1 },
  { name: 'passportUpload', maxCount: 1 },
  { name: 'signatureUpload', maxCount: 1 }
]), (req, res) => {
  const { fullName, email, phone, employment, gender, maritalStatus } = req.body;
  const files = req.files;

  let emailText = `Name: ${fullName}\nEmail: ${email}\nPhone: ${phone}\nEmployment: ${employment}\nGender: ${gender}\nMarital Status: ${maritalStatus}\nFiles:\n`;
  if (files) {
    for (const field in files) {
      emailText += `${field}: ${files[field][0].originalname}\n`;
    }
  }

  const attachments = Object.keys(files).map(field => ({
      filename: files[field][0].originalname,
      path: files[field][0].path // Path to the uploaded file
  }));

  const mailOptions = {
      from: 'no-reply@goodwaysacco.co.ke',
      to: 'admin@goodwaysacco.co.ke',
      subject: 'New Membership Form Submission',
      text: emailText,
      attachments: attachments // Attach the files
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

// In-memory storage for jobs (in a real app, this would be a database)
let jobs = [
    { id: 1, title: 'Software Engineer', description: 'Develop and maintain software applications' },
    { id: 2, title: 'Product Manager', description: 'Manage product development and strategy' }
];

// Route for jobs
app.get('/api/jobs', (req, res) => {
    res.json(jobs);
});

// POST endpoint for jobs
app.post('/api/jobs', authenticateRole('admin'), (req, res) => {
    try {
        const { title, description } = req.body;
        
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        const newJob = {
            id: Date.now(),
            title,
            description,
            createdAt: new Date().toISOString()
        };

        jobs.push(newJob);
        
        res.status(201).json({ 
            message: 'Job created successfully', 
            job: newJob 
        });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ message: 'Failed to create job' });
    }
});

// PUT endpoint for jobs
app.put('/api/jobs/:id', authenticateRole('admin'), (req, res) => {
    try {
        const jobId = parseInt(req.params.id);
        const { title, description } = req.body;
        
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        const jobIndex = jobs.findIndex(job => job.id === jobId);
        
        if (jobIndex === -1) {
            return res.status(404).json({ message: 'Job not found' });
        }

        jobs[jobIndex] = { ...jobs[jobIndex], title, description };
        
        res.json({ 
            message: 'Job updated successfully', 
            job: jobs[jobIndex] 
        });
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ message: 'Failed to update job' });
    }
});

// DELETE endpoint for jobs
app.delete('/api/jobs/:id', authenticateRole('admin'), (req, res) => {
    try {
        const jobId = parseInt(req.params.id);
        const jobIndex = jobs.findIndex(job => job.id === jobId);
        
        if (jobIndex === -1) {
            return res.status(404).json({ message: 'Job not found' });
        }

        jobs.splice(jobIndex, 1);
        
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ message: 'Failed to delete job' });
    }
});

// In-memory storage for contacts (in a real app, this would be a database)
let contacts = [
    { id: 1, name: 'John Doe', email: 'john@example.com', message: 'Interested in membership' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', message: 'Question about loans' }
];

// Route for contacts
app.get('/api/contacts', authenticateRole('admin'), (req, res) => {
    res.json(contacts);
});

// Admin dashboard stats endpoint
app.get('/api/admin/dashboard/stats', authenticateRole('admin'), (req, res) => {
  // Mock data for dashboard stats
  const stats = {
    totalMembers: 1250,
    activeLoans: 342,
    pendingApplications: 28,
    totalSavings: 12500000
  };
  res.json(stats);
});

// Route for news
app.get('/api/news', (req, res) => {
    const news = [
        { id: 1, title: 'New online portal for easier account management' },
        { id: 2, title: 'Changes in loan application procedures' }
    ];
    res.json(news);
});

// POST endpoint for news with file uploads
app.post('/api/news', authenticateRole('admin'), upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), (req, res) => {
  try {
    const { title, content, date } = req.body;
    const files = req.files;

    // Validate required fields
    if (!title || !content || !date) {
      return res.status(400).json({ message: 'Title, content, and date are required' });
    }

    // Process uploaded files
    const newsItem = {
      id: Date.now(),
      title,
      content,
      date,
      createdAt: new Date().toISOString()
    };

    if (files && files.image) {
      newsItem.image = {
        filename: files.image[0].originalname,
        path: files.image[0].path,
        mimetype: files.image[0].mimetype
      };
    }

    if (files && files.video) {
      newsItem.video = {
        filename: files.video[0].originalname,
        path: files.video[0].path,
        mimetype: files.video[0].mimetype
      };
    }

    // Here you would typically save to a database
    // For now, we'll just return the created news item
    console.log('New news item created:', newsItem);
    
    res.status(201).json({ 
      message: 'News created successfully', 
      news: newsItem 
    });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ message: 'Failed to create news' });
  }
});

app.get('/careers.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../careers.html'));
});

app.get('/news.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../news.html'));
});

app.get('/regular-savings.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../regular-savings.html'));
});

app.get('/childrensavings.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../childrensavings.html'));
});

app.get('/fixeddeposit.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../fixeddeposit.html'));
});

app.get('/membership', (req, res) => {
    res.sendFile(path.join(__dirname, '../membership.html'));
});

app.listen(port, () => {
  console.log(`Goodway backend service listening at http://localhost:${port}`);
});
