export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  TELECALLER = 'TELECALLER',
  COUNSELOR = 'COUNSELOR',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  FIELD_MARKETING = 'FIELD_MARKETING',
  AGENT_MANAGER = 'AGENT_MANAGER',
  AI_OPERATOR = 'AI_OPERATOR'
}

export enum DataScope {
  ONLY_ASSIGNED = 'ONLY_ASSIGNED',
  TEAM_ONLY = 'TEAM_ONLY',
  ALL_LEADS = 'ALL_LEADS'
}

export enum LeadStage {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  COUNSELING = 'COUNSELING',
  APPLIED = 'APPLIED',
  OFFER = 'OFFER',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST'
}

export enum LeadSource {
  TELECALLER_SHEET = 'TELECALLER_SHEET',
  WHATSAPP_AI = 'WHATSAPP_AI',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  FIELD_MARKETING = 'FIELD_MARKETING',
  REFERRAL = 'REFERRAL'
}

export enum InterestLevel {
  HOT = 'HOT',
  WARM = 'WARM',
  COLD = 'COLD'
}

export enum CallStatus {
  NOT_CALLED = 'NOT_CALLED',
  CALLED = 'CALLED',
  BUSY = 'BUSY',
  WRONG_NUMBER = 'WRONG_NUMBER',
  NOT_INTERESTED = 'NOT_INTERESTED',
  INTERESTED = 'INTERESTED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  teamId?: string;
  dataScope: DataScope;
  status: 'ACTIVE' | 'INACTIVE';
  lastActive?: string;
  isOnline?: boolean;
}

export interface EmployeeStats {
  userId: string;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  leadsGenerated: number;
  conversions: number;
  slaPercentage: number;
  avgResponseTime: string; // e.g. "12m"
  capacity: number; // current
  maxCapacity: number; // default 10
  slaHistory: { date: string; value: number }[];
  sourceSplit: { source: LeadSource; count: number }[];
}

export interface Team {
  id: string;
  name: string;
  description: string;
  leadId: string; // User ID of Team Lead
  memberCount: number;
  type: 'TELECALLING' | 'COUNSELING' | 'MARKETING' | 'OPERATIONS';
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface Lead {
  id: string;
  name: string;
  guardianName?: string;
  email: string;
  phone: string;
  source: LeadSource;
  stage: LeadStage;
  interestLevel: InterestLevel;
  assignedTo?: string; // User ID
  countryPreference: string[];
  program: string;
  university?: string;
  college?: string;
  budget?: string;
  intakeMonth?: string;
  consentStatus: boolean;
  consentDate?: string;
  createdAt: string;
  updatedAt: string;
  followUpDate?: string;
  campaign?: string; // Campaign ID
  referralCode?: string;
  notes: LeadNote[];
  tasks: Task[];
  aiFlagged?: boolean;
  aiMetrics?: {
    interestScore: number;
    intent: string;
    queries: string[];
    bestTimeToCall: string;
  };
}

export interface LeadNote {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface Task {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  leadName?: string;
  leadId?: string;
  leadPhone?: string;
  dueDate: string;
  slaDeadline?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'UNASSIGNED';
  type?: string;
  assignedTo?: string;
  projectId?: string;
  source?: string;
  checklist?: Array<{ item: string; completed: boolean }>;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  type: 'INTAKE' | 'CAMPAIGN' | 'BATCH';
  createdAt: string;
}

export interface WhatsAppConversation {
  id: string;
  leadId: string;
  leadName: string;
  lastMessage: string;
  timestamp: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'HANDED_OFF';
  interestScore: number;
  unreadCount: number;
}

export interface LeadSheet {
  id: string;
  _id?: string; // MongoDB _id field
  name: string;
  assignedTo: string[]; // Telecaller IDs
  totalRows: number;
  completedRows: number;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  rows?: SheetRow[]; // Optional array of sheet rows
}

export interface SheetRow {
  id: string;
  sheetId: string;
  name: string;
  phone: string;
  location: string;
  callStatus: CallStatus;
  interestLevel?: InterestLevel;
  remarks: string;
  nextFollowUp?: string;
  isPotential: boolean;
  isConverted: boolean;
  lastEditedBy?: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  platform: 'FACEBOOK' | 'INSTAGRAM' | 'GOOGLE' | 'YOUTUBE' | 'TIKTOK';
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  leadsCount: number;
  qualifiedCount: number;
  convertedCount: number;
  adSet?: string;
  creativeId?: string;
  utmSource?: string;
  utmMedium?: string;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  referralCode: string;
  commissionModel: 'FIXED' | 'PERCENTAGE';
  commissionValue: number;
  totalEarned: number;
  totalPaid: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface Payout {
  id: string;
  agentId: string;
  agentName: string;
  amount: number;
  status: 'PENDING' | 'PAID';
  date: string;
  remarks?: string;
}

export interface FraudAlert {
  id: string;
  leadId: string;
  leadName: string;
  agentId: string;
  agentName: string;
  reason: 'DUPLICATE_PHONE' | 'DUPLICATE_EMAIL' | 'RE-REFERRAL';
  severity: 'MEDIUM' | 'HIGH';
  timestamp: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  language: string;
  category: string;
}

export interface SystemSettings {
  countries: string[];
  universities: { name: string; country: string }[];
  interestCategories: string[];
  consentText: string;
  privacyPolicy: string;
  pipelineStages: { id: string; label: string; color: string }[];
}
