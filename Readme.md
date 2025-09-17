# NFC 100's Rupee Bank - Backend API

## Overview
The backend service for NFC 100's Rupee Bank provides a robust RESTful API supporting user management, loan processing, payment handling, and donation tracking. Built with Node.js and Express, it offers secure authentication, file handling, and comprehensive banking operations.

## 🛠 Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **File Upload**: Multer
- **Cloud Storage**: Cloudinary
- **Email Service**: Nodemailer
- **Payment Processing**: Stripe
- **Documentation**: Swagger/OpenAPI

## 📁 Project Structure

```
backend/
├── app.js                 # Express app configuration
├── server.js              # Server entry point
├── config/               # Configuration files
│   ├── Db.js            # Database configuration
│   └── .env             # Environment variables
├── Controllers/         # Request handlers
│   ├── adminController.js    # Admin operations
│   ├── paymentController.js  # Payment handling
│   ├── stripeController.js   # Stripe integration
│   └── User.Controller.js    # User management
├── models/              # Database models
│   ├── Admin.Model.js       # Admin schema
│   ├── LoanApplication.modal.js  # Loan schema
│   └── User.Model.js        # User schema
├── Routes/              # API routes
│   ├── adminRoutes.js      # Admin endpoints
│   ├── payment.Routes.js   # Payment endpoints
│   └── User.Route.js       # User endpoints
├── middlewares/        # Custom middlewares
│   ├── Auth.js            # Authentication
│   ├── Multer.js          # File upload
│   └── CloudinaryMulter.js # Cloud storage
├── Services/           # Business logic
│   ├── Cloudinary.js     # Cloud storage
│   ├── OptServices.js    # OTP handling
│   └── User.Services.js  # User services
└── email/              # Email templates
    ├── email.html       # General template
    └── loanStatusTemplate.html # Loan notifications
```

## 🔐 API Endpoints

### 👤 User Management

#### Authentication
```
POST /api/users/signup
- Register new user with profile image
- Body: { email, password, RegNo, StudentName, phoneNo, Dept, semester, cnic }
- Files: profileImage
```

```
POST /api/users/login
- Authenticate user
- Body: { email, password }
```

```
POST /api/users/verify-otp
- Verify user's email with OTP
- Body: { email, otp }
```

#### Profile Management
```
GET /api/users/profile
- Get user profile
- Header: Authorization: Bearer {token}
```

```
PUT /api/users/update
- Update user profile
- Header: Authorization: Bearer {token}
- Body: { StudentName, phoneNo, Dept, semester }
```

### 💰 Loan Management

```
POST /api/loans/apply
- Submit loan application
- Header: Authorization: Bearer {token}
- Body: { amount, purpose, duration }
- Files: documents
```

```
GET /api/loans/status
- Check loan application status
- Header: Authorization: Bearer {token}
```

```
PUT /api/admin/loans/approve/:id
- Approve loan application (Admin only)
- Header: Authorization: Bearer {adminToken}
```

### 💳 Payment Processing

```
POST /api/payments/create-session
- Create payment session
- Body: { amount, type }
```

```
POST /api/payments/webhook
- Handle Stripe webhook events
```

### 👨‍💼 Admin Operations

```
GET /api/admin/users
- List all users (Admin only)
- Query params: { page, limit, sort }
```

```
GET /api/admin/loans
- List all loan applications (Admin only)
- Query params: { status, page, limit }
```

## ⚙️ Setup & Installation

1. **Prerequisites**
   ```bash
   Node.js >= 14.x
   MongoDB >= 4.4
   npm or yarn
   ```

2. **Environment Setup**
   ```bash
   # Clone repository
   git clone https://github.com/Muhammadrabeet56/100-s-Rupee-Bank.git

   # Install dependencies
   npm install

   # Configure environment
   cp .env.example .env
   ```

3. **Configure Environment Variables**
   ```env
   PORT=4000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   STRIPE_SECRET_KEY=your_stripe_key
   SMTP_HOST=your_smtp_host
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   ```

4. **Start Server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 🔒 Security Implementations

- JWT Authentication
- Request Rate Limiting
- Input Validation
- XSS Protection
- CORS Configuration
- File Upload Validation
- Error Handling
- Secure Password Hashing

## 🧪 Testing

```bash
# Run tests
npm test

# Run specific test suite
npm test -- --grep "User API"
```

## 📊 Database Schema

### User Model
```javascript
{
  email: String,
  password: String,
  RegNo: String,
  StudentName: String,
  phoneNo: String,
  Dept: String,
  semester: String,
  cnic: String,
  profileImage: String,
  isVerified: Boolean,
  createdAt: Date
}
```

### Loan Application Model
```javascript
{
  userId: ObjectId,
  amount: Number,
  purpose: String,
  status: String,
  documents: [String],
  approvedAt: Date,
  createdAt: Date
}
```

## 🚀 Deployment

1. **Production Build**
   ```bash
   npm run build
   ```

2. **Docker Support**
   ```bash
   # Build image
   docker build -t nfc-backend .

   # Run container
   docker run -p 4000:4000 nfc-backend
   ```

## 🔍 Error Handling

- Standardized error responses
- Detailed error logging
- Custom error classes
- Validation error handling
- Async error catching

## 📝 API Documentation

Complete API documentation is available at:
- Development: http://localhost:4000/api-docs
- Production: https://api.nfcbank.com/api-docs

## 🔄 Data Backup

- Automated daily backups
- Secure backup storage
- Point-in-time recovery
- Backup verification
- Restore procedures

## 👥 Team

- Backend Lead: Muhammadrabeet56
- Database Administrator: [DBA Name]
- Security Engineer: [Security Lead]

## 📄 License

This project is proprietary and confidential. Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited.

## 🆘 Support

For technical support:
- Email: [support-email]
- Issue Tracker: GitHub Issues
- API Docs: [Documentation Link]

- Node.js (v18 or later)
- npm
- MongoDB (local or cloud like MongoDB Atlas)

---

### 📥 Installation

1. **Clone the Repository**

```bash
git clone https://github.com/Muhammadrabeet56/100-s-Rupee-Bank.git
cd 100-s-Rupee-Bank/backend
