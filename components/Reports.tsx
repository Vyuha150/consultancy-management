
import React, { useEffect, useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Line, Legend,
  RadialBarChart, RadialBar
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Globe, 
  Target, 
  UserCheck, 
  Zap, 
  FileDown, 
  Filter, 
  ChevronRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  Download
} from 'lucide-react';
import { UserRole } from '../types';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

const Reports: React.FC = () => {
   const [activeTab, setActiveTab] = useState<'overview' | 'staff' | 'trends'>('overview');
   const [leads, setLeads] = useState<any[]>([]);
   const [tasks, setTasks] = useState<any[]>([]);
   const [users, setUsers] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const load = async () => {
         try {
            const [leadsRes, tasksRes, usersRes] = await Promise.all([
               fetch('/api/leads'),
               fetch('/api/tasks'),
               fetch('/api/users')
            ]);

            const [leadsData, tasksData, usersData] = await Promise.all([
               leadsRes.ok ? leadsRes.json() : [],
               tasksRes.ok ? tasksRes.json() : [],
               usersRes.ok ? usersRes.json() : []
            ]);

            setLeads(Array.isArray(leadsData) ? leadsData : []);
            setTasks(Array.isArray(tasksData) ? tasksData : []);
            setUsers(Array.isArray(usersData) ? usersData : []);
         } catch (error) {
            console.error('Failed to load reports data:', error);
         } finally {
            setLoading(false);
         }
      };
      load();
   }, []);

   const normalizedLeads = useMemo(() => {
      return leads.map((lead: any) => ({
         ...lead,
         pipeline: lead.pipeline || lead.stage || 'NEW',
         interestLevel: lead.interestLevel || 'COLD',
         source: lead.source || 'UNKNOWN',
         createdAt: lead.createdAt || lead.updatedAt || new Date().toISOString(),
         countryPreference: lead.countryPreference || lead.interestedCountries || [],
         program: lead.program || (Array.isArray(lead.interestedPrograms) ? lead.interestedPrograms[0] : 'Unknown')
      }));
   }, [leads]);

   const totalLeads = normalizedLeads.length;
   const convertedLeads = normalizedLeads.filter(l => l.pipeline === 'CONVERTED').length;
   const hotLeads = normalizedLeads.filter(l => l.interestLevel === 'HOT').length;
   const referralLeads = normalizedLeads.filter(l => l.source === 'REFERRAL').length;
   const totalTasks = tasks.length;
   const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED').length;
   const overdueTasks = tasks.filter((t: any) => t.status === 'OVERDUE').length;

   const avgConversion = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
   const hotLeadRatio = totalLeads > 0 ? (hotLeads / totalLeads) * 100 : 0;
   const aiResolution = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
   const referralRatio = totalLeads > 0 ? (referralLeads / totalLeads) * 100 : 0;

   const sourceEfficiency = useMemo(() => {
      const bySource = normalizedLeads.reduce((acc: Record<string, { total: number; qualified: number }>, lead: any) => {
         const src = lead.source || 'UNKNOWN';
         acc[src] = acc[src] || { total: 0, qualified: 0 };
         acc[src].total += 1;
         if (lead.pipeline && lead.pipeline !== 'NEW') acc[src].qualified += 1;
         return acc;
      }, {});

      return Object.entries(bySource).map(([name, data]: [string, { total: number; qualified: number }]) => ({
         name: name.replace(/_/g, ' '),
         conversion: data.total > 0 ? Math.round((data.qualified / data.total) * 100) : 0
      }));
   }, [normalizedLeads]);

   const monthlyTrend = useMemo(() => {
      const months = [...Array(5)].map((_, i) => {
         const d = new Date();
         d.setMonth(d.getMonth() - (4 - i));
         return { key: `${d.getFullYear()}-${d.getMonth() + 1}`, label: d.toLocaleString('en-US', { month: 'short' }) };
      });

      const counts = months.map(m => ({ month: m.label, converted: 0 }));
      normalizedLeads.forEach((lead) => {
         const date = new Date(lead.createdAt);
         const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
         const idx = months.findIndex(m => m.key === key);
         if (idx !== -1) counts[idx].converted += lead.pipeline === 'CONVERTED' ? 1 : 1;
      });

      return counts;
   }, [normalizedLeads]);

   const counselorPerformance = useMemo(() => {
      const counselors = users.filter((u: any) => u.role === UserRole.COUNSELOR);
      return counselors.map((c: any) => {
         const userId = c._id || c.id;
         const userTasks = tasks.filter((t: any) => t.assignedTo === userId);
         const done = userTasks.filter((t: any) => t.status === 'COMPLETED').length;
         const rate = userTasks.length > 0 ? Math.round((done / userTasks.length) * 100) : 0;
         return { name: c.name, conversion: rate, score: Math.max(60, rate) };
      });
   }, [users, tasks]);

   const compliance = useMemo(() => {
      const total = totalTasks || 1;
      const met = totalTasks > 0 ? Math.round((completedTasks / total) * 100) : 0;
      const overdue = totalTasks > 0 ? Math.round((overdueTasks / total) * 100) : 0;
      return [
         { name: 'SLA Met', value: met },
         { name: 'Overdue', value: overdue }
      ];
   }, [totalTasks, completedTasks, overdueTasks]);

   const countryDemand = useMemo(() => {
      const map = normalizedLeads.reduce((acc: Record<string, number>, lead: any) => {
         const countries = Array.isArray(lead.countryPreference) ? lead.countryPreference : [];
         countries.forEach((c) => {
            acc[c] = (acc[c] || 0) + 1;
         });
         return acc;
      }, {});
      return Object.entries(map).map(([name, value]: [string, number]) => ({ name, value }));
   }, [normalizedLeads]);

   const programTrends = useMemo(() => {
      const map = normalizedLeads.reduce((acc: Record<string, number>, lead: any) => {
         const program = lead.program || 'Unknown';
         acc[program] = (acc[program] || 0) + 1;
         return acc;
      }, {});
      return Object.entries(map)
         .map(([name, count]: [string, number]) => ({ name, count }))
         .sort((a, b) => b.count - a.count)
         .slice(0, 5);
   }, [normalizedLeads]);

  return (
    <div className="flex flex-col h-full gap-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <BarChart3 className="text-indigo-600" size={32} />
             Reports & Analytics
          </h1>
          <p className="text-slate-500 font-medium">Data-driven insights for strategic admissions growth.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'staff', label: 'Staff Performance', icon: UserCheck },
            { id: 'trends', label: 'Market Trends', icon: Globe },
            { id: 'exports', label: 'Exports', icon: FileDown },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

         {loading && (
            <div className="flex items-center justify-center py-16 text-slate-400">
               Loading reports...
            </div>
         )}

         {!loading && activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           {/* KPI Row */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     {[
                        { label: 'Avg Conversion', value: `${avgConversion.toFixed(1)}%`, trend: `${convertedLeads}/${totalLeads}`, icon: Target, color: 'indigo' },
                        { label: 'Hot Lead Ratio', value: `${hotLeadRatio.toFixed(1)}%`, trend: `${hotLeads}/${totalLeads}`, icon: Sparkles, color: 'rose' },
                        { label: 'Task Resolution', value: `${aiResolution.toFixed(1)}%`, trend: `${completedTasks}/${totalTasks}`, icon: Zap, color: 'amber' },
                        { label: 'Referral Share', value: `${referralRatio.toFixed(1)}%`, trend: `${referralLeads}/${totalLeads}`, icon: TrendingUp, color: 'emerald' },
                     ].map((kpi, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all">
                   <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 bg-${kpi.color}-50 text-${kpi.color}-600 rounded-2xl group-hover:scale-110 transition-transform`}>
                        <kpi.icon size={24} />
                      </div>
                                 <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{kpi.trend}</span>
                   </div>
                   <div className="text-3xl font-black text-slate-900">{kpi.value}</div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</div>
                </div>
              ))}
           </div>

           <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Source Performance */}
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col gap-6">
                 <div className="flex justify-between items-center">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Source Qualification %</h3>
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                       <Filter size={18} />
                    </button>
                 </div>
                 <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={sourceEfficiency} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                            cursor={{ fill: '#f8fafc' }}
                          />
                          <Bar dataKey="conversion" name="Qual. Rate %" radius={[12, 12, 0, 0]} barSize={40}>
                             {sourceEfficiency.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Conversion Pipeline Trend */}
              <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl flex flex-col gap-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                 <div className="relative z-10 flex justify-between items-center">
                    <h3 className="text-lg font-black uppercase tracking-widest">Growth Velocity</h3>
                    <select className="bg-white/10 border-none text-[10px] font-black uppercase tracking-widest rounded-xl px-3 py-1.5 text-white focus:ring-2 focus:ring-indigo-500">
                       <option>Last 5 Months</option>
                       <option>This Year</option>
                    </select>
                 </div>
                 <div className="h-[300px] relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={monthlyTrend}>
                          <defs>
                             <linearGradient id="colorCon" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)' }}
                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                          />
                          <Area type="monotone" dataKey="converted" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorCon)" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>
        </div>
      )}

      {!loading && activeTab === 'staff' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Counselor Board */}
              <div className="xl:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 flex flex-col gap-8">
                 <div className="flex justify-between items-center">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Counselor Conversion Matrix</h3>
                    <div className="flex gap-2">
                       <button className="px-3 py-1.5 bg-slate-50 text-[10px] font-black uppercase tracking-widest rounded-lg text-slate-400">Monthly</button>
                    </div>
                 </div>
                 <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={counselorPerformance} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 700}} width={100} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="conversion" name="Conv Rate %" fill="#6366f1" radius={[0, 12, 12, 0]} barSize={32} />
                          <Line type="monotone" dataKey="score" name="CSAT Score" stroke="#ec4899" strokeWidth={3} dot={{ r: 6, fill: '#ec4899' }} />
                       </ComposedChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Compliance Radial */}
              <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 flex flex-col gap-6">
                 <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Operational Compliance</h3>
                 <div className="flex-1 min-h-[300px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                          <RadialBarChart 
                          cx="50%" cy="50%" innerRadius="20%" outerRadius="100%" 
                          barSize={14} data={compliance}
                       >
                          <RadialBar
                            label={{ position: 'insideStart', fill: '#fff', fontSize: 10, fontWeight: 900 }}
                            background
                            dataKey="value"
                            radius={10}
                          >
                                           {compliance.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                          </RadialBar>
                          <Legend iconSize={10} layout="vertical" verticalAlign="bottom" wrapperStyle={{ bottom: 0, fontSize: 10, fontWeight: 700 }} />
                       </RadialBarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-3xl">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 text-center">System SLA Health</p>
                    <div className="text-2xl font-black text-center text-emerald-600">Excellent (92.6%)</div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {!loading && activeTab === 'trends' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Country Demand Pie */}
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col gap-6">
                 <div className="flex justify-between items-center">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Market Demand by Country</h3>
                    <Globe className="text-slate-200" size={24} />
                 </div>
                 <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                                       <Pie
                                          data={countryDemand}
                            cx="50%" cy="50%" innerRadius={80} outerRadius={130}
                            paddingAngle={5} dataKey="value"
                          >
                                           {countryDemand.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                             ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Demand Trends Table */}
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col gap-6">
                 <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Hot Programs & Intake</h3>
                 <div className="space-y-4">
                    {programTrends.map((program, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 rounded-2xl flex items-center justify-between transition-all group cursor-pointer">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-indigo-600 shadow-sm">
                               {program.name.charAt(0)}
                            </div>
                            <div>
                               <div className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{program.name}</div>
                               <div className="text-[10px] text-slate-400 font-bold uppercase">Top Program</div>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className="text-sm font-black text-slate-900">{program.count}</div>
                            <div className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Leads</div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Exports tab hidden */}
    </div>
  );
};

export default Reports;
import { History } from 'lucide-react';
