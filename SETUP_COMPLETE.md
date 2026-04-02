# EduLead Pro CRM - Complete Setup Guide

## ✅ All Features Implemented

### 1. **Authentication System**
- Login page with email/password authentication
- Validates credentials against MongoDB
- Two user accounts created in database:
  - **Admin:** admin@edulead.com / admin123 (SUPER_ADMIN)
  - **User:** user@edulead.com / user123 (COUNSELOR)

### 2. **User Profile & Settings**
- Dedicated Settings page with multiple tabs:
  - **My Profile** - Shows user information fetched from database
    - Name, Email, Phone, Department
    - Join date and last login timestamp
    - Performance metrics (Leads Handled, Conversions, Success Rate)
  - **Pipeline & Stages** - Configure sales pipeline
  - **Master Data** - Manage countries, categories, universities
  - **AI & WhatsApp** - WhatsApp template library
  - **Legal & Consent** - GDPR and compliance settings
  - **Audit & Security** - Activity logs and security monitoring

### 3. **Campaigns Management**
- Social Media Hub page displays all campaigns from database
- 6 dummy campaigns created with data:
  - LinkedIn, Instagram, Facebook, WhatsApp, Google Ads, Email
  - Shows: Platform, Leads, Conversions, Budget, ROI, Status
- Real-time data loading from `/api/campaigns` endpoint
- Platform icons for each campaign type

### 4. **Logout Functionality**
- "Sign Out" button on the Profile tab
- Clears user session and returns to login page
- Secure logout flow

### 5. **Database Integration**
All data is stored in MongoDB with proper collections:
- `users` - User accounts with profiles and performance metrics
- `campaigns` - Marketing campaigns with performance data

## 🔧 API Endpoints Created

```
POST   /api/auth/login              - User authentication
GET    /api/user/profile?userId=X   - Fetch user profile
GET    /api/campaigns               - Fetch all campaigns
```

## 🚀 Running the Application

```bash
# Start development server
npm run dev

# Application runs on http://localhost:3000
```

## 📝 Login & Test

1. Open http://localhost:3000
2. Login with:
   - **Admin:** admin@edulead.com / admin123
   - **User:** user@edulead.com / user123
3. Navigate to **Settings** → **My Profile** to see your info
4. Navigate to **Social Media Hub** to see campaigns
5. Click **Sign Out** on profile tab to logout

## 📊 Database Setup

To reset users and campaigns, run:
```bash
node setup_users.js        # Reset users
node setup_dummy_data.js   # Add campaigns and update user metrics
```

## ✨ Key Features

- ✅ Real database integration (MongoDB)
- ✅ User authentication and session management
- ✅ Profile page with actual user data from database
- ✅ Campaign dashboard showing real metrics
- ✅ Proper logout functionality
- ✅ Role-based access control
- ✅ Performance metrics tracking
- ✅ Responsive design with Tailwind CSS
