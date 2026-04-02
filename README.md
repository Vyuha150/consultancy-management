# EduLead Pro CRM - Complete Consultancy Platform

## 🚀 Standalone Next.js Application with MongoDB

Full-stack CRM platform for education consultancy with built-in API routes - **no separate backend server needed!**
change1
---

## ✅ Quick Start

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Setup Database
```bash
python setup_mongodb.py
```
*Requires MongoDB running locally or MongoDB Atlas*

### 3️⃣ Configure Environment
Create `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/edulead_crm
DB_NAME=edulead_crm
```

### 4️⃣ Start Development Server
```bash
npm run dev
```

Open **http://localhost:3000** 🎉

---

## 🏗️ What's Built

✅ **Dashboard** - Real-time KPIs, analytics, and insights  
✅ **Lead Management** - Complete pipeline tracking with stages  
✅ **Task Manager** - Assignment, tracking, and SLA monitoring  
✅ **AI WhatsApp Bot** - Automated conversation management  
✅ **Telecaller Management** - Call tracking and performance  
✅ **User & Team Management** - Role-based access control  
✅ **Reports & Analytics** - Comprehensive business insights  
✅ **Referral System** - Agent commissions and payouts  
✅ **Field Marketing** - On-ground lead tracking  
✅ **Social Media Campaigns** - Multi-platform management  

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14 (Pages Router)
- **Frontend:** React 19 + TypeScript
- **Database:** MongoDB with connection pooling
- **API:** Next.js API Routes (Serverless)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **AI:** Google Gemini integration

---

## 📚 Documentation

- **[NEXTJS_SETUP.md](./NEXTJS_SETUP.md)** - Complete Next.js setup guide
- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Architecture and integration details

---

## 📂 Project Structure

```
├── pages/
│   ├── api/                 # Next.js API Routes (Backend)
│   │   ├── dashboard/       # Dashboard APIs
│   │   ├── leads/           # Lead management APIs
│   │   ├── users/           # User management APIs
│   │   └── tasks/           # Task management APIs
│   ├── _app.tsx            # App wrapper
│   └── index.tsx           # Main page
├── lib/
│   └── mongodb.ts          # Database connection
├── components/             # React components
├── contexts/               # State management
├── services/               # API client layer
└── App.tsx                 # Main application
```

---

## 🔌 API Endpoints

All accessible at `/api/*`:

- `GET /api/dashboard/stats` - Dashboard KPIs
- `GET /api/dashboard/source-distribution` - Lead sources
- `GET /api/dashboard/pipeline-funnel` - Sales pipeline
- `GET /api/leads` - Lead management
- `GET /api/users` - User management
- `GET /api/tasks` - Task management

---

## 🧪 Testing

```bash
# Test dashboard API
curl http://localhost:3000/api/dashboard/stats

# Test leads API
curl http://localhost:3000/api/leads?limit=10

# Check MongoDB
mongosh
use edulead_crm
db.leads.countDocuments()
```

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

Add `MONGODB_URI` in Vercel environment variables.

### Self-Hosted
```bash
npm run build
npm start
```

---

## 📞 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running: `mongod`
- Check `.env.local` has correct URI

**No Data in Dashboard:**
- Run `python setup_mongodb.py`
- Verify MongoDB has data

**Port Already in Use:**
- Change port: `PORT=3001 npm run dev`

---

## 💡 Key Features

- **Single Codebase** - Frontend + Backend in one Next.js app
- **API Routes** - Serverless functions built into Next.js
- **MongoDB Integration** - Direct database access from API routes
- **TypeScript** - Full type safety across the stack
- **Real-time Data** - Live dashboard updates
- **Role-based Access** - Granular permission control
- **Responsive Design** - Works on all devices

---

View full setup guide: **[NEXTJS_SETUP.md](./NEXTJS_SETUP.md)**
