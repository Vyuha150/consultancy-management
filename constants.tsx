
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  PhoneCall, 
  Bot, 
  Share2, 
  MapPin, 
  CheckSquare, 
  TrendingUp,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  UserCog,
  Settings,
  ClipboardList
} from 'lucide-react';
import { UserRole, LeadSource, LeadStage, InterestLevel, Lead, User, LeadSheet, SheetRow, CallStatus, WhatsAppConversation, Task, Campaign, Agent, Payout, FraudAlert, DataScope, Team, ActivityLog, WhatsAppTemplate, SystemSettings, Project, EmployeeStats } from './types';

export const ROLES_CONFIG = {
  [UserRole.SUPER_ADMIN]: { label: 'Super Admin', permissions: ['all'] },
  [UserRole.ADMIN]: { label: 'Admin', permissions: ['manage_users', 'view_reports', 'assign_leads'] },
  [UserRole.TELECALLER]: { label: 'Telecaller', permissions: ['view_assigned_sheets', 'call_logs'] },
  [UserRole.COUNSELOR]: { label: 'Counselor', permissions: ['manage_pipeline', 'admissions'] },
  [UserRole.SOCIAL_MEDIA]: { label: 'Social Media', permissions: ['create_leads', 'campaigns'] },
  [UserRole.FIELD_MARKETING]: { label: 'Field Marketing', permissions: ['field_leads'] },
  [UserRole.AGENT_MANAGER]: { label: 'Agent Manager', permissions: ['referrals'] },
  [UserRole.AI_OPERATOR]: { label: 'AI Operator', permissions: ['ai_logs', 'ai_config'] },
};

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alex Super', email: 'alex@edulead.com', role: UserRole.SUPER_ADMIN, avatar: 'https://picsum.photos/seed/alex/100', status: 'ACTIVE', dataScope: DataScope.ALL_LEADS, teamId: 't1', lastActive: '2 mins ago', isOnline: true },
  { id: 'u2', name: 'Sarah Admin', email: 'sarah@edulead.com', role: UserRole.ADMIN, avatar: 'https://picsum.photos/seed/sarah/100', status: 'ACTIVE', dataScope: DataScope.ALL_LEADS, teamId: 't1', lastActive: '10 mins ago', isOnline: true },
  { id: 'u3', name: 'John Caller', email: 'john@edulead.com', role: UserRole.TELECALLER, avatar: 'https://picsum.photos/seed/john/100', status: 'ACTIVE', dataScope: DataScope.ONLY_ASSIGNED, teamId: 't2', lastActive: '1 hour ago', isOnline: false },
  { id: 'u4', name: 'Lisa Counselor', email: 'lisa@edulead.com', role: UserRole.COUNSELOR, avatar: 'https://picsum.photos/seed/lisa/100', status: 'ACTIVE', dataScope: DataScope.TEAM_ONLY, teamId: 't3', lastActive: 'Active now', isOnline: true },
  { id: 'u5', name: 'Mark AI', email: 'mark@edulead.com', role: UserRole.AI_OPERATOR, avatar: 'https://picsum.photos/seed/mark/100', status: 'ACTIVE', dataScope: DataScope.ALL_LEADS, teamId: 't1', lastActive: '5 hours ago', isOnline: false },
  { id: 'u6', name: 'Kevin Field', email: 'kevin@edulead.com', role: UserRole.FIELD_MARKETING, avatar: 'https://picsum.photos/seed/kevin/100', status: 'ACTIVE', dataScope: DataScope.ONLY_ASSIGNED, teamId: 't4', lastActive: 'Active now', isOnline: true },
];

export const MOCK_EMPLOYEE_STATS: EmployeeStats[] = [
  {
    userId: 'u3', completedTasks: 42, pendingTasks: 18, overdueTasks: 5, leadsGenerated: 124, conversions: 12,
    slaPercentage: 88, avgResponseTime: '15m', capacity: 7, maxCapacity: 10,
    slaHistory: [
      {date: '11 May', value: 85}, {date: '12 May', value: 92}, {date: '13 May', value: 88}, 
      {date: '14 May', value: 90}, {date: '15 May', value: 84}, {date: '16 May', value: 88}, {date: '17 May', value: 88}
    ],
    sourceSplit: [
      {source: LeadSource.TELECALLER_SHEET, count: 80}, {source: LeadSource.WHATSAPP_AI, count: 20}, {source: LeadSource.REFERRAL, count: 24}
    ]
  },
  {
    userId: 'u4', completedTasks: 28, pendingTasks: 8, overdueTasks: 0, leadsGenerated: 45, conversions: 22,
    slaPercentage: 96, avgResponseTime: '8m', capacity: 4, maxCapacity: 10,
    slaHistory: [
      {date: '11 May', value: 94}, {date: '12 May', value: 98}, {date: '13 May', value: 95}, 
      {date: '14 May', value: 96}, {date: '15 May', value: 97}, {date: '16 May', value: 96}, {date: '17 May', value: 96}
    ],
    sourceSplit: [
      {source: LeadSource.WHATSAPP_AI, count: 35}, {source: LeadSource.SOCIAL_MEDIA, count: 5}, {source: LeadSource.REFERRAL, count: 5}
    ]
  }
];

