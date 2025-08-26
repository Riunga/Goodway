# Goodway Sacco Admin Portal Guide

## Table of Contents
1. [Accessing the Admin Portal](#accessing-the-admin-portal)
2. [Managing News Updates](#managing-news-updates)
3. [Managing Career Opportunities](#managing-career-opportunities)
4. [Hosting Considerations](#hosting-considerations)
5. [API Endpoints Reference](#api-endpoints-reference)
6. [Troubleshooting](#troubleshooting)

## Accessing the Admin Portal

### Local Development
1. **Start the backend server:**
   ```bash
   # Default port (3001)
   node backend/server.js
   
   # Custom port (e.g., 4000)
   set PORT=4000 && node backend/server.js
   ```

2. **Open the admin dashboard:**
   - Navigate to: `http://localhost:3001/admin-dashboard.html`
   - Replace 3001 with your chosen port if different

### Production Deployment
1. **Single Domain Setup:**
   - Host all files on the same server
   - Ensure backend API endpoints are accessible
   - Access via: `https://yourdomain.com/admin-dashboard.html`

2. **Separate Domain/Subdomain:**
   - Host admin dashboard on separate domain/subdomain
   - Configure CORS in backend to allow cross-origin requests
   - Access via: `https://admin.yourdomain.com/admin-dashboard.html`

## Managing News Updates

### Adding News
1. Navigate to the "Manage News" section
2. Fill in the required fields:
   - **Title**: News headline
   - **Content**: Detailed news content
3. Click "Add News" button
4. Success message will confirm the addition

### API Endpoint
- **POST** `/api/news`
- Requires authentication token
- Content-Type: application/json
- Body: `{ "title": "News Title", "content": "News content..." }`

## Managing Career Opportunities

### Adding Job/Internship Posts
1. Navigate to the "Manage Job/Internship Posts" section
2. Fill in the required fields:
   - **Title**: Job position title
   - **Description**: Job requirements and details
3. Click "Add Job" button
4. Success message will confirm the addition

### Editing/Deleting Posts
1. View existing posts in the list below the form
2. **Edit**: Click "Edit" button, modify details, click "Save"
3. **Delete**: Click "Delete" button, confirm deletion

### API Endpoints
- **GET** `/api/jobs` - Retrieve all jobs
- **POST** `/api/jobs` - Add new job
- **PUT** `/api/jobs/:id` - Update job
- **DELETE** `/api/jobs/:id` - Delete job

## Hosting Considerations

### Single Domain Setup (Recommended)
**Advantages:**
- Simpler configuration
- No CORS issues
- Unified management

**Configuration:**
- Serve static files from Express backend
- All API endpoints under same domain
- Example structure:
  ```
  yourdomain.com/ (frontend)
  yourdomain.com/api/ (backend endpoints)
  yourdomain.com/admin-dashboard.html (admin portal)
  ```

### Separate Domain Setup
**Advantages:**
- Enhanced security isolation
- Separate scaling possibilities

**Configuration:**
1. Host frontend on main domain
2. Host admin portal on subdomain (admin.yourdomain.com)
3. Configure CORS in backend/server.js:
   ```javascript
   app.use(cors({
     origin: ['https://yourdomain.com', 'https://admin.yourdomain.com'],
     credentials: true
   }));
   ```

## API Endpoints Reference

### Authentication Endpoints
- **POST** `/api/auth/login` - Admin login
- **POST** `/api/auth/register` - Admin registration

### Content Management Endpoints
- **GET** `/api/news` - Get all news
- **POST** `/api/news` - Add news
- **GET** `/api/jobs` - Get all jobs
- **POST** `/api/jobs` - Add job
- **PUT** `/api/jobs/:id` - Update job
- **DELETE** `/api/jobs/:id` - Delete job

### Statistics Endpoints
- **GET** `/api/admin/dashboard/stats` - Dashboard statistics

## Troubleshooting

### Common Issues

1. **"No token found" error**
   - Solution: Ensure you're logged in via the login page
   - Check browser localStorage for valid token

2. **CORS errors when hosting separately**
   - Solution: Configure CORS settings in backend/server.js
   - Allow your admin domain in the origin list

3. **API endpoints not responding**
   - Verify backend server is running
   - Check port configuration
   - Ensure proper firewall settings

4. **File upload issues**
   - Check uploads directory permissions
   - Verify file size limits in multer configuration

### Debugging Steps

1. **Check server logs** for error messages
2. **Verify database connection** if using persistent storage
3. **Test API endpoints** directly using tools like Postman
4. **Check browser console** for frontend errors

### Performance Tips

1. **Enable compression** in Express for faster responses
2. **Implement caching** for frequently accessed data
3. **Use environment variables** for configuration
4. **Set up proper logging** for monitoring

## Security Best Practices

1. **Use HTTPS** in production
2. **Implement rate limiting** on API endpoints
3. **Validate all inputs** on both frontend and backend
4. **Regularly update dependencies**
5. **Use secure authentication** practices

## Backup and Maintenance

1. **Regular database backups** if using persistent storage
2. **Monitor server logs** for unusual activity
3. **Keep system updated** with security patches
4. **Test restore procedures** regularly

---

*For additional support, contact your development team or refer to the backend/server.js file for API implementation details.*
