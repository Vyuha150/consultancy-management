
import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  MessageSquare, 
  Flag, 
  Send, 
  History, 
  UserPlus, 
  ChevronRight, 
  Zap,
  LayoutGrid,
  Search,
  CheckCircle2,
  Clock,
  MoreVertical,
  ArrowUpRight,
  Loader,
  Phone,
  Mail,
  Copy,
  Eye,
  Edit2,
  FileText,
  AlertCircle,
  Play,
  Square,
  Settings
} from 'lucide-react';

const API_BASE_URL = 'http://62.72.13.40:3000';

interface Lead {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  pipeline: string;
  score?: number;
  interestedCountries?: string[];
  interestedPrograms?: string[];
  notes?: string;
  createdAt?: string;
}

interface BotStatus {
  running: boolean;
  type?: string;
  startedAt?: string;
  status?: string;
}

const AIAgentConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'logs' | 'controls'>('dashboard');
  const [sessionId, setSessionId] = useState('');
  const [sessionIdInput, setSessionIdInput] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [whatsappLogs, setWhatsappLogs] = useState<any[]>([]);
  const [linkedinLogs, setLinkedinLogs] = useState<any[]>([]);
  const [leadsLogs, setLeadsLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [botStatuses, setBotStatuses] = useState<Record<string, BotStatus>>({});
  const [controlLoading, setControlLoading] = useState<Record<string, boolean>>({});
  const [botConfig, setBotConfig] = useState({
    whatsappPersonality: 'Friendly sales assistant',
    linkedinPersonality: 'Professional assistant',
    linkedinPortfolio: 'https://portfolio.com',
    leadsKeywords: 'software development',
    leadsLocation: 'San Francisco',
    leadsMaxLeads: '50'
  });

  // Fetch data whenever session ID changes
  useEffect(() => {
    if (sessionId) {
      // Initial fetch
      fetchAllData();
      fetchBotStatuses();
      
      // Set up polling intervals
      const leadsInterval = setInterval(() => {
        fetchAllData();
      }, 10000); // Refresh leads every 10 seconds
      
      const statusInterval = setInterval(() => {
        fetchBotStatuses();
      }, 5000); // Poll bot status every 5 seconds
      
      return () => {
        clearInterval(leadsInterval);
        clearInterval(statusInterval);
      };
    }
  }, [sessionId]);

  const setSession = () => {
    if (sessionIdInput.trim()) {
      setSessionId(sessionIdInput);
    }
  };

  const fetchAllData = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      // Fetch leads
      const leadsRes = await fetch(`${API_BASE_URL}/api/${sessionId}/leads/latest`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        if (leadsData.data?.leads) {
          setLeads(leadsData.data.leads);
        } else if (Array.isArray(leadsData.data)) {
          setLeads(leadsData.data);
        }
      } else {
        console.warn(`Leads fetch returned status ${leadsRes.status}`);
      }

      // Fetch WhatsApp logs
      const whatsappRes = await fetch(`${API_BASE_URL}/api/${sessionId}/whatsapp/logs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (whatsappRes.ok) {
        const whatsappData = await whatsappRes.json();
        if (whatsappData.data?.logs) {
          setWhatsappLogs(whatsappData.data.logs);
        }
      } else {
        console.warn(`WhatsApp logs fetch returned status ${whatsappRes.status}`);
      }

      // Fetch LinkedIn logs
      const linkedinRes = await fetch(`${API_BASE_URL}/api/${sessionId}/linkedin/logs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (linkedinRes.ok) {
        const linkedinData = await linkedinRes.json();
        if (linkedinData.data?.logs) {
          setLinkedinLogs(linkedinData.data.logs);
        }
      } else {
        console.warn(`LinkedIn logs fetch returned status ${linkedinRes.status}`);
      }

      // Fetch Leads generation logs
      const leadsGenRes = await fetch(`${API_BASE_URL}/api/${sessionId}/leads/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (leadsGenRes.ok) {
        const leadsGenData = await leadsGenRes.json();
        if (leadsGenData.data) {
          setLeadsLogs([{ message: JSON.stringify(leadsGenData.data) }]);
        }
      } else {
        console.warn(`Leads status fetch returned status ${leadsGenRes.status}`);
      }
    } catch (error) {
      console.error('Failed to fetch AI Agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBotStatuses = async () => {
    if (!sessionId) return;
    try {
      const statuses: Record<string, BotStatus> = {};

      // Get WhatsApp status
      try {
        const whatsappRes = await fetch(`${API_BASE_URL}/api/${sessionId}/whatsapp/status`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (whatsappRes.ok) {
          const data = await whatsappRes.json();
          statuses['whatsapp'] = data.data || { running: false };
        }
      } catch (e) {
        console.warn('WhatsApp status fetch failed', e);
        statuses['whatsapp'] = { running: false };
      }

      // Get LinkedIn status
      try {
        const linkedinRes = await fetch(`${API_BASE_URL}/api/${sessionId}/linkedin/status`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (linkedinRes.ok) {
          const data = await linkedinRes.json();
          statuses['linkedin'] = data.data || { running: false };
        }
      } catch (e) {
        console.warn('LinkedIn status fetch failed', e);
        statuses['linkedin'] = { running: false };
      }

      // Get Leads status
      try {
        const leadsRes = await fetch(`${API_BASE_URL}/api/${sessionId}/leads/status`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (leadsRes.ok) {
          const data = await leadsRes.json();
          statuses['leads'] = { running: data.data?.running || false };
        }
      } catch (e) {
        console.warn('Leads status fetch failed', e);
        statuses['leads'] = { running: false };
      }

      setBotStatuses(statuses);
    } catch (error) {
      console.error('Failed to fetch bot statuses:', error);
    }
  };

  const startBot = async (botType: string) => {
    if (!sessionId) return;
    setControlLoading(prev => ({ ...prev, [`start-${botType}`]: true }));
    try {
      let endpoint = '';
      let body = new URLSearchParams();
      body.append('uniqueId', sessionId);

      if (botType === 'whatsapp') {
        endpoint = '/start-whatsapp';
        body.append('personality', botConfig.whatsappPersonality);
        body.append('contacts', 'ALL');
      } else if (botType === 'linkedin') {
        endpoint = '/start-linkedin';
        body.append('personality', botConfig.linkedinPersonality);
        body.append('portfolioLink', botConfig.linkedinPortfolio);
        body.append('testMode', 'false');
      } else if (botType === 'leads') {
        endpoint = '/start-leads';
        body.append('keywords', botConfig.leadsKeywords);
        body.append('location', botConfig.leadsLocation);
        body.append('maxLeads', botConfig.leadsMaxLeads);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
      });

      if (response.ok) {
        await fetchBotStatuses();
      }
    } catch (error) {
      console.error(`Failed to start ${botType} bot:`, error);
    } finally {
      setControlLoading(prev => ({ ...prev, [`start-${botType}`]: false }));
    }
  };

  const stopBot = async (botType: string) => {
    if (!sessionId) return;
    setControlLoading(prev => ({ ...prev, [`stop-${botType}`]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/stop-bot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uniqueId: sessionId,
          botType: botType
        })
      });

      if (response.ok) {
        await fetchBotStatuses();
      }
    } catch (error) {
      console.error(`Failed to stop ${botType} bot:`, error);
    } finally {
      setControlLoading(prev => ({ ...prev, [`stop-${botType}`]: false }));
    }
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
  };

  const handleCallLead = (phone: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleEmailLead = (email: string) => {
    if (email) {
      window.location.href = `mailto:${email}`;
    }
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.phone.includes(searchQuery)
  );

  const getPipelineColor = (pipeline: string) => {
    const colors: Record<string, string> = {
      'NEW': 'bg-slate-50 text-slate-700',
      'CONTACTED': 'bg-blue-50 text-blue-700',
      'QUALIFIED': 'bg-indigo-50 text-indigo-700',
      'COUNSELING': 'bg-amber-50 text-amber-700',
      'APPLIED': 'bg-purple-50 text-purple-700',
      'OFFER': 'bg-emerald-50 text-emerald-700',
      'CONVERTED': 'bg-green-50 text-green-700'
    };
    return colors[pipeline] || 'bg-slate-50 text-slate-700';
  };

  const getBotStatusColor = (running: boolean) => {
    return running ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200';
  };

  const getBotStatusTextColor = (running: boolean) => {
    return running ? 'text-emerald-700' : 'text-slate-700';
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Session Selection */}
      {!sessionId ? (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex flex-col items-center justify-center min-h-96">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
            <Bot className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Connect AI Agent Session</h2>
          <p className="text-slate-600 text-center mb-8 max-w-md">Enter your session ID to access the AI Agent dashboard, control bots, and view real-time logs and leads data.</p>
          <div className="flex gap-2 w-full max-w-sm">
            <input
              type="text"
              placeholder="Enter session ID (e.g., n, a, etc.)"
              value={sessionIdInput}
              onChange={(e) => setSessionIdInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && setSession()}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
            <button
              onClick={setSession}
              className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
            >
              Connect
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Header with Session Info */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900">AI Agent Control Panel</h1>
              <p className="text-sm text-slate-500 font-medium">Session: <span className="text-indigo-600 font-bold">{sessionId}</span> • Manage bots, view leads & logs</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSessionId('')}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
              >
                Change Session
              </button>
              <button
                onClick={fetchAllData}
                disabled={loading}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {loading ? <Loader size={16} className="animate-spin" /> : 'Refresh Data'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Settings },
              { id: 'leads', label: 'Leads', icon: MessageSquare },
              { id: 'logs', label: 'Logs', icon: History },
              { id: 'controls', label: 'Bot Controls', icon: Zap },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-0">
            {/* Main Content */}
            <div className="xl:col-span-2 flex flex-col gap-4 overflow-hidden">
              {/* Dashboard Tab - Bot Status */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { bot: 'whatsapp', label: 'WhatsApp Bot', icon: MessageSquare },
                      { bot: 'linkedin', label: 'LinkedIn Bot', icon: UserPlus },
                      { bot: 'leads', label: 'Leads Generation', icon: Flag }
                    ].map(({ bot, label, icon: Icon }) => {
                      const status = botStatuses[bot];
                      const isRunning = status?.running || false;
                      return (
                        <div key={bot} className={`bg-white rounded-2xl border-2 p-6 transition-all ${getBotStatusColor(isRunning)}`}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isRunning ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                                <Icon size={24} className={getBotStatusTextColor(isRunning)} />
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-900">{label}</h3>
                                <p className={`text-xs font-black uppercase ${getBotStatusTextColor(isRunning)}`}>
                                  {isRunning ? '🟢 Running' : '⚫ Stopped'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startBot(bot)}
                              disabled={isRunning || controlLoading[`start-${bot}`]}
                              className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {controlLoading[`start-${bot}`] ? <Loader size={12} className="animate-spin" /> : <Play size={12} />}
                              Start
                            </button>
                            <button
                              onClick={() => stopBot(bot)}
                              disabled={!isRunning || controlLoading[`stop-${bot}`]}
                              className="flex-1 py-2 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {controlLoading[`stop-${bot}`] ? <Loader size={12} className="animate-spin" /> : <Square size={12} />}
                              Stop
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6">
                    <h3 className="font-bold text-slate-900 mb-4">Quick Stats</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-slate-50 rounded-xl">
                        <div className="text-3xl font-black text-indigo-600">{leads.length}</div>
                        <div className="text-xs font-bold text-slate-600 uppercase mt-1">Total Leads</div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-xl">
                        <div className="text-3xl font-black text-emerald-600">{Object.values(botStatuses).filter(s => s?.running).length}</div>
                        <div className="text-xs font-bold text-slate-600 uppercase mt-1">Bots Running</div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-xl">
                        <div className="text-3xl font-black text-amber-600">{whatsappLogs.length}</div>
                        <div className="text-xs font-bold text-slate-600 uppercase mt-1">Log Entries</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Leads Tab */}
              {activeTab === 'leads' && (
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                  <div className="p-6 border-b border-slate-50 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search by name, email, or phone..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-600 bg-indigo-50 px-3 py-1.5 rounded-lg">Agent</span>
                  </div>

                  {loading && (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader size={40} className="text-indigo-600 animate-spin" />
                        <p className="text-sm text-slate-500 font-semibold">Loading leads data...</p>
                      </div>
                    </div>
                  )}

                  {!loading && filteredLeads.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <AlertCircle size={40} className="text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-semibold">No leads found from agent</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="text-left p-4 font-black text-slate-600 uppercase tracking-wider">Name</th>
                            <th className="text-left p-4 font-black text-slate-600 uppercase tracking-wider">Email</th>
                            <th className="text-left p-4 font-black text-slate-600 uppercase tracking-wider">Phone</th>
                            <th className="text-left p-4 font-black text-slate-600 uppercase tracking-wider">Source</th>
                            <th className="text-left p-4 font-black text-slate-600 uppercase tracking-wider">Pipeline</th>
                            <th className="text-center p-4 font-black text-slate-600 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredLeads.map(lead => (
                            <tr key={lead._id || lead.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-4 font-bold text-slate-900">{lead.name}</td>
                              <td className="p-4 text-slate-600 truncate">{lead.email}</td>
                              <td className="p-4 text-slate-600">{lead.phone}</td>
                              <td className="p-4">
                                <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-[9px]">
                                  Agent
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={`inline-block px-2.5 py-1 font-bold rounded-lg text-[9px] ${getPipelineColor(lead.pipeline)}`}>
                                  {lead.pipeline}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-center gap-1">
                                  <button 
                                    onClick={() => handleCallLead(lead.phone)}
                                    title="Call"
                                    className="p-2 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-600 transition-colors"
                                  >
                                    <Phone size={14} />
                                  </button>
                                  <button 
                                    onClick={() => handleEmailLead(lead.email)}
                                    title="Email"
                                    className="p-2 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 transition-colors"
                                  >
                                    <Mail size={14} />
                                  </button>
                                  <button 
                                    onClick={() => setSelectedLead(lead)}
                                    title="View"
                                    className="p-2 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-600 transition-colors"
                                  >
                                    <Eye size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Logs Tab */}
              {activeTab === 'logs' && (
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                  <div className="p-6 border-b border-slate-50">
                    <h3 className="font-bold text-slate-900">Real-time Bot Logs</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 p-6">
                    {whatsappLogs.length === 0 && linkedinLogs.length === 0 && leadsLogs.length === 0 ? (
                      <div className="text-center py-12">
                        <AlertCircle size={40} className="text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-semibold">No logs available yet</p>
                      </div>
                    ) : (
                      <>
                        {whatsappLogs.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-black text-slate-400 uppercase mb-2">WhatsApp Logs</h4>
                            {whatsappLogs.slice(0, 5).map((log, idx) => (
                              <div key={idx} className="p-2 bg-blue-50 rounded-lg text-xs text-slate-700 border border-blue-100">
                                {typeof log === 'string' ? log : log.message}
                              </div>
                            ))}
                          </div>
                        )}
                        {linkedinLogs.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-black text-slate-400 uppercase mb-2 mt-4">LinkedIn Logs</h4>
                            {linkedinLogs.slice(0, 5).map((log, idx) => (
                              <div key={idx} className="p-2 bg-purple-50 rounded-lg text-xs text-slate-700 border border-purple-100">
                                {typeof log === 'string' ? log : log.message}
                              </div>
                            ))}
                          </div>
                        )}
                        {leadsLogs.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-black text-slate-400 uppercase mb-2 mt-4">Leads Generation</h4>
                            {leadsLogs.map((log, idx) => (
                              <div key={idx} className="p-2 bg-emerald-50 rounded-lg text-xs text-slate-700 border border-emerald-100 font-mono overflow-auto">
                                {typeof log === 'string' ? log : log.message}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Controls Tab */}
              {activeTab === 'controls' && (
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-y-auto p-6 space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-4">WhatsApp Bot Configuration</h3>
                    <input
                      type="text"
                      placeholder="Personality (e.g., Friendly sales assistant)"
                      value={botConfig.whatsappPersonality}
                      onChange={(e) => setBotConfig(prev => ({ ...prev, whatsappPersonality: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm mb-3 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 mb-4">LinkedIn Bot Configuration</h3>
                    <input
                      type="text"
                      placeholder="Personality"
                      value={botConfig.linkedinPersonality}
                      onChange={(e) => setBotConfig(prev => ({ ...prev, linkedinPersonality: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm mb-3 focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <input
                      type="text"
                      placeholder="Portfolio Link"
                      value={botConfig.linkedinPortfolio}
                      onChange={(e) => setBotConfig(prev => ({ ...prev, linkedinPortfolio: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 mb-4">Leads Generation Configuration</h3>
                    <input
                      type="text"
                      placeholder="Keywords"
                      value={botConfig.leadsKeywords}
                      onChange={(e) => setBotConfig(prev => ({ ...prev, leadsKeywords: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm mb-3 focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={botConfig.leadsLocation}
                      onChange={(e) => setBotConfig(prev => ({ ...prev, leadsLocation: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm mb-3 focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <input
                      type="number"
                      placeholder="Max Leads"
                      value={botConfig.leadsMaxLeads}
                      onChange={(e) => setBotConfig(prev => ({ ...prev, leadsMaxLeads: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Intelligence Sidepanel */}
            <div className="flex flex-col gap-6 min-h-0">
              <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl space-y-6 relative overflow-hidden group">
                <Bot className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10">
                   <div className="flex items-center gap-2 text-indigo-300 font-black text-[10px] uppercase tracking-widest mb-4">
                     <Zap size={14} className="fill-current" />
                     AI Agent Status
                   </div>
                   <h3 className="text-2xl font-black mb-2">{selectedLead ? selectedLead.name : 'Session ' + sessionId}</h3>
                   <p className="text-indigo-100/60 text-xs font-medium leading-relaxed">
                     {selectedLead ? `Lead from AI Agent • Source: Agent` : 'Multi-bot intelligence platform managing leads, WhatsApp, and LinkedIn outreach.'}
                   </p>
                </div>
                
                {selectedLead && (
                  <div className="relative z-10 grid grid-cols-2 gap-3 pt-6">
                    <div className="bg-white/10 p-3 rounded-2xl border border-white/5">
                       <div className="text-[9px] font-black text-indigo-300 uppercase">Phone</div>
                       <div className="text-sm font-black truncate">{selectedLead.phone}</div>
                    </div>
                    <div className="bg-white/10 p-3 rounded-2xl border border-white/5">
                       <div className="text-[9px] font-black text-indigo-300 uppercase">Pipeline</div>
                       <div className="text-sm font-black">{selectedLead.pipeline}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-8 overflow-y-auto scrollbar-hide">
                {selectedLead ? (
                  <>
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                         Lead Information
                         <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                       </h4>
                       <div className="space-y-3 text-xs">
                         <div>
                           <div className="text-slate-400 font-bold uppercase text-[9px]">Email</div>
                           <div className="text-slate-900 font-bold break-all">{selectedLead.email}</div>
                         </div>
                         <div>
                           <div className="text-slate-400 font-bold uppercase text-[9px]">Source</div>
                           <div className="text-slate-900 font-bold">Agent</div>
                         </div>
                         <div>
                           <div className="text-slate-400 font-bold uppercase text-[9px]">Interested Countries</div>
                           <div className="text-slate-900 font-bold">{selectedLead.interestedCountries?.join(', ') || 'N/A'}</div>
                         </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Actions</h4>
                       <div className="space-y-2">
                         <button 
                           onClick={() => handleCallLead(selectedLead.phone)}
                           className="w-full p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-colors"
                         >
                           <Phone size={14} /> Call Lead
                         </button>
                         <button 
                           onClick={() => handleEmailLead(selectedLead.email)}
                           className="w-full p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-colors"
                         >
                           <Mail size={14} /> Send Email
                         </button>
                       </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                       System Status
                       <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                     </h4>
                     <div className="space-y-3">
                       <div className="flex items-start gap-3">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <CheckCircle2 size={16} />
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase">Connected To</div>
                            <div className="text-sm font-bold text-slate-900">62.72.13.40:3000</div>
                          </div>
                       </div>
                       <div className="flex items-start gap-3">
                          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Flag size={16} />
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase">Leads Loaded</div>
                            <div className="text-sm font-bold text-slate-900">{leads.length} from Agent</div>
                          </div>
                       </div>
                       <div className="flex items-start gap-3">
                          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <Zap size={16} />
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase">Active Bots</div>
                            <div className="text-sm font-bold text-slate-900">{Object.values(botStatuses).filter(s => s?.running).length} running</div>
                          </div>
                       </div>
                     </div>
                  </div>
                )}

                <button onClick={() => setSelectedLead(null)} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIAgentConsole;