export const MOCK_PROJECTS: Project[] = [
  { id: 'p1', name: '2026 Feb Intake – USA Counseling', description: 'Priority handling for upcoming Spring intake', type: 'INTAKE', createdAt: '2024-05-01' },
  { id: 'p2', name: 'Telegram Telecalling Batch #24', description: 'Bulk calling for engineering seminar leads', type: 'BATCH', createdAt: '2024-05-10' },
  { id: 'p3', name: 'Instagram Leads – KL University', description: 'Focused campaign for South Region students', type: 'CAMPAIGN', createdAt: '2024-05-12' },
];

export const MOCK_TASKS: Task[] = [
  { 
    id: 't1', leadId: 'l1', leadName: 'Aravind Kumar', leadPhone: '+91 9876543210', projectId: 'p1',
    title: 'Initial Counseling Session', description: 'Discuss UK universities and IELTS waivers', 
    dueDate: '2024-05-20', status: 'ASSIGNED', assignedTo: 'u4', type: 'COUNSELING', priority: 'HIGH',
    slaDeadline: '2024-05-20T18:00:00Z', source: LeadSource.WHATSAPP_AI
  },
  { 
    id: 't2', leadId: 'l3', leadName: 'Rohit Sharma', leadPhone: '+91 8887776660', projectId: 'p2',
    title: 'Document Verification', description: 'Check 10th and 12th certificates', 
    dueDate: '2024-05-18', status: 'OVERDUE', assignedTo: 'u3', type: 'DOC_COLLECTION', priority: 'MEDIUM',
    slaDeadline: '2024-05-18T12:00:00Z', source: LeadSource.TELECALLER_SHEET,
    checklist: [{ item: '10th Marksheet', completed: true }, { item: 'Passport Copy', completed: false }]
  },
  { 
    id: 't3', leadId: 'l2', leadName: 'Jessica Smith', leadPhone: '+1 4567890123', projectId: 'p3',
    title: 'Lead Follow-up Call', description: 'Discuss MBA tuition fees and scholarships', 
    dueDate: '2024-05-21', status: 'IN_PROGRESS', assignedTo: 'u2', type: 'CALL', priority: 'LOW',
    slaDeadline: '2024-05-21T10:30:00Z', source: LeadSource.SOCIAL_MEDIA
  },
  {
    id: 't4', leadName: 'Unassigned Inquiry', projectId: 'p1',
    title: 'Verify Application Form', description: 'Missing guardian signature on Form-A',
    dueDate: '2024-05-22', status: 'UNASSIGNED', type: 'APPLICATION', priority: 'HIGH',
    source: LeadSource.FIELD_MARKETING
  }
];

export const MOCK_LEADS: Lead[] = [
  { 
    id: 'l1', name: 'Aravind Kumar', email: 'aravind@example.com', phone: '+91 9876543210', 
    source: LeadSource.WHATSAPP_AI, stage: LeadStage.QUALIFIED, interestLevel: InterestLevel.HOT, 
    assignedTo: 'u4', countryPreference: ['UK'], program: 'Masters in Computer Science', 
    budget: '$30,000', intakeMonth: 'September 2024', consentStatus: true, consentDate: '2024-05-10',
    createdAt: '2024-05-01', updatedAt: '2024-05-18', followUpDate: '2024-05-20', 
    notes: [], tasks: [], aiFlagged: true,
    aiMetrics: { interestScore: 94, intent: 'High interest in UK CS programs', queries: ['Scholarships?'], bestTimeToCall: '6 PM - 8 PM' }
  },
  { 
    id: 'l2', name: 'Jessica Smith', email: 'jessica@example.com', phone: '+1 4567890123', 
    source: LeadSource.SOCIAL_MEDIA, stage: LeadStage.NEW, interestLevel: InterestLevel.WARM, 
    assignedTo: 'u2', countryPreference: ['USA', 'Canada'], program: 'MBA', 
    budget: '$50,000', intakeMonth: 'January 2025', consentStatus: true, consentDate: '2024-05-12',
    createdAt: '2024-05-12', updatedAt: '2024-05-15', followUpDate: '2024-05-21', 
    notes: [], tasks: [], aiFlagged: false
  },
  { 
    id: 'l3', name: 'Rohit Sharma', email: 'rohit@example.com', phone: '+91 8887776660', 
    source: LeadSource.TELECALLER_SHEET, stage: LeadStage.COUNSELING, interestLevel: InterestLevel.HOT, 
    assignedTo: 'u3', countryPreference: ['Australia'], program: 'Engineering', 
    budget: '$25,000', intakeMonth: 'February 2025', consentStatus: false,
    createdAt: '2024-05-05', updatedAt: '2024-05-17', followUpDate: '2024-05-18', 
    notes: [], tasks: [], aiFlagged: true,
    aiMetrics: { interestScore: 88, intent: 'Looking for scholarships in Australia', queries: ['Accommodation'], bestTimeToCall: 'Morning' }
  },
];

