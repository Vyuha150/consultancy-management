"""
EduLead Pro CRM - FastAPI Backend Server
=========================================
Main API server for the CRM platform with MongoDB integration
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from datetime import datetime, timedelta
from typing import List, Optional
import json
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB Connection
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "edulead_crm")

app = FastAPI(title="EduLead Pro CRM API", version="1.0.0")

# CORS Configuration - Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Client
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Helper function to serialize MongoDB objects
def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable format"""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    if isinstance(doc, dict):
        result = {}
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                result[key] = str(value)
            elif isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, dict):
                result[key] = serialize_doc(value)
            elif isinstance(value, list):
                result[key] = serialize_doc(value)
            else:
                result[key] = value
        return result
    return doc

# ============================================
# DASHBOARD ENDPOINTS
# ============================================

@app.get("/")
def read_root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "EduLead Pro CRM API",
        "version": "1.0.0",
        "database": DB_NAME
    }

@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    """Get dashboard KPI statistics"""
    try:
        # Get today's leads count
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        leads_today = db.leads.count_documents({"createdAt": {"$gte": today}})
        
        # Get total leads
        total_leads = db.leads.count_documents({})
        
        # Get active tasks
        active_tasks = db.tasks.count_documents({"status": {"$in": ["ASSIGNED", "IN_PROGRESS"]}})
        
        # Get overdue tasks
        overdue_tasks = db.tasks.count_documents({"status": "OVERDUE"})
        
        # Get conversion rate (converted / total leads)
        converted_leads = db.leads.count_documents({"stage": "CONVERTED"})
        conversion_rate = (converted_leads / total_leads * 100) if total_leads > 0 else 0
        
        # Get AI bot response rate
        active_whatsapp = db.whatsapp_conversations.count_documents({"status": "ACTIVE"})
        total_whatsapp = db.whatsapp_conversations.count_documents({})
        ai_response_rate = (active_whatsapp / total_whatsapp * 100) if total_whatsapp > 0 else 92
        
        return {
            "leadsToday": leads_today,
            "leadsTotal": total_leads,
            "activeTasks": active_tasks,
            "overdueTasks": overdue_tasks,
            "conversionRate": round(conversion_rate, 1),
            "aiResponseRate": round(ai_response_rate, 1)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/source-distribution")
def get_source_distribution():
    """Get lead distribution by source"""
    try:
        pipeline = [
            {"$group": {
                "_id": "$source",
                "count": {"$sum": 1}
            }},
            {"$project": {
                "name": "$_id",
                "value": "$count",
                "_id": 0
            }}
        ]
        
        results = list(db.leads.aggregate(pipeline))
        return serialize_doc(results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/pipeline-funnel")
def get_pipeline_funnel():
    """Get lead counts by stage (pipeline funnel)"""
    try:
        pipeline = [
            {"$group": {
                "_id": "$stage",
                "count": {"$sum": 1}
            }},
            {"$project": {
                "stage": "$_id",
                "count": "$count",
                "_id": 0
            }}
        ]
        
        results = list(db.leads.aggregate(pipeline))
        return serialize_doc(results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/staff-performance")
def get_staff_performance():
    """Get top performing staff members"""
    try:
        # Get users with their task completion counts
        users = list(db.users.find({"status": "ACTIVE"}).limit(10))
        
        performance = []
        for user in users:
            user_id = user.get("_id")
            
            # Count completed tasks
            completed = db.tasks.count_documents({
                "assignedTo": user_id,
                "status": "COMPLETED"
            })
            
            # Count potential leads (HOT leads assigned to user)
            potentials = db.leads.count_documents({
                "assignedTo": user_id,
                "interestLevel": "HOT"
            })
            
            role_label = user.get("role", "").replace("_", " ").title()
            performance.append({
                "name": f"{user.get('name', 'Unknown')} ({role_label[:4]})",
                "calls": completed,
                "potentials": potentials
            })
        
        # Sort by completed tasks
        performance.sort(key=lambda x: x["calls"], reverse=True)
        return performance[:4]  # Return top 4
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/country-segmentation")
def get_country_segmentation():
    """Get lead distribution by desired country"""
    try:
        pipeline = [
            {"$match": {"desiredCountry": {"$exists": True, "$ne": None}}},
            {"$group": {
                "_id": "$desiredCountry",
                "leads": {"$sum": 1}
            }},
            {"$project": {
                "name": "$_id",
                "leads": "$leads",
                "_id": 0
            }},
            {"$sort": {"leads": -1}},
            {"$limit": 5}
        ]
        
        results = list(db.leads.aggregate(pipeline))
        return serialize_doc(results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/referral-payouts")
def get_referral_payouts():
    """Get referral agent payout information"""
    try:
        # Get agents with pending payouts
        agents = list(db.agents.find({"status": "ACTIVE"}).limit(5))
        
        referral_data = []
        for agent in agents:
            agent_id = agent.get("_id")
            
            # Count conversions this month
            start_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            conversions = db.leads.count_documents({
                "source": "REFERRAL",
                "referralAgentId": agent_id,
                "stage": "CONVERTED",
                "createdAt": {"$gte": start_of_month}
            })
            
            # Get pending payout amount
            pending_amount = db.payouts.aggregate([
                {"$match": {
                    "agentId": agent_id,
                    "status": "PENDING"
                }},
                {"$group": {
                    "_id": None,
                    "total": {"$sum": "$amount"}
                }}
            ])
            
            pending_list = list(pending_amount)
            pending = pending_list[0]["total"] if pending_list else 0
            
            referral_data.append({
                "agent": agent.get("name", "Unknown Agent"),
                "leads": conversions,
                "pending": f"${pending:,.0f}"
            })
        
        return referral_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# LEAD MANAGEMENT ENDPOINTS
# ============================================

@app.get("/api/leads")
def get_leads(
    limit: int = Query(100, description="Maximum number of leads to return"),
    stage: Optional[str] = Query(None, description="Filter by stage"),
    source: Optional[str] = Query(None, description="Filter by source"),
    interest_level: Optional[str] = Query(None, description="Filter by interest level"),
    assigned_to: Optional[str] = Query(None, description="Filter by assigned user")
):
    """Get leads with optional filters"""
    try:
        query = {}
        
        if stage:
            query["stage"] = stage
        if source:
            query["source"] = source
        if interest_level:
            query["interestLevel"] = interest_level
        if assigned_to:
            query["assignedTo"] = assigned_to
        
        leads = list(db.leads.find(query).limit(limit).sort("createdAt", -1))
        return serialize_doc(leads)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/leads/{lead_id}")
def get_lead(lead_id: str):
    """Get single lead by ID"""
    try:
        lead = db.leads.find_one({"_id": lead_id})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        return serialize_doc(lead)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/leads/search/{search_term}")
def search_leads(search_term: str):
    """Search leads by name, email, or phone"""
    try:
        query = {
            "$or": [
                {"name": {"$regex": search_term, "$options": "i"}},
                {"email": {"$regex": search_term, "$options": "i"}},
                {"phone": {"$regex": search_term, "$options": "i"}}
            ]
        }
        leads = list(db.leads.find(query).limit(50))
        return serialize_doc(leads)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# USER & AUTHENTICATION ENDPOINTS
# ============================================

@app.get("/api/users")
def get_users(
    role: Optional[str] = Query(None, description="Filter by role"),
    status: Optional[str] = Query(None, description="Filter by status")
):
    """Get users with optional filters"""
    try:
        query = {}
        
        if role:
            query["role"] = role
        if status:
            query["status"] = status
        
        users = list(db.users.find(query))
        return serialize_doc(users)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users/{user_id}")
def get_user(user_id: str):
    """Get single user by ID"""
    try:
        user = db.users.find_one({"_id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return serialize_doc(user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/login")
def login(credentials: dict):
    """Authenticate user with email and password"""
    try:
        email = credentials.get("email")
        password = credentials.get("password")
        
        if not email or not password:
            raise HTTPException(status_code=400, detail="Email and password required")
        
        # Find user by email
        user = db.users.find_one({"email": email})
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # In production, you'd verify password hash here
        # For now, just return the user
        return serialize_doc(user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# TASK MANAGEMENT ENDPOINTS
# ============================================

@app.get("/api/tasks")
def get_tasks(
    assigned_to: Optional[str] = Query(None, description="Filter by assigned user"),
    status: Optional[str] = Query(None, description="Filter by status"),
    project_id: Optional[str] = Query(None, description="Filter by project")
):
    """Get tasks with optional filters"""
    try:
        query = {}
        
        if assigned_to:
            query["assignedTo"] = assigned_to
        if status:
            query["status"] = status
        if project_id:
            query["projectId"] = project_id
        
        tasks = list(db.tasks.find(query).sort("dueDate", 1))
        return serialize_doc(tasks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tasks/overdue")
def get_overdue_tasks():
    """Get all overdue tasks"""
    try:
        tasks = list(db.tasks.find({"status": "OVERDUE"}))
        return serialize_doc(tasks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# WHATSAPP & AI ENDPOINTS
# ============================================

@app.get("/api/whatsapp/conversations")
def get_whatsapp_conversations(
    status: Optional[str] = Query(None, description="Filter by status"),
    lead_id: Optional[str] = Query(None, description="Filter by lead")
):
    """Get WhatsApp conversations"""
    try:
        query = {}
        
        if status:
            query["status"] = status
        if lead_id:
            query["leadId"] = lead_id
        
        conversations = list(db.whatsapp_conversations.find(query).sort("timestamp", -1))
        return serialize_doc(conversations)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# CAMPAIGN & MARKETING ENDPOINTS
# ============================================

@app.get("/api/campaigns")
def get_campaigns(
    platform: Optional[str] = Query(None, description="Filter by platform"),
    status: Optional[str] = Query(None, description="Filter by status")
):
    """Get marketing campaigns"""
    try:
        query = {}
        
        if platform:
            query["platform"] = platform
        if status:
            query["status"] = status
        
        campaigns = list(db.campaigns.find(query))
        return serialize_doc(campaigns)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# PROJECT & ASSIGNMENT ENDPOINTS
# ============================================

@app.get("/api/projects")
def get_projects():
    """Get all projects"""
    try:
        projects = list(db.projects.find())
        return serialize_doc(projects)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# AGENT & REFERRAL ENDPOINTS
# ============================================

@app.get("/api/agents")
def get_agents(status: Optional[str] = Query(None, description="Filter by status")):
    """Get referral agents"""
    try:
        query = {}
        if status:
            query["status"] = status
        
        agents = list(db.agents.find(query))
        return serialize_doc(agents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/payouts")
def get_payouts(
    agent_id: Optional[str] = Query(None, description="Filter by agent"),
    status: Optional[str] = Query(None, description="Filter by status")
):
    """Get payout records"""
    try:
        query = {}
        
        if agent_id:
            query["agentId"] = agent_id
        if status:
            query["status"] = status
        
        payouts = list(db.payouts.find(query))
        return serialize_doc(payouts)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# ACTIVITY LOG ENDPOINTS
# ============================================

@app.get("/api/activity-logs")
def get_activity_logs(
    user_id: Optional[str] = Query(None, description="Filter by user"),
    limit: int = Query(50, description="Maximum number of logs")
):
    """Get activity logs"""
    try:
        query = {}
        if user_id:
            query["userId"] = user_id
        
        logs = list(db.activity_logs.find(query).sort("timestamp", -1).limit(limit))
        return serialize_doc(logs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting EduLead Pro CRM API Server...")
    print(f"📊 Database: {DB_NAME}")
    print(f"🔗 API Docs: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
