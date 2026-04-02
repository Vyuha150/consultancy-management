"""
EduLead Pro CRM - MongoDB Database Setup Script
===============================================
This script sets up the complete MongoDB database structure and populates it with dummy data.

Requirements:
    pip install pymongo python-dotenv

Usage:
    python setup_mongodb.py

Database: edulead_crm (local MongoDB)
Collections: users, leads, teams, tasks, projects, whatsapp_conversations, lead_sheets, 
             sheet_rows, campaigns, agents, payouts, fraud_alerts, activity_logs, 
             whatsapp_templates, system_settings
"""

from pymongo import MongoClient, ASCENDING, DESCENDING
from datetime import datetime, timedelta
import random
from typing import List, Dict
import os

# MongoDB Connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = "edulead_crm"

class EduLeadDBSetup:
    def __init__(self):
        self.client = MongoClient(MONGO_URI)
        self.db = self.client[DB_NAME]
        print(f"✅ Connected to MongoDB: {MONGO_URI}")
        print(f"📂 Database: {DB_NAME}\n")
    
    def drop_existing_database(self):
        """⚠️ WARNING: Drops the entire database - use with caution!"""
        confirm = input("⚠️  Drop existing database? This will delete all data. (yes/no): ")
        if confirm.lower() == 'yes':
            self.client.drop_database(DB_NAME)
            print(f"🗑️  Database '{DB_NAME}' dropped successfully.\n")
        else:
            print("❌ Database drop cancelled.\n")
    
    def create_collections_and_indexes(self):
        """Create collections and set up indexes for optimal performance"""
        print("📝 Creating collections and indexes...")
        
        # Users collection
        users = self.db.users
        users.create_index([("email", ASCENDING)], unique=True)
        users.create_index([("role", ASCENDING)])
        users.create_index([("status", ASCENDING)])
        
        # Leads collection
        leads = self.db.leads
        leads.create_index([("email", ASCENDING)])
        leads.create_index([("phone", ASCENDING)])
        leads.create_index([("source", ASCENDING)])
        leads.create_index([("stage", ASCENDING)])
        leads.create_index([("assignedTo", ASCENDING)])
        leads.create_index([("createdAt", DESCENDING)])
        leads.create_index([("interestLevel", ASCENDING)])
        
        # Tasks collection
        tasks = self.db.tasks
        tasks.create_index([("assignedTo", ASCENDING)])
        tasks.create_index([("status", ASCENDING)])
        tasks.create_index([("dueDate", ASCENDING)])
        tasks.create_index([("priority", DESCENDING)])
        
        # WhatsApp Conversations
        whatsapp = self.db.whatsapp_conversations
        whatsapp.create_index([("leadId", ASCENDING)])
        whatsapp.create_index([("status", ASCENDING)])
        whatsapp.create_index([("timestamp", DESCENDING)])
        
        # Campaigns
        campaigns = self.db.campaigns
        campaigns.create_index([("platform", ASCENDING)])
        campaigns.create_index([("status", ASCENDING)])
        
        # Activity Logs
        logs = self.db.activity_logs
        logs.create_index([("userId", ASCENDING)])
        logs.create_index([("timestamp", DESCENDING)])
        
        print("✅ Collections and indexes created successfully.\n")
    
    def insert_teams(self):
        """Insert team data"""
        print("👥 Inserting teams...")
        teams = [
            {
                "_id": "t1",
                "name": "Management",
                "description": "Core administrative team",
                "leadId": "u1",
                "memberCount": 5,
                "type": "OPERATIONS",
                "createdAt": datetime(2024, 1, 1)
            },
            {
                "_id": "t2",
                "name": "Telecalling Squad",
                "description": "Direct lead generation team",
                "leadId": "u3",
                "memberCount": 12,
                "type": "TELECALLING",
                "createdAt": datetime(2024, 1, 1)
            },
            {
                "_id": "t3",
                "name": "Counseling Team",
                "description": "Student counseling and conversions",
                "leadId": "u4",
                "memberCount": 8,
                "type": "COUNSELING",
                "createdAt": datetime(2024, 1, 1)
            },
            {
                "_id": "t4",
                "name": "Marketing Team",
                "description": "Field and digital marketing",
                "leadId": "u6",
                "memberCount": 6,
                "type": "MARKETING",
                "createdAt": datetime(2024, 1, 1)
            }
        ]
        self.db.teams.insert_many(teams)
        print(f"   ✓ Inserted {len(teams)} teams\n")
    
    def insert_users(self):
        """Insert user data with different roles"""
        print("👤 Inserting users...")
        users = [
            {
                "_id": "u1",
                "name": "Alex Super",
                "email": "alex@edulead.com",
                "password": "$2b$10$hashed_password_here",  # In production, use bcrypt
                "role": "SUPER_ADMIN",
                "avatar": "https://picsum.photos/seed/alex/100",
                "status": "ACTIVE",
                "dataScope": "ALL_LEADS",
                "teamId": "t1",
                "lastActive": datetime.now() - timedelta(minutes=2),
                "isOnline": True,
                "createdAt": datetime(2024, 1, 1),
                "permissions": ["all"]
            },
            {
                "_id": "u2",
                "name": "Sarah Admin",
                "email": "sarah@edulead.com",
                "password": "$2b$10$hashed_password_here",
                "role": "ADMIN",
                "avatar": "https://picsum.photos/seed/sarah/100",
                "status": "ACTIVE",
                "dataScope": "ALL_LEADS",
                "teamId": "t1",
                "lastActive": datetime.now() - timedelta(minutes=10),
                "isOnline": True,
                "createdAt": datetime(2024, 1, 5),
                "permissions": ["manage_users", "view_reports", "assign_leads"]
            },
            {
                "_id": "u3",
                "name": "John Caller",
                "email": "john@edulead.com",
                "password": "$2b$10$hashed_password_here",
                "role": "TELECALLER",
                "avatar": "https://picsum.photos/seed/john/100",
                "status": "ACTIVE",
                "dataScope": "ONLY_ASSIGNED",
                "teamId": "t2",
                "lastActive": datetime.now() - timedelta(hours=1),
                "isOnline": False,
                "createdAt": datetime(2024, 1, 10),
                "permissions": ["view_assigned_sheets", "call_logs"]
            },
            {
                "_id": "u4",
                "name": "Lisa Counselor",
                "email": "lisa@edulead.com",
                "password": "$2b$10$hashed_password_here",
                "role": "COUNSELOR",
                "avatar": "https://picsum.photos/seed/lisa/100",
                "status": "ACTIVE",
                "dataScope": "TEAM_ONLY",
                "teamId": "t3",
                "lastActive": datetime.now(),
                "isOnline": True,
                "createdAt": datetime(2024, 1, 15),
                "permissions": ["manage_pipeline", "admissions"]
            },
            {
                "_id": "u5",
                "name": "Mark AI",
                "email": "mark@edulead.com",
                "password": "$2b$10$hashed_password_here",
                "role": "AI_OPERATOR",
                "avatar": "https://picsum.photos/seed/mark/100",
                "status": "ACTIVE",
                "dataScope": "ALL_LEADS",
                "teamId": "t1",
                "lastActive": datetime.now() - timedelta(hours=5),
                "isOnline": False,
                "createdAt": datetime(2024, 1, 20),
                "permissions": ["ai_logs", "ai_config"]
            },
            {
                "_id": "u6",
                "name": "Kevin Field",
                "email": "kevin@edulead.com",
                "password": "$2b$10$hashed_password_here",
                "role": "FIELD_MARKETING",
                "avatar": "https://picsum.photos/seed/kevin/100",
                "status": "ACTIVE",
                "dataScope": "ONLY_ASSIGNED",
                "teamId": "t4",
                "lastActive": datetime.now(),
                "isOnline": True,
                "createdAt": datetime(2024, 1, 25),
                "permissions": ["field_leads"]
            },
            {
                "_id": "u7",
                "name": "Emma Social",
                "email": "emma@edulead.com",
                "password": "$2b$10$hashed_password_here",
                "role": "SOCIAL_MEDIA",
                "avatar": "https://picsum.photos/seed/emma/100",
                "status": "ACTIVE",
                "dataScope": "ONLY_ASSIGNED",
                "teamId": "t4",
                "lastActive": datetime.now() - timedelta(minutes=30),
                "isOnline": True,
                "createdAt": datetime(2024, 2, 1),
                "permissions": ["create_leads", "campaigns"]
            },
            {
                "_id": "u8",
                "name": "David Manager",
                "email": "david@edulead.com",
                "password": "$2b$10$hashed_password_here",
                "role": "AGENT_MANAGER",
                "avatar": "https://picsum.photos/seed/david/100",
                "status": "ACTIVE",
                "dataScope": "ALL_LEADS",
                "teamId": "t1",
                "lastActive": datetime.now() - timedelta(hours=2),
                "isOnline": False,
                "createdAt": datetime(2024, 2, 5),
                "permissions": ["referrals"]
            }
        ]
        self.db.users.insert_many(users)
        print(f"   ✓ Inserted {len(users)} users\n")
    
    def insert_projects(self):
        """Insert project data"""
        print("📋 Inserting projects...")
        projects = [
            {
                "_id": "p1",
                "name": "2026 Feb Intake – USA Counseling",
                "description": "Priority handling for upcoming Spring intake",
                "type": "INTAKE",
                "createdAt": datetime(2024, 5, 1)
            },
            {
                "_id": "p2",
                "name": "Telegram Telecalling Batch #24",
                "description": "Bulk calling for engineering seminar leads",
                "type": "BATCH",
                "createdAt": datetime(2024, 5, 10)
            },
            {
                "_id": "p3",
                "name": "Instagram Leads – KL University",
                "description": "Focused campaign for South Region students",
                "type": "CAMPAIGN",
                "createdAt": datetime(2024, 5, 12)
            }
        ]
        self.db.projects.insert_many(projects)
        print(f"   ✓ Inserted {len(projects)} projects\n")
    
    def insert_leads(self):
        """Insert lead data"""
        print("📊 Inserting leads...")
        leads = [
            {
                "_id": "l1",
                "name": "Aravind Kumar",
                "guardianName": "Ramesh Kumar",
                "email": "aravind@example.com",
                "phone": "+91 9876543210",
                "source": "WHATSAPP_AI",
                "stage": "QUALIFIED",
                "interestLevel": "HOT",
                "assignedTo": "u4",
                "countryPreference": ["UK"],
                "program": "Masters in Computer Science",
                "university": None,
                "college": "JNTU Hyderabad",
                "budget": "$30,000",
                "intakeMonth": "September 2024",
                "consentStatus": True,
                "consentDate": datetime(2024, 5, 10),
                "createdAt": datetime(2024, 5, 1),
                "updatedAt": datetime(2024, 5, 18),
                "followUpDate": datetime(2024, 5, 20),
                "campaign": None,
                "referralCode": None,
                "notes": [
                    {
                        "id": "n1",
                        "content": "Very interested in UK universities with scholarship opportunities",
                        "author": "u4",
                        "createdAt": datetime(2024, 5, 10).isoformat()
                    }
                ],
                "tasks": [],
                "aiFlagged": True,
                "aiMetrics": {
                    "interestScore": 94,
                    "intent": "High interest in UK CS programs",
                    "queries": ["Scholarships?", "IELTS waiver?"],
                    "bestTimeToCall": "6 PM - 8 PM"
                }
            },
            {
                "_id": "l2",
                "name": "Jessica Smith",
                "email": "jessica@example.com",
                "phone": "+1 4567890123",
                "source": "SOCIAL_MEDIA",
                "stage": "NEW",
                "interestLevel": "WARM",
                "assignedTo": "u2",
                "countryPreference": ["USA", "Canada"],
                "program": "MBA",
                "university": None,
                "college": None,
                "budget": "$50,000",
                "intakeMonth": "January 2025",
                "consentStatus": True,
                "consentDate": datetime(2024, 5, 12),
                "createdAt": datetime(2024, 5, 12),
                "updatedAt": datetime(2024, 5, 15),
                "followUpDate": datetime(2024, 5, 21),
                "campaign": "c1",
                "referralCode": None,
                "notes": [],
                "tasks": [],
                "aiFlagged": False,
                "aiMetrics": None
            },
            {
                "_id": "l3",
                "name": "Rohit Sharma",
                "guardianName": "Suresh Sharma",
                "email": "rohit@example.com",
                "phone": "+91 8887776660",
                "source": "TELECALLER_SHEET",
                "stage": "COUNSELING",
                "interestLevel": "HOT",
                "assignedTo": "u3",
                "countryPreference": ["Australia"],
                "program": "Engineering",
                "university": None,
                "college": "VIT Vellore",
                "budget": "$25,000",
                "intakeMonth": "February 2025",
                "consentStatus": False,
                "consentDate": None,
                "createdAt": datetime(2024, 5, 5),
                "updatedAt": datetime(2024, 5, 17),
                "followUpDate": datetime(2024, 5, 18),
                "campaign": None,
                "referralCode": None,
                "notes": [
                    {
                        "id": "n2",
                        "content": "Concerned about accommodation costs in Sydney",
                        "author": "u3",
                        "createdAt": datetime(2024, 5, 12).isoformat()
                    }
                ],
                "tasks": [],
                "aiFlagged": True,
                "aiMetrics": {
                    "interestScore": 88,
                    "intent": "Looking for scholarships in Australia",
                    "queries": ["Accommodation", "Part-time work"],
                    "bestTimeToCall": "Morning"
                }
            },
            {
                "_id": "l4",
                "name": "Priya Patel",
                "email": "priya@example.com",
                "phone": "+91 9988776655",
                "source": "REFERRAL",
                "stage": "CONTACTED",
                "interestLevel": "WARM",
                "assignedTo": "u4",
                "countryPreference": ["Canada"],
                "program": "Healthcare Management",
                "university": None,
                "college": "Mumbai University",
                "budget": "$35,000",
                "intakeMonth": "September 2024",
                "consentStatus": True,
                "consentDate": datetime(2024, 5, 14),
                "createdAt": datetime(2024, 5, 14),
                "updatedAt": datetime(2024, 5, 18),
                "followUpDate": datetime(2024, 5, 22),
                "campaign": None,
                "referralCode": "GLO2024",
                "notes": [],
                "tasks": [],
                "aiFlagged": False,
                "aiMetrics": None
            },
            {
                "_id": "l5",
                "name": "Michael Chen",
                "email": "michael@example.com",
                "phone": "+1 5551234567",
                "source": "FIELD_MARKETING",
                "stage": "NEW",
                "interestLevel": "COLD",
                "assignedTo": "u6",
                "countryPreference": ["UK", "Germany"],
                "program": "Data Science",
                "university": None,
                "college": None,
                "budget": "$40,000",
                "intakeMonth": "January 2025",
                "consentStatus": True,
                "consentDate": datetime(2024, 5, 16),
                "createdAt": datetime(2024, 5, 16),
                "updatedAt": datetime(2024, 5, 18),
                "followUpDate": datetime(2024, 5, 25),
                "campaign": None,
                "referralCode": None,
                "notes": [],
                "tasks": [],
                "aiFlagged": False,
                "aiMetrics": None
            }
        ]
        self.db.leads.insert_many(leads)
        print(f"   ✓ Inserted {len(leads)} leads\n")
    
    def insert_tasks(self):
        """Insert task data"""
        print("✅ Inserting tasks...")
        tasks = [
            {
                "_id": "t1",
                "leadId": "l1",
                "leadName": "Aravind Kumar",
                "leadPhone": "+91 9876543210",
                "projectId": "p1",
                "title": "Initial Counseling Session",
                "description": "Discuss UK universities and IELTS waivers",
                "dueDate": datetime(2024, 5, 20),
                "dueTime": "14:00",
                "status": "ASSIGNED",
                "assignedTo": "u4",
                "type": "COUNSELING",
                "priority": "HIGH",
                "slaDeadline": datetime(2024, 5, 20, 18, 0, 0),
                "source": "WHATSAPP_AI",
                "checklist": [],
                "reminders": []
            },
            {
                "_id": "t2",
                "leadId": "l3",
                "leadName": "Rohit Sharma",
                "leadPhone": "+91 8887776660",
                "projectId": "p2",
                "title": "Document Verification",
                "description": "Check 10th and 12th certificates",
                "dueDate": datetime(2024, 5, 18),
                "status": "OVERDUE",
                "assignedTo": "u3",
                "type": "DOC_COLLECTION",
                "priority": "MEDIUM",
                "slaDeadline": datetime(2024, 5, 18, 12, 0, 0),
                "source": "TELECALLER_SHEET",
                "checklist": [
                    {"item": "10th Marksheet", "completed": True},
                    {"item": "12th Marksheet", "completed": True},
                    {"item": "Passport Copy", "completed": False}
                ],
                "reminders": []
            },
            {
                "_id": "t3",
                "leadId": "l2",
                "leadName": "Jessica Smith",
                "leadPhone": "+1 4567890123",
                "projectId": "p3",
                "title": "Lead Follow-up Call",
                "description": "Discuss MBA tuition fees and scholarships",
                "dueDate": datetime(2024, 5, 21),
                "status": "IN_PROGRESS",
                "assignedTo": "u2",
                "type": "CALL",
                "priority": "LOW",
                "slaDeadline": datetime(2024, 5, 21, 10, 30, 0),
                "source": "SOCIAL_MEDIA",
                "checklist": [],
                "reminders": []
            },
            {
                "_id": "t4",
                "leadName": "Unassigned Inquiry",
                "projectId": "p1",
                "title": "Verify Application Form",
                "description": "Missing guardian signature on Form-A",
                "dueDate": datetime(2024, 5, 22),
                "status": "UNASSIGNED",
                "type": "APPLICATION",
                "priority": "HIGH",
                "source": "FIELD_MARKETING",
                "checklist": [],
                "reminders": []
            }
        ]
        self.db.tasks.insert_many(tasks)
        print(f"   ✓ Inserted {len(tasks)} tasks\n")
    
    def insert_whatsapp_conversations(self):
        """Insert WhatsApp conversation data"""
        print("💬 Inserting WhatsApp conversations...")
        conversations = [
            {
                "_id": "w1",
                "leadId": "l1",
                "leadName": "Aravind Kumar",
                "lastMessage": "What is the tuition fee for UK?",
                "timestamp": datetime.now() - timedelta(hours=2),
                "status": "ACTIVE",
                "interestScore": 94,
                "unreadCount": 2,
                "messages": [
                    {
                        "id": "m1",
                        "sender": "lead",
                        "content": "Hi, I want to study in UK",
                        "timestamp": datetime.now() - timedelta(hours=5)
                    },
                    {
                        "id": "m2",
                        "sender": "ai",
                        "content": "Hello! I'd be happy to help you with UK university admissions. What program are you interested in?",
                        "timestamp": datetime.now() - timedelta(hours=4, minutes=55)
                    },
                    {
                        "id": "m3",
                        "sender": "lead",
                        "content": "Computer Science Masters. What is the tuition fee for UK?",
                        "timestamp": datetime.now() - timedelta(hours=2)
                    }
                ]
            },
            {
                "_id": "w2",
                "leadId": "l2",
                "leadName": "Jessica Smith",
                "lastMessage": "Thank you for the info.",
                "timestamp": datetime.now() - timedelta(days=1),
                "status": "HANDED_OFF",
                "interestScore": 82,
                "unreadCount": 0,
                "messages": [
                    {
                        "id": "m4",
                        "sender": "lead",
                        "content": "I'm looking for MBA programs",
                        "timestamp": datetime.now() - timedelta(days=2)
                    },
                    {
                        "id": "m5",
                        "sender": "ai",
                        "content": "Great! We have excellent MBA programs in USA and Canada. When are you planning to start?",
                        "timestamp": datetime.now() - timedelta(days=2, hours=23)
                    },
                    {
                        "id": "m6",
                        "sender": "lead",
                        "content": "Thank you for the info.",
                        "timestamp": datetime.now() - timedelta(days=1)
                    }
                ]
            },
            {
                "_id": "w3",
                "leadId": "l3",
                "leadName": "Rohit Sharma",
                "lastMessage": "Can I work part-time while studying?",
                "timestamp": datetime.now() - timedelta(hours=6),
                "status": "ACTIVE",
                "interestScore": 88,
                "unreadCount": 1,
                "messages": [
                    {
                        "id": "m7",
                        "sender": "lead",
                        "content": "Tell me about Australia universities",
                        "timestamp": datetime.now() - timedelta(hours=8)
                    },
                    {
                        "id": "m8",
                        "sender": "ai",
                        "content": "Australia has world-class universities! What's your field of interest?",
                        "timestamp": datetime.now() - timedelta(hours=7, minutes=50)
                    },
                    {
                        "id": "m9",
                        "sender": "lead",
                        "content": "Can I work part-time while studying?",
                        "timestamp": datetime.now() - timedelta(hours=6)
                    }
                ]
            }
        ]
        self.db.whatsapp_conversations.insert_many(conversations)
        print(f"   ✓ Inserted {len(conversations)} WhatsApp conversations\n")
    
    def insert_lead_sheets(self):
        """Insert telecaller lead sheets"""
        print("📞 Inserting lead sheets...")
        sheets = [
            {
                "_id": "s1",
                "name": "Engineering Seminar Leads - May",
                "assignedTo": ["u3"],
                "totalRows": 150,
                "completedRows": 45,
                "status": "ACTIVE",
                "createdAt": datetime(2024, 5, 1)
            },
            {
                "_id": "s2",
                "name": "Facebook Ad Inquiries",
                "assignedTo": ["u3", "u2"],
                "totalRows": 80,
                "completedRows": 80,
                "status": "ARCHIVED",
                "createdAt": datetime(2024, 4, 15)
            },
            {
                "_id": "s3",
                "name": "College Fair - Bangalore",
                "assignedTo": ["u3"],
                "totalRows": 200,
                "completedRows": 67,
                "status": "ACTIVE",
                "createdAt": datetime(2024, 5, 10)
            }
        ]
        self.db.lead_sheets.insert_many(sheets)
        print(f"   ✓ Inserted {len(sheets)} lead sheets\n")
    
    def insert_sheet_rows(self):
        """Insert individual rows from lead sheets"""
        print("📋 Inserting sheet rows...")
        rows = [
            {
                "_id": "sr1",
                "sheetId": "s1",
                "name": "Rajesh Patil",
                "phone": "+91 9123456780",
                "location": "Mumbai",
                "callStatus": "INTERESTED",
                "interestLevel": "HOT",
                "remarks": "Wants to study in Canada",
                "nextFollowUp": datetime(2024, 5, 20),
                "isPotential": True,
                "isConverted": False,
                "lastEditedBy": "u3",
                "updatedAt": datetime(2024, 5, 18)
            },
            {
                "_id": "sr2",
                "sheetId": "s1",
                "name": "Sneha Rao",
                "phone": "+91 9876543211",
                "location": "Bangalore",
                "callStatus": "BUSY",
                "interestLevel": None,
                "remarks": "Call back later",
                "nextFollowUp": datetime(2024, 5, 19),
                "isPotential": False,
                "isConverted": False,
                "lastEditedBy": "u3",
                "updatedAt": datetime(2024, 5, 18)
            },
            {
                "_id": "sr3",
                "sheetId": "s1",
                "name": "Amit Verma",
                "phone": "+91 9876543212",
                "location": "Delhi",
                "callStatus": "NOT_INTERESTED",
                "interestLevel": "COLD",
                "remarks": "Already applied elsewhere",
                "nextFollowUp": None,
                "isPotential": False,
                "isConverted": False,
                "lastEditedBy": "u3",
                "updatedAt": datetime(2024, 5, 17)
            }
        ]
        self.db.sheet_rows.insert_many(rows)
        print(f"   ✓ Inserted {len(rows)} sheet rows\n")
    
    def insert_campaigns(self):
        """Insert marketing campaign data"""
        print("📢 Inserting campaigns...")
        campaigns = [
            {
                "_id": "c1",
                "name": "Summer 2024 Intake Ads",
                "platform": "FACEBOOK",
                "status": "ACTIVE",
                "leadsCount": 450,
                "qualifiedCount": 180,
                "convertedCount": 12,
                "adSet": "AS_SUMMER_2024",
                "creativeId": "CR_001",
                "utmSource": "facebook",
                "utmMedium": "paid_ad",
                "budget": 5000,
                "spent": 3200,
                "createdAt": datetime(2024, 4, 1),
                "endDate": datetime(2024, 6, 30)
            },
            {
                "_id": "c2",
                "name": "UK Webinar Promotion",
                "platform": "INSTAGRAM",
                "status": "ACTIVE",
                "leadsCount": 320,
                "qualifiedCount": 140,
                "convertedCount": 8,
                "adSet": "AS_UK_WEBINAR",
                "creativeId": "CR_002",
                "utmSource": "instagram",
                "utmMedium": "story",
                "budget": 3000,
                "spent": 2100,
                "createdAt": datetime(2024, 5, 1),
                "endDate": datetime(2024, 5, 31)
            },
            {
                "_id": "c3",
                "name": "Australia Education Fair",
                "platform": "GOOGLE",
                "status": "COMPLETED",
                "leadsCount": 280,
                "qualifiedCount": 95,
                "convertedCount": 15,
                "adSet": "AS_AUS_FAIR",
                "creativeId": "CR_003",
                "utmSource": "google",
                "utmMedium": "search",
                "budget": 4000,
                "spent": 4000,
                "createdAt": datetime(2024, 3, 15),
                "endDate": datetime(2024, 4, 15)
            }
        ]
        self.db.campaigns.insert_many(campaigns)
        print(f"   ✓ Inserted {len(campaigns)} campaigns\n")
    
    def insert_agents(self):
        """Insert referral agent data"""
        print("🤝 Inserting agents...")
        agents = [
            {
                "_id": "a1",
                "name": "Global Link Consultancy",
                "email": "contact@globallink.com",
                "phone": "+91 1122334455",
                "referralCode": "GLO2024",
                "commissionModel": "FIXED",
                "commissionValue": 500,
                "totalEarned": 12000,
                "totalPaid": 10000,
                "pendingAmount": 2000,
                "totalReferrals": 24,
                "convertedReferrals": 18,
                "status": "ACTIVE",
                "createdAt": datetime(2023, 1, 15)
            },
            {
                "_id": "a2",
                "name": "EduBridge Partners",
                "email": "info@edubridge.com",
                "phone": "+91 2233445566",
                "referralCode": "EBP2024",
                "commissionModel": "PERCENTAGE",
                "commissionValue": 10,  # 10%
                "totalEarned": 8500,
                "totalPaid": 8500,
                "pendingAmount": 0,
                "totalReferrals": 15,
                "convertedReferrals": 12,
                "status": "ACTIVE",
                "createdAt": datetime(2023, 6, 1)
            },
            {
                "_id": "a3",
                "name": "Study Abroad Network",
                "email": "support@studyabroad.net",
                "phone": "+91 3344556677",
                "referralCode": "SAN2024",
                "commissionModel": "FIXED",
                "commissionValue": 750,
                "totalEarned": 4500,
                "totalPaid": 3000,
                "pendingAmount": 1500,
                "totalReferrals": 8,
                "convertedReferrals": 6,
                "status": "ACTIVE",
                "createdAt": datetime(2024, 1, 10)
            }
        ]
        self.db.agents.insert_many(agents)
        print(f"   ✓ Inserted {len(agents)} agents\n")
    
    def insert_payouts(self):
        """Insert agent payout data"""
        print("💰 Inserting payouts...")
        payouts = [
            {
                "_id": "pay1",
                "agentId": "a1",
                "agentName": "Global Link Consultancy",
                "amount": 2000,
                "status": "PENDING",
                "date": datetime(2024, 5, 15),
                "remarks": "May 2024 commission",
                "invoiceNumber": "INV-2024-001"
            },
            {
                "_id": "pay2",
                "agentId": "a2",
                "agentName": "EduBridge Partners",
                "amount": 1500,
                "status": "PAID",
                "date": datetime(2024, 5, 1),
                "paidDate": datetime(2024, 5, 5),
                "remarks": "April 2024 commission",
                "invoiceNumber": "INV-2024-002",
                "paymentMethod": "Bank Transfer"
            },
            {
                "_id": "pay3",
                "agentId": "a3",
                "agentName": "Study Abroad Network",
                "amount": 1500,
                "status": "PENDING",
                "date": datetime(2024, 5, 10),
                "remarks": "Q1 2024 commission",
                "invoiceNumber": "INV-2024-003"
            }
        ]
        self.db.payouts.insert_many(payouts)
        print(f"   ✓ Inserted {len(payouts)} payouts\n")
    
    def insert_fraud_alerts(self):
        """Insert fraud detection alerts"""
        print("🚨 Inserting fraud alerts...")
        alerts = [
            {
                "_id": "fa1",
                "leadId": "l1",
                "leadName": "Aravind Kumar",
                "agentId": "a1",
                "agentName": "Global Link Consultancy",
                "reason": "DUPLICATE_PHONE",
                "severity": "HIGH",
                "timestamp": datetime(2024, 5, 18, 14, 0, 0),
                "resolved": False,
                "details": "Phone number matches existing lead in system"
            },
            {
                "_id": "fa2",
                "leadId": "l4",
                "leadName": "Priya Patel",
                "agentId": "a1",
                "agentName": "Global Link Consultancy",
                "reason": "RE-REFERRAL",
                "severity": "MEDIUM",
                "timestamp": datetime(2024, 5, 17, 10, 30, 0),
                "resolved": True,
                "resolvedBy": "u1",
                "resolvedAt": datetime(2024, 5, 18, 9, 0, 0),
                "details": "Lead was previously referred 6 months ago"
            }
        ]
        self.db.fraud_alerts.insert_many(alerts)
        print(f"   ✓ Inserted {len(alerts)} fraud alerts\n")
    
    def insert_activity_logs(self):
        """Insert system activity logs"""
        print("📝 Inserting activity logs...")
        logs = [
            {
                "_id": "log1",
                "userId": "u1",
                "userName": "Alex Super",
                "action": "LOGIN",
                "details": "User logged in successfully",
                "timestamp": datetime(2024, 5, 18, 9, 0, 0),
                "ipAddress": "192.168.1.1",
                "userAgent": "Mozilla/5.0"
            },
            {
                "_id": "log2",
                "userId": "u4",
                "userName": "Lisa Counselor",
                "action": "LEAD_UPDATE",
                "details": "Updated status for Aravind Kumar from NEW to QUALIFIED",
                "timestamp": datetime(2024, 5, 18, 10, 30, 0),
                "ipAddress": "192.168.1.4",
                "resourceId": "l1",
                "resourceType": "lead"
            },
            {
                "_id": "log3",
                "userId": "u3",
                "userName": "John Caller",
                "action": "CALL_LOG",
                "details": "Called Rohit Sharma - Interested",
                "timestamp": datetime(2024, 5, 18, 11, 15, 0),
                "ipAddress": "192.168.1.3",
                "resourceId": "l3",
                "resourceType": "lead"
            },
            {
                "_id": "log4",
                "userId": "u2",
                "userName": "Sarah Admin",
                "action": "TASK_ASSIGN",
                "details": "Assigned task 'Document Verification' to John Caller",
                "timestamp": datetime(2024, 5, 18, 12, 0, 0),
                "ipAddress": "192.168.1.2",
                "resourceId": "t2",
                "resourceType": "task"
            },
            {
                "_id": "log5",
                "userId": "u5",
                "userName": "Mark AI",
                "action": "AI_CONFIG",
                "details": "Updated WhatsApp AI response template",
                "timestamp": datetime(2024, 5, 18, 13, 30, 0),
                "ipAddress": "192.168.1.5"
            }
        ]
        self.db.activity_logs.insert_many(logs)
        print(f"   ✓ Inserted {len(logs)} activity logs\n")
    
    def insert_whatsapp_templates(self):
        """Insert WhatsApp message templates"""
        print("📱 Inserting WhatsApp templates...")
        templates = [
            {
                "_id": "wt1",
                "name": "Inquiry Greeting",
                "content": "Hello {{name}}, thanks for your inquiry about {{program}}. How can we help today?",
                "language": "English",
                "category": "UTILITY",
                "variables": ["name", "program"],
                "status": "APPROVED",
                "createdAt": datetime(2024, 1, 1)
            },
            {
                "_id": "wt2",
                "name": "Document Follow-up",
                "content": "Hi {{name}}, please upload your marksheets to proceed with the application.",
                "language": "English",
                "category": "MARKETING",
                "variables": ["name"],
                "status": "APPROVED",
                "createdAt": datetime(2024, 1, 1)
            },
            {
                "_id": "wt3",
                "name": "Scholarship Alert",
                "content": "Great news {{name}}! {{university}} is offering {{scholarship_amount}} scholarship for {{program}}. Reply YES if interested.",
                "language": "English",
                "category": "MARKETING",
                "variables": ["name", "university", "scholarship_amount", "program"],
                "status": "APPROVED",
                "createdAt": datetime(2024, 2, 1)
            }
        ]
        self.db.whatsapp_templates.insert_many(templates)
        print(f"   ✓ Inserted {len(templates)} WhatsApp templates\n")
    
    def insert_system_settings(self):
        """Insert system configuration settings"""
        print("⚙️  Inserting system settings...")
        settings = {
            "_id": "system_config",
            "countries": ["USA", "UK", "Canada", "Australia", "Germany", "Ireland", "New Zealand", "Singapore"],
            "universities": [
                {"name": "University of Oxford", "country": "UK", "ranking": 1},
                {"name": "Harvard University", "country": "USA", "ranking": 2},
                {"name": "University of Toronto", "country": "Canada", "ranking": 18},
                {"name": "Australian National University", "country": "Australia", "ranking": 24},
                {"name": "Technical University of Munich", "country": "Germany", "ranking": 37},
                {"name": "Trinity College Dublin", "country": "Ireland", "ranking": 98}
            ],
            "interestCategories": [
                "Engineering", "Business", "Arts", "Sciences", "Health", 
                "Computer Science", "Law", "Education", "Architecture"
            ],
            "programs": [
                "Bachelors", "Masters", "PhD", "MBA", "Diploma", "Certificate"
            ],
            "consentText": "I agree to receive educational updates and counseling communications via WhatsApp and Email.",
            "privacyPolicy": "Your personal information is stored securely and used solely for educational consultancy purposes. We comply with GDPR and data protection regulations.",
            "pipelineStages": [
                {"id": "new", "label": "New", "color": "#6366f1", "order": 1},
                {"id": "contacted", "label": "Contacted", "color": "#8b5cf6", "order": 2},
                {"id": "qualified", "label": "Qualified", "color": "#ec4899", "order": 3},
                {"id": "counseling", "label": "Counseling", "color": "#f43f5e", "order": 4},
                {"id": "applied", "label": "Applied", "color": "#f59e0b", "order": 5},
                {"id": "offer", "label": "Offer", "color": "#10b981", "order": 6},
                {"id": "converted", "label": "Converted", "color": "#06b6d4", "order": 7},
                {"id": "lost", "label": "Lost", "color": "#64748b", "order": 8}
            ],
            "slaSettings": {
                "hotLeadResponseTime": 30,  # minutes
                "warmLeadResponseTime": 120,  # minutes
                "coldLeadResponseTime": 1440,  # minutes (24 hours)
                "taskOverdueAlert": 60  # minutes before due time
            },
            "commissionRates": {
                "default": 500,
                "percentage": 10
            },
            "updatedAt": datetime.now()
        }
        self.db.system_settings.insert_one(settings)
        print(f"   ✓ Inserted system settings\n")
    
    def generate_summary(self):
        """Generate summary of database setup"""
        print("\n" + "="*60)
        print("📊 DATABASE SETUP SUMMARY")
        print("="*60)
        
        collections = {
            "Teams": self.db.teams.count_documents({}),
            "Users": self.db.users.count_documents({}),
            "Projects": self.db.projects.count_documents({}),
            "Leads": self.db.leads.count_documents({}),
            "Tasks": self.db.tasks.count_documents({}),
            "WhatsApp Conversations": self.db.whatsapp_conversations.count_documents({}),
            "Lead Sheets": self.db.lead_sheets.count_documents({}),
            "Sheet Rows": self.db.sheet_rows.count_documents({}),
            "Campaigns": self.db.campaigns.count_documents({}),
            "Agents": self.db.agents.count_documents({}),
            "Payouts": self.db.payouts.count_documents({}),
            "Fraud Alerts": self.db.fraud_alerts.count_documents({}),
            "Activity Logs": self.db.activity_logs.count_documents({}),
            "WhatsApp Templates": self.db.whatsapp_templates.count_documents({}),
            "System Settings": self.db.system_settings.count_documents({})
        }
        
        for collection, count in collections.items():
            print(f"   {collection:<25} : {count:>5} documents")
        
        print("\n" + "="*60)
        print("✅ Database setup completed successfully!")
        print("="*60)
        print(f"\n🔗 MongoDB URI: {MONGO_URI}")
        print(f"📂 Database: {DB_NAME}")
        print("\n📝 Sample Login Credentials:")
        print("   Email: alex@edulead.com (Super Admin)")
        print("   Email: sarah@edulead.com (Admin)")
        print("   Email: john@edulead.com (Telecaller)")
        print("   Email: lisa@edulead.com (Counselor)")
        print("\n💡 Next Steps:")
        print("   1. Create a backend API to connect this database")
        print("   2. Update frontend to use real API instead of mock data")
        print("   3. Implement authentication with JWT tokens")
        print("   4. Add data validation and security measures")
        print("\n")
    
    def run_full_setup(self):
        """Run complete database setup"""
        print("\n" + "="*60)
        print("🚀 EDULEAD PRO CRM - MongoDB Setup")
        print("="*60 + "\n")
        
        # Ask if user wants to drop existing database
        self.drop_existing_database()
        
        # Create collections and indexes
        self.create_collections_and_indexes()
        
        # Insert all data
        self.insert_teams()
        self.insert_users()
        self.insert_projects()
        self.insert_leads()
        self.insert_tasks()
        self.insert_whatsapp_conversations()
        self.insert_lead_sheets()
        self.insert_sheet_rows()
        self.insert_campaigns()
        self.insert_agents()
        self.insert_payouts()
        self.insert_fraud_alerts()
        self.insert_activity_logs()
        self.insert_whatsapp_templates()
        self.insert_system_settings()
        
        # Generate summary
        self.generate_summary()
        
        # Close connection
        self.client.close()
        print("🔌 MongoDB connection closed.\n")


if __name__ == "__main__":
    setup = EduLeadDBSetup()
    setup.run_full_setup()