export const MOCK_SHEETS: LeadSheet[] = [
  { id: 's1', name: 'Engineering Seminar Leads - May', assignedTo: ['u3'], totalRows: 150, completedRows: 45, status: 'ACTIVE', createdAt: '2024-05-01' },
  { id: 's2', name: 'Facebook Ad Inquiries', assignedTo: ['u3', 'u2'], totalRows: 80, completedRows: 80, status: 'ARCHIVED', createdAt: '2024-04-15' },
];

export const MOCK_SHEET_ROWS: SheetRow[] = [
  { id: 'sr1', sheetId: 's1', name: 'Rajesh Patil', phone: '+91 9123456780', location: 'Mumbai', callStatus: CallStatus.INTERESTED, interestLevel: InterestLevel.HOT, remarks: 'Wants to study in Canada', isPotential: true, isConverted: false, updatedAt: '2024-05-18' },
  { id: 'sr2', sheetId: 's1', name: 'Sneha Rao', phone: '+91 9876543211', location: 'Bangalore', callStatus: CallStatus.BUSY, remarks: 'Call back later', isPotential: false, isConverted: false, updatedAt: '2024-05-18' },
];

export const MOCK_WHATSAPP: WhatsAppConversation[] = [
  { id: 'w1', leadId: 'l1', leadName: 'Aravind Kumar', lastMessage: 'What is the tuition fee for UK?', timestamp: '10:15 AM', status: 'ACTIVE', interestScore: 94, unreadCount: 2 },
  { id: 'w2', leadId: 'l2', leadName: 'Jessica Smith', lastMessage: 'Thank you for the info.', timestamp: 'Yesterday', status: 'HANDED_OFF', interestScore: 82, unreadCount: 0 },
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 'c1', name: 'Summer 2024 Intake Ads', platform: 'FACEBOOK', status: 'ACTIVE', leadsCount: 450, qualifiedCount: 180, convertedCount: 12, utmSource: 'facebook', utmMedium: 'paid_ad', createdAt: '2024-04-01' },
  { id: 'c2', name: 'UK Webinar Promotion', platform: 'INSTAGRAM', status: 'ACTIVE', leadsCount: 320, qualifiedCount: 140, convertedCount: 8, utmSource: 'instagram', utmMedium: 'story', createdAt: '2024-05-01' },
];

export const MOCK_AGENTS: Agent[] = [
  { id: 'a1', name: 'Global Link Consultancy', email: 'contact@globallink.com', phone: '+91 1122334455', referralCode: 'GLO2024', commissionModel: 'FIXED', commissionValue: 500, totalEarned: 12000, totalPaid: 10000, status: 'ACTIVE', createdAt: '2023-01-15' },
];

export const MOCK_PAYOUTS: Payout[] = [
  { id: 'pay1', agentId: 'a1', agentName: 'Global Link Consultancy', amount: 2000, status: 'PENDING', date: '2024-05-15' },
];

export const MOCK_FRAUD_ALERTS: FraudAlert[] = [
  { id: 'fa1', leadId: 'l1', leadName: 'Aravind Kumar', agentId: 'a1', agentName: 'Global Link Consultancy', reason: 'DUPLICATE_PHONE', severity: 'HIGH', timestamp: '2024-05-18T14:00:00Z' },
];

export const MOCK_TEAMS: Team[] = [
  { id: 't1', name: 'Management', description: 'Core administrative team', leadId: 'u1', memberCount: 5, type: 'OPERATIONS' },
  { id: 't2', name: 'Telecalling Squad', description: 'Direct lead generation team', leadId: 'u3', memberCount: 12, type: 'TELECALLING' },
  { id: 't3', name: 'Counseling Team', description: 'Student counseling and conversions', leadId: 'u4', memberCount: 8, type: 'COUNSELING' },
];

