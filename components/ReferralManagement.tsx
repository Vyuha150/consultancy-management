
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShieldAlert, 
  Search, 
  Plus, 
  MoreVertical, 
  ChevronRight, 
  Copy, 
  CheckCircle2, 
  AlertTriangle, 
  History,
  UserPlus,
  ArrowUpRight,
  Filter,
  Eye
} from 'lucide-react';
import { MOCK_AGENTS, MOCK_PAYOUTS, MOCK_FRAUD_ALERTS, MOCK_LEADS } from '../constants';
import { Agent, Payout, FraudAlert, LeadStage } from '../types';

const ReferralManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agents' | 'payouts' | 'fraud'>('dashboard');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAgents = useMemo(() => {
    return MOCK_AGENTS.filter(a => 
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.referralCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const stats = {
    totalReferrals: 1240,
    payoutPending: 5600,
    activeAgents: MOCK_AGENTS.filter(a => a.status === 'ACTIVE').length,
    fraudAlerts: MOCK_FRAUD_ALERTS.length
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Referral Network</h1>
          <p className="text-sm text-slate-500 font-medium">Manage agents, track commissions, and secure the referral pipeline.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
          {[
            { id: 'dashboard', label: 'Overview', icon: TrendingUp },
            { id: 'agents', label: 'Agents', icon: Users },
            { id: 'payouts', label: 'Payouts', icon: DollarSign },
            { id: 'fraud', label: 'Fraud Center', icon: ShieldAlert },
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
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Referrals</div>
               <div className="text-3xl font-black text-slate-900">{stats.totalReferrals}</div>
               <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                 <ArrowUpRight size={10} /> +8% vs LY
               </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payout Pending</div>
               <div className="text-3xl font-black text-slate-900">${stats.payoutPending}</div>
               <div className="mt-2 text-[10px] font-bold text-amber-600">3 agents awaiting payment</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Agents</div>
               <div className="text-3xl font-black text-slate-900">{stats.activeAgents}</div>
               <div className="mt-2 text-[10px] font-bold text-indigo-600">Across 12 cities</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fraud Alerts</div>
               <div className="text-3xl font-black text-rose-600">{stats.fraudAlerts}</div>
               <div className="mt-2 text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full w-fit">Requires Review</div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Agent Leaderboard</h3>
                  <button className="text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline">Full Ranking</button>
               </div>
               <div className="space-y-4">
                  {MOCK_AGENTS.sort((a,b) => b.totalEarned - a.totalEarned).map((agent, idx) => (
                    <div key={agent.id} className="p-4 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl flex items-center justify-between transition-all group cursor-pointer">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-slate-200 text-slate-600' : 'bg-orange-100 text-orange-600'}`}>
                             {idx + 1}
                          </div>
                          <div>
                             <div className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{agent.name}</div>
                             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Code: {agent.referralCode}</div>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="text-sm font-black text-slate-900">${agent.totalEarned}</div>
                          <div className="text-[9px] font-black text-slate-400 uppercase">EARNED</div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-slate-900 text-white rounded-[40px] p-8 space-y-8 shadow-2xl overflow-hidden relative group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
               <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-2 text-indigo-300 font-black text-[10px] uppercase tracking-widest">
                    <History size={14} className="fill-current" /> Recent Referrals
                  </div>
                  <div className="space-y-4">
                    {MOCK_LEADS.slice(0, 3).map(lead => (
                      <div key={lead.id} className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0 last:pb-0">
                         <div>
                            <div className="text-xs font-black text-white">{lead.name}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase">{lead.program}</div>
                         </div>
                         <div className="text-right">
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                               {lead.stage}
                            </span>
                         </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                    View All Pipeline
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'agents' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
           <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-[300px] relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search agents by name or referral code..." 
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm font-medium text-sm"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">
                <Plus size={16} /> Register New Agent
              </button>
           </div>

           <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Agent Profile</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Referral Code</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Commission Plan</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-5 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAgents.map(agent => (
                    <tr key={agent.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400">
                               {agent.name.charAt(0)}
                            </div>
                            <div>
                               <div className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{agent.name}</div>
                               <div className="text-[10px] text-slate-400 font-bold uppercase">{agent.email}</div>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                               {agent.referralCode}
                            </span>
                            <button 
                              onClick={() => copyToClipboard(agent.referralCode)}
                              className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors"
                            >
                               <Copy size={14} />
                            </button>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="text-xs font-black text-slate-900">
                            {agent.commissionModel === 'FIXED' ? `$${agent.commissionValue} per lead` : `${agent.commissionValue}% of Tuition`}
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="space-y-1">
                            <div className="text-xs font-black text-slate-900">${agent.totalEarned} earned</div>
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                               <div 
                                 className="h-full bg-emerald-500" 
                                 style={{ width: `${(agent.totalPaid/agent.totalEarned)*100}%` }}
                               />
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                         <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${agent.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            {agent.status}
                         </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <button className="p-2 text-slate-300 hover:text-slate-600">
                            <MoreVertical size={18} />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'payouts' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                 <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Payouts</div>
                    <div className="text-2xl font-black text-slate-900">$6,000</div>
                 </div>
                 <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                    <DollarSign size={24} />
                 </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                 <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Payout Cycle</div>
                    <div className="text-2xl font-black text-slate-900">22 May</div>
                 </div>
                 <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <TrendingUp size={24} />
                 </div>
              </div>
              <div className="lg:col-span-1">
                 <button className="w-full h-full py-6 bg-slate-900 text-white rounded-[32px] text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">
                    Process Batch Payout
                 </button>
              </div>
           </div>

           <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Payout Ledger</h3>
                 <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors border border-slate-100 rounded-xl">
                       <Filter size={16} />
                    </button>
                 </div>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Agent Name</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Requested</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_PAYOUTS.map(payout => (
                    <tr key={payout.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                         <div className="text-sm font-black text-slate-900">{payout.agentName}</div>
                      </td>
                      <td className="px-8 py-6 text-xs font-bold text-slate-500">
                         {new Date(payout.date).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6 text-sm font-black text-slate-900">
                         ${payout.amount}
                      </td>
                      <td className="px-8 py-6">
                         <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${payout.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {payout.status}
                         </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                         {payout.status === 'PENDING' && (
                           <button className="px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-700">
                              Approve
                           </button>
                         )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'fraud' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
           <div className="bg-rose-600 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
              <ShieldAlert className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10 max-w-2xl space-y-4">
                 <h2 className="text-3xl font-black">Security Analysis Active</h2>
                 <p className="text-rose-100 text-sm font-medium leading-relaxed">
                    AI-driven fraud detection is scanning the referral pipeline for duplicate phone numbers, email spoofing, and recurring referral patterns. 
                    <span className="block mt-2 font-black text-white">{stats.fraudAlerts} critical alerts require your intervention.</span>
                 </p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_FRAUD_ALERTS.map(alert => (
                <div key={alert.id} className="bg-white p-6 rounded-[32px] border-2 border-slate-100 hover:border-rose-200 transition-all space-y-4 shadow-sm relative group">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-xl ${alert.severity === 'HIGH' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                            <AlertTriangle size={24} />
                         </div>
                         <div>
                            <h4 className="text-sm font-black text-slate-900">{alert.reason.replace('_', ' ')}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(alert.timestamp).toLocaleString()}</p>
                         </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${alert.severity === 'HIGH' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'}`}>
                         {alert.severity}
                      </span>
                   </div>

                   <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                      <div>
                         <div className="text-[9px] font-black text-slate-400 uppercase">Referrer</div>
                         <div className="text-xs font-bold text-slate-900">{alert.agentName}</div>
                      </div>
                      <div className="text-right">
                         <div className="text-[9px] font-black text-slate-400 uppercase">Lead Name</div>
                         <div className="text-xs font-bold text-slate-900">{alert.leadName}</div>
                      </div>
                   </div>

                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-100 active:scale-95 transition-all">
                         Reject Claim
                      </button>
                      <button className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all">
                         Dismiss
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default ReferralManagement;
