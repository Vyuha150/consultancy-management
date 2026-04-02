
from pymongo import MongoClient
from datetime import datetime, timedelta
import json
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "edulead_crm")

class EduLeadQueries:
    def __init__(self):
        self.client = MongoClient(MONGO_URI)
        self.db = self.client[DB_NAME]
    
    def get_all_leads(self, limit=100):
        """Get all leads with pagination"""
        leads = list(self.db.leads.find().limit(limit))
        return self._serialize(leads)
    
    def get_leads_by_stage(self, stage):
        """Get leads by specific stage (NEW, QUALIFIED, COUNSELING, etc.)"""
        leads = list(self.db.leads.find({"stage": stage}))
        return self._serialize(leads)
    
    def get_leads_by_interest_level(self, level):
        """Get leads by interest level (HOT, WARM, COLD)"""
        leads = list(self.db.leads.find({"interestLevel": level}))
        return self._serialize(leads)
    
    def get_leads_assigned_to_user(self, user_id):
        """Get all leads assigned to a specific user"""
        leads = list(self.db.leads.find({"assignedTo": user_id}))
        return self._serialize(leads)
    
    def get_ai_flagged_leads(self):
        """Get all leads flagged by AI"""
        leads = list(self.db.leads.find({"aiFlagged": True}))
        return self._serialize(leads)
    
    def get_lead_by_id(self, lead_id):
        """Get single lead by ID"""
        lead = self.db.leads.find_one({"_id": lead_id})
        return self._serialize(lead)
    
    def search_leads(self, search_term):
        """Search leads by name, email, or phone"""
        query = {
            "$or": [
                {"name": {"$regex": search_term, "$options": "i"}},
                {"email": {"$regex": search_term, "$options": "i"}},
                {"phone": {"$regex": search_term, "$options": "i"}}
            ]
        }
        leads = list(self.db.leads.find(query))
        return self._serialize(leads)
    
    def get_user_by_email(self, email):
        """Get user by email (for login)"""
        user = self.db.users.find_one({"email": email})
        return self._serialize(user)
    
    def get_users_by_role(self, role):
        """Get all users with specific role"""
        users = list(self.db.users.find({"role": role}))
        return self._serialize(users)
    
    def get_active_users(self):
        """Get all active users"""
        users = list(self.db.users.find({"status": "ACTIVE"}))
        return self._serialize(users)
    
    def get_tasks_for_user(self, user_id):
        """Get all tasks assigned to a user"""
        tasks = list(self.db.tasks.find({"assignedTo": user_id}))
        return self._serialize(tasks)
    
    def get_overdue_tasks(self):
        """Get all overdue tasks"""
        tasks = list(self.db.tasks.find({"status": "OVERDUE"}))
        return self._serialize(tasks)
    
    def get_tasks_by_status(self, status):
        """Get tasks by status (ASSIGNED, IN_PROGRESS, COMPLETED, etc.)"""
        tasks = list(self.db.tasks.find({"status": status}))
        return self._serialize(tasks)
    
    def get_active_whatsapp_conversations(self):
        """Get all active WhatsApp conversations"""
        convos = list(self.db.whatsapp_conversations.find({"status": "ACTIVE"}))
        return self._serialize(convos)
    
    def get_conversation_by_lead(self, lead_id):
        """Get WhatsApp conversation for a specific lead"""
        convo = self.db.whatsapp_conversations.find_one({"leadId": lead_id})
        return self._serialize(convo)
    
    def get_active_campaigns(self):
        """Get all active marketing campaigns"""
        campaigns = list(self.db.campaigns.find({"status": "ACTIVE"}))
        return self._serialize(campaigns)
    
    def get_campaign_performance(self):
        """Get campaign performance metrics"""
        pipeline = [
            {
                "$group": {
                    "_id": "$platform",
                    "totalLeads": {"$sum": "$leadsCount"},
                    "totalQualified": {"$sum": "$qualifiedCount"},
                    "totalConverted": {"$sum": "$convertedCount"},
                    "campaigns": {"$sum": 1}
                }
            }
        ]
        performance = list(self.db.campaigns.aggregate(pipeline))
        return self._serialize(performance)
    
    def get_leads_by_source(self):
        """Get lead count grouped by source"""
        pipeline = [
            {
                "$group": {
                    "_id": "$source",
                    "count": {"$sum": 1},
                    "hot": {
                        "$sum": {"$cond": [{"$eq": ["$interestLevel", "HOT"]}, 1, 0]}
                    },
                    "warm": {
                        "$sum": {"$cond": [{"$eq": ["$interestLevel", "WARM"]}, 1, 0]}
                    },
                    "cold": {
                        "$sum": {"$cond": [{"$eq": ["$interestLevel", "COLD"]}, 1, 0]}
                    }
                }
            }
        ]
        stats = list(self.db.leads.aggregate(pipeline))
        return self._serialize(stats)
    
    def get_lead_sheets_for_user(self, user_id):
        """Get all lead sheets assigned to a telecaller"""
        sheets = list(self.db.lead_sheets.find({"assignedTo": user_id}))
        return self._serialize(sheets)
    
    def get_sheet_rows(self, sheet_id):
        """Get all rows from a specific sheet"""
        rows = list(self.db.sheet_rows.find({"sheetId": sheet_id}))
        return self._serialize(rows)
    
    def get_pending_payouts(self):
        """Get all pending agent payouts"""
        payouts = list(self.db.payouts.find({"status": "PENDING"}))
        return self._serialize(payouts)
    
    def get_agent_stats(self, agent_id):
        """Get statistics for a specific agent"""
        agent = self.db.agents.find_one({"_id": agent_id})
        return self._serialize(agent)
    
    def get_unresolved_fraud_alerts(self):
        """Get all unresolved fraud alerts"""
        alerts = list(self.db.fraud_alerts.find({"resolved": False}))
        return self._serialize(alerts)
    
    def get_recent_activity_logs(self, limit=50):
        """Get recent activity logs"""
        logs = list(self.db.activity_logs.find().sort("timestamp", -1).limit(limit))
        return self._serialize(logs)
    
    def get_user_activity(self, user_id, days=7):
        """Get activity logs for a specific user in the last N days"""
        since = datetime.now() - timedelta(days=days)
        logs = list(self.db.activity_logs.find({
            "userId": user_id,
            "timestamp": {"$gte": since}
        }).sort("timestamp", -1))
        return self._serialize(logs)
    
    def get_dashboard_stats(self):
        """Get overall dashboard statistics"""
        stats = {
            "totalLeads": self.db.leads.count_documents({}),
            "hotLeads": self.db.leads.count_documents({"interestLevel": "HOT"}),
            "qualifiedLeads": self.db.leads.count_documents({"stage": "QUALIFIED"}),
            "convertedLeads": self.db.leads.count_documents({"stage": "CONVERTED"}),
            "activeUsers": self.db.users.count_documents({"status": "ACTIVE"}),
            "pendingTasks": self.db.tasks.count_documents({"status": {"$in": ["ASSIGNED", "IN_PROGRESS"]}}),
            "overdueTasks": self.db.tasks.count_documents({"status": "OVERDUE"}),
            "activeConversations": self.db.whatsapp_conversations.count_documents({"status": "ACTIVE"}),
            "activeCampaigns": self.db.campaigns.count_documents({"status": "ACTIVE"}),
            "pendingPayouts": self.db.payouts.count_documents({"status": "PENDING"})
        }
        return stats
    
    def get_system_settings(self):
        """Get system configuration"""
        settings = self.db.system_settings.find_one({"_id": "system_config"})
        return self._serialize(settings)
    
    def get_whatsapp_templates(self):
        """Get all WhatsApp message templates"""
        templates = list(self.db.whatsapp_templates.find({"status": "APPROVED"}))
        return self._serialize(templates)
    
    def get_teams(self):
        """Get all teams"""
        teams = list(self.db.teams.find())
        return self._serialize(teams)
    
    def get_team_members(self, team_id):
        """Get all members of a specific team"""
        members = list(self.db.users.find({"teamId": team_id}))
        return self._serialize(members)
    
    def _serialize(self, data):
        """Convert MongoDB documents to JSON-serializable format"""
        if data is None:
            return None
        if isinstance(data, list):
            return [self._convert_doc(doc) for doc in data]
        return self._convert_doc(data)
    
    def _convert_doc(self, doc):
        """Convert a single document"""
        if isinstance(doc, dict):
            result = {}
            for key, value in doc.items():
                if isinstance(value, datetime):
                    result[key] = value.isoformat()
                elif isinstance(value, list):
                    result[key] = [self._convert_doc(item) for item in value]
                elif isinstance(value, dict):
                    result[key] = self._convert_doc(value)
                else:
                    result[key] = value
            return result
        return doc
    
    def close(self):
        """Close database connection"""
        self.client.close()