export const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
  { id: 'log1', userId: 'u1', userName: 'Alex Super', action: 'LOGIN', details: 'User logged in successfully', timestamp: '2024-05-18T09:00:00Z', ipAddress: '192.168.1.1' },
  { id: 'log2', userId: 'u4', userName: 'Lisa Counselor', action: 'LEAD_UPDATE', details: 'Updated status for Aravind Kumar', timestamp: '2024-05-18T10:30:00Z', ipAddress: '192.168.1.4' },
];

export const MOCK_REPORT_DATA = {
  sourceEfficiency: [
    { name: 'Telecaller', conversion: 28 },
    { name: 'WhatsApp AI', conversion: 42 },
    { name: 'Social Ads', conversion: 35 },
    { name: 'Referrals', conversion: 48 },
  ],
  monthlyTrend: [
    { month: 'Jan', converted: 12 },
    { month: 'Feb', converted: 18 },
    { month: 'Mar', converted: 25 },
    { month: 'Apr', converted: 22 },
    { month: 'May', converted: 28 },
  ],
  counselorPerformance: [
    { name: 'Lisa', conversion: 45, score: 92 },
    { name: 'Mike', conversion: 38, score: 88 },
  ],
  compliance: [
    { name: 'SLA Met', value: 92 },
    { name: 'Overdue', value: 8 },
  ],
  countryDemand: [
    { name: 'UK', value: 450 },
    { name: 'Canada', value: 380 },
    { name: 'USA', value: 310 },
    { name: 'Australia', value: 220 },
  ]
};

export const MOCK_SYSTEM_SETTINGS: SystemSettings = {
  countries: ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'Ireland'],
  universities: [
    { name: 'University of Oxford', country: 'UK' },
    { name: 'Harvard University', country: 'USA' },
    { name: 'University of Toronto', country: 'Canada' }
  ],
  interestCategories: ['Engineering', 'Business', 'Arts', 'Sciences', 'Health'],
  consentText: 'I agree to receive educational updates and counseling communications via WhatsApp and Email.',
  privacyPolicy: 'Your personal information is stored securely and used solely for educational consultancy purposes.',
  pipelineStages: [
    { id: 'new', label: 'New', color: '#6366f1' },
    { id: 'contacted', label: 'Contacted', color: '#8b5cf6' },
    { id: 'qualified', label: 'Qualified', color: '#ec4899' },
    { id: 'counseling', label: 'Counseling', color: '#f43f5e' },
    { id: 'applied', label: 'Applied', color: '#f59e0b' },
    { id: 'offer', label: 'Offer', color: '#10b981' },
    { id: 'converted', label: 'Converted', color: '#06b6d4' }
  ]
};

export const MOCK_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  { id: 'wt1', name: 'Inquiry Greeting', content: 'Hello {{name}}, thanks for your inquiry about {{program}}. How can we help today?', language: 'English', category: 'UTILITY' },
  { id: 'wt2', name: 'Document Follow-up', content: 'Hi {{name}}, please upload your marksheets to proceed with the application.', language: 'English', category: 'MARKETING' },
];

export const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AI_OPERATOR] },
  { id: 'assignment', label: 'Assignment Center', icon: <ClipboardList size={20} />, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
  { id: 'leads', label: 'All Leads', icon: <Users size={20} />, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.COUNSELOR, UserRole.SOCIAL_MEDIA] },
  { id: 'telecaller', label: 'Call Sheets', icon: <PhoneCall size={20} />, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TELECALLER] },
  { id: 'ai-bot', label: 'AI Agent', icon: <Bot size={20} />, roles: [UserRole.SUPER_ADMIN, UserRole.AI_OPERATOR] },
  { id: 'counselor-docs', label: 'Counselor Docs', icon: <FileText size={20} />, roles: [UserRole.SUPER_ADMIN] },
  { id: 'social', label: 'Social Media', icon: <Share2 size={20} />, roles: [UserRole.SUPER_ADMIN, UserRole.SOCIAL_MEDIA] },
  { id: 'field', label: 'Field Marketing', icon: <MapPin size={20} />, roles: [UserRole.SUPER_ADMIN, UserRole.FIELD_MARKETING] },
  { id: 'tasks', label: 'My Tasks', icon: <CheckSquare size={20} />, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TELECALLER, UserRole.COUNSELOR, UserRole.SOCIAL_MEDIA] },
  // { id: 'referrals', label: 'Referrals', icon: <TrendingUp size={20} />, roles: [UserRole.SUPER_ADMIN, UserRole.AGENT_MANAGER] },
  { id: 'employees', label: 'Employees', icon: <UserCog size={20} />, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
  // { id: 'reports', label: 'Reports', icon: <FileSpreadsheet size={20} />, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} />, roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TELECALLER, UserRole.COUNSELOR, UserRole.SOCIAL_MEDIA, UserRole.FIELD_MARKETING, UserRole.AGENT_MANAGER, UserRole.AI_OPERATOR] },
];
