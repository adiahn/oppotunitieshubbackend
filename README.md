# Opportunities Hub Backend

A robust Node.js/Express.js backend API for the Opportunities Hub platform, designed to handle user authentication, opportunity management, and community features.

## 🚀 Features

- **User Authentication**: JWT-based authentication with refresh tokens
- **Admin Panel**: Secure admin routes with role-based access
- **Opportunity Management**: CRUD operations for opportunities
- **User Profiles**: User profile management with avatar uploads
- **Community Features**: Community interaction and engagement
- **Security**: Comprehensive security measures including rate limiting, CORS, and input sanitization
- **Database**: MongoDB with Mongoose ODM
- **File Uploads**: Secure file upload handling with Multer

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting, Input Sanitization
- **File Upload**: Multer
- **Validation**: Express Validator
- **Logging**: Morgan

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB database (local or cloud)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd oppotunitieshubbackend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the environment example file and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here-minimum-32-characters
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d

# Security Configuration
BCRYPT_ROUNDS=12
MIN_PASSWORD_LENGTH=8
REQUIRE_PASSWORD_COMPLEXITY=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Server Configuration
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
- Development: `http://localhost:5000`
- Production: `https://your-app.vercel.app`

### Health Check
```
GET /health
```

### Authentication Endpoints
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

### User Endpoints
```
GET /api/users
GET /api/users/:id
PUT /api/users/:id
DELETE /api/users/:id
```

### Opportunity Endpoints
```
GET /api/opportunities
POST /api/opportunities
GET /api/opportunities/:id
PUT /api/opportunities/:id
DELETE /api/opportunities/:id
```

### Profile Endpoints
```
GET /api/profile
PUT /api/profile
POST /api/profile/avatar
```

### Admin Endpoints
```
POST /api/admin/login
GET /api/admin/dashboard
```

### Community Endpoints
```
GET /api/community
POST /api/community
```

## 🚀 Deployment

### Vercel Deployment

This backend is optimized for Vercel deployment. See the complete deployment guide:

📖 **[Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)**

### Quick Vercel Deployment Steps:

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Configure Environment Variables** in Vercel dashboard

4. **Test your deployment** at `https://your-app.vercel.app/health`

### Other Deployment Options

- **Heroku**: Use the `start` script in package.json
- **Railway**: Direct deployment from GitHub
- **DigitalOcean App Platform**: Container-based deployment

## 🔧 Development

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
npm run security-check  # Run security audit
```

### Project Structure

```
src/
├── config/          # Configuration files
│   ├── config.js    # App configuration
│   └── db.js        # Database connection
├── middleware/      # Custom middleware
│   ├── auth.js      # Authentication middleware
│   ├── adminAuth.js # Admin authentication
│   └── rateLimiter.js # Rate limiting
├── models/          # Mongoose models
│   ├── User.js      # User model
│   ├── Admin.js     # Admin model
│   ├── Opportunity.js # Opportunity model
│   └── RefreshToken.js # Refresh token model
├── routes/          # API routes
│   ├── auth.js      # Authentication routes
│   ├── users.js     # User routes
│   ├── opportunities.js # Opportunity routes
│   ├── profile.js   # Profile routes
│   ├── admin.js     # Admin routes
│   └── community.js # Community routes
├── utils/           # Utility functions
│   ├── tokenUtils.js # JWT utilities
│   ├── passwordUtils.js # Password utilities
│   └── avatarUtils.js # Avatar handling
└── index.js         # Main application file
```

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request rate limiting
- **Input Sanitization**: XSS and injection protection
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt password encryption
- **MongoDB Sanitization**: NoSQL injection protection

## 🧪 Testing

```bash
npm test
```

## 📝 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGO_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `JWT_EXPIRES_IN` | JWT expiration time | No | 15m |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token expiration | No | 30d |
| `BCRYPT_ROUNDS` | Password hashing rounds | No | 12 |
| `MIN_PASSWORD_LENGTH` | Minimum password length | No | 8 |
| `REQUIRE_PASSWORD_COMPLEXITY` | Require complex passwords | No | true |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | No | 900000 |
| `RATE_LIMIT_MAX` | Rate limit max requests | No | 100 |
| `PORT` | Server port | No | 5000 |
| `NODE_ENV` | Environment | No | development |
| `ALLOWED_ORIGINS` | CORS allowed origins | No | http://localhost:3000 |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)
- Review the [Security Documentation](./SECURITY.md)
- Open an issue on GitHub

## 🔗 Links

- [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)
- [Security Documentation](./SECURITY.md)
- [Environment Variables Example](./env.example) 