# Example usage
if __name__ == "__main__":
    queries = EduLeadQueries()
    
    print("="*60)
    print("📊 EDULEAD PRO CRM - Database Query Examples")
    print("="*60 + "\n")
    
    # Dashboard Stats
    print("📈 Dashboard Statistics:")
    stats = queries.get_dashboard_stats()
    for key, value in stats.items():
        print(f"   {key:<20}: {value}")
    print()
    
    # Hot Leads
    print("🔥 Hot Leads:")
    hot_leads = queries.get_leads_by_interest_level("HOT")
    for lead in hot_leads:
        print(f"   - {lead['name']} ({lead['email']}) - {lead['stage']}")
    print()
    
    # Active WhatsApp Conversations
    print("💬 Active WhatsApp Conversations:")
    conversations = queries.get_active_whatsapp_conversations()
    for convo in conversations:
        print(f"   - {convo['leadName']}: {convo['lastMessage'][:50]}...")
    print()
    
    # Overdue Tasks
    print("⏰ Overdue Tasks:")
    overdue = queries.get_overdue_tasks()
    for task in overdue:
        print(f"   - {task['title']} (Due: {task['dueDate'][:10]})")
    print()
    
    # Lead Source Distribution
    print("📍 Lead Distribution by Source:")
    source_stats = queries.get_leads_by_source()
    for stat in source_stats:
        print(f"   {stat['_id']:<20}: {stat['count']} total (🔥 {stat['hot']} hot)")
    print()
    
    # Campaign Performance
    print("📢 Campaign Performance:")
    campaign_perf = queries.get_campaign_performance()
    for perf in campaign_perf:
        conversion_rate = (perf['totalConverted'] / perf['totalLeads'] * 100) if perf['totalLeads'] > 0 else 0
        print(f"   {perf['_id']:<15}: {perf['totalLeads']} leads, {perf['totalConverted']} converted ({conversion_rate:.1f}%)")
    print()
    
    # Active Users
    print("👥 Active Users:")
    users = queries.get_active_users()
    for user in users:
        print(f"   - {user['name']:<20} ({user['role']})")
    print()
    
    print("="*60)
    print("✅ Query examples completed!")
    print("="*60 + "\n")
    
    queries.close()
