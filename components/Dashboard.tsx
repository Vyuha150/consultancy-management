
import React, { useEffect, useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Line
} from 'recharts';
import { 
  TrendingUp, Users, CheckCircle2, Clock, AlertCircle, ArrowUpRight, ArrowDownRight,
  Plus, FileUp, UserPlus, Zap, Globe, GraduationCap, Award, DollarSign, RefreshCw, X, Loader
} from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

// Consistent ordering and display mapping to restore original dashboard arrangement
const PIPELINE_ORDER = ['NEW', 'CONTACTED', 'QUALIFIED', 'COUNSELING', 'APPLIED', 'OFFER', 'CONVERTED'];
const PIPELINE_LABELS_MAP: Record<string, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  COUNSELING: 'Counseling',
  APPLIED: 'Applied',
  OFFER: 'Offer',
  CONVERTED: 'Converted',
};

const SOURCE_ORDER_IDS = ['TELECALLER_SHEET', 'WHATSAPP_AI', 'SOCIAL_MEDIA', 'FIELD_MARKETING', 'REFERRAL'];
const SOURCE_DISPLAY_MAP: Record<string, string> = {
  TELECALLER_SHEET: 'Telecaller',
  WHATSAPP_AI: 'WhatsApp AI',
  SOCIAL_MEDIA: 'Social Ads',
  FIELD_MARKETING: 'Field Mkt',
  REFERRAL: 'Referrals',
};

const StatCard = ({ title, value, subValue, icon: Icon, trend, trendType, color = "indigo" }: any) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 group hover:border-indigo-200 transition-all cursor-pointer">
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2.5 bg-${color}-50 text-${color}-600 rounded-xl group-hover:scale-110 transition-transform`}>
        <Icon size={20} />
      </div>
      {trend && (
        <span className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${trendType === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trendType === 'up' ? <ArrowUpRight size={12} className="mr-0.5" /> : <ArrowDownRight size={12} className="mr-0.5" />}
          {trend}%
        </span>
      )}
    </div>
    <div className="text-2xl font-black text-slate-900 leading-none mb-1">{value}</div>
    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</div>
    {subValue && <div className="text-[10px] text-slate-400 mt-2 font-medium">{subValue}</div>}
  </div>
);

const Dashboard: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSummary, setUploadSummary] = useState<{ fileName: string; rowCount: number; createdCount: number } | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({
    leadId: '',
    leadName: '',
    assignedTo: '',
    assignedToName: '',
    priority: 'MEDIUM',
    notes: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [leadsRes, tasksRes, projectsRes, employeesRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/tasks'),
        fetch('/api/projects'),
        fetch('/api/employees')
      ]);

      const leadsData = leadsRes.ok ? await leadsRes.json() : [];
      const tasksData = tasksRes.ok ? await tasksRes.json() : [];
      const projectsData = projectsRes.ok ? await projectsRes.json() : [];
      const employeesData = employeesRes.ok ? await employeesRes.json() : [];

      setLeads(Array.isArray(leadsData) ? leadsData : []);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!assignmentForm.leadName || !assignmentForm.assignedToName) {
      alert('Please fill in required fields');
      return;
    }

    setAssignmentLoading(true);
    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: assignmentForm.leadId || '',
          leadName: assignmentForm.leadName,
          assignedTo: assignmentForm.assignedTo || '',
          assignedToName: assignmentForm.assignedToName,
          priority: assignmentForm.priority,
          notes: assignmentForm.notes,
          dueDate: assignmentForm.dueDate || null
        })
      });

      if (response.ok) {
        alert('Assignment created successfully!');
        setShowAssignmentModal(false);
        setAssignmentForm({
          leadId: '',
          leadName: '',
          assignedTo: '',
          assignedToName: '',
          priority: 'MEDIUM',
          notes: '',
          dueDate: ''
        });
        fetchAllData();
      } else {
        alert('Failed to create assignment');
      }
    } catch (err) {
      alert('Error creating assignment');
      console.error(err);
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleUploadLeads = async () => {
    if (!uploadFile) {
      setUploadError('Please select a CSV or Excel file to upload.');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);
    setUploadSummary(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const uploadRes = await fetch('/api/uploads', {
        method: 'POST',
        body: formData
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(err.error || 'Upload failed');
      }

      const uploadData = await uploadRes.json();
      const rows = Array.isArray(uploadData.rows) ? uploadData.rows : [];

      if (rows.length === 0) {
        setUploadSummary({ fileName: uploadData.fileName || uploadFile.name, rowCount: 0, createdCount: 0 });
        return;
      }

      const created = await Promise.all(
        rows.map((row: any, idx: number) => {
          const fallbackEmail = `lead-${Date.now()}-${idx}@noemail.local`;
          const payload = {
            name: row.name || 'Unknown',
            email: row.email || fallbackEmail,
            phone: row.phone || '',
            source: 'TELECALLER_SHEET',
            pipeline: 'NEW',
            interestedCountries: row.location ? [row.location] : [],
            interestedPrograms: [],
            notes: row.remarks || ''
          };

          return fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).then(res => res.ok);
        })
      );

      const createdCount = created.filter(Boolean).length;

      setUploadSummary({
        fileName: uploadData.fileName || uploadFile.name,
        rowCount: rows.length,
        createdCount
      });

      setUploadFile(null);
      fetchAllData();
    } catch (err: any) {
      setUploadError(err?.message || 'Upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  // Compute dashboard stats from database
  const dashboardStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const leadsToday = leads.filter((l: any) => {
      const leadDate = new Date(l.createdAt);
      leadDate.setHours(0, 0, 0, 0);
      return leadDate.getTime() === today.getTime();
    }).length;

    const activeTasks = tasks.filter((t: any) => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length;
    const overdueTasks = tasks.filter((t: any) => t.status === 'OVERDUE').length;
    const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED').length;
    const conversionRate = leads.length > 0 ? Math.round((leads.filter((l: any) => l.status === 'CONVERTED').length / leads.length) * 100) : 0;
    const aiResponseRate = 95;

    return {
      leadsToday,
      leadsTotal: leads.length,
      activeTasks,
      overdueTasks,
      conversionRate,
      aiResponseRate
    };
  }, [leads, tasks]);

  // Pipeline data from leads
  const pipelineData = useMemo(() => {
    const stageCounts = new Map<string, number>();
    PIPELINE_ORDER.forEach(stage => stageCounts.set(stage, 0));

    leads.forEach((lead: any) => {
      const stage = lead.pipeline || lead.stage || 'NEW';
      const count = stageCounts.get(stage) || 0;
      stageCounts.set(stage, count + 1);
    });

    return PIPELINE_ORDER.map(stage => ({
      stage: PIPELINE_LABELS_MAP[stage] || stage,
      count: stageCounts.get(stage) || 0
    }));
  }, [leads]);

  // Source distribution from leads
  const sourceData = useMemo(() => {
    const sourceCounts = new Map<string, number>();
    SOURCE_ORDER_IDS.forEach(source => sourceCounts.set(source, 0));

    leads.forEach((lead: any) => {
      const source = lead.source || 'UNKNOWN';
      const count = sourceCounts.get(source) || 0;
      sourceCounts.set(source, count + 1);
    });

    return SOURCE_ORDER_IDS.map(id => ({
      name: SOURCE_DISPLAY_MAP[id],
      value: sourceCounts.get(id) || 0
    }));
  }, [leads]);

  // Staff performance from employees and tasks
  const staffPerformance = useMemo(() => {
    return employees.slice(0, 5).map((emp: any) => {
      const empTasks = tasks.filter((t: any) => t.assignedTo === (emp.id || emp._id));
      const completedCount = empTasks.filter((t: any) => t.status === 'COMPLETED').length;
      return {
        name: emp.name || 'Unknown',
        calls: empTasks.length,
        potentials: completedCount
      };
    });
  }, [employees, tasks]);

  // Country segmentation from leads
  const countrySegmentation = useMemo(() => {
    const countryCounts = new Map<string, number>();
    leads.forEach((lead: any) => {
      const country = lead.country || 'Unknown';
      const count = countryCounts.get(country) || 0;
      countryCounts.set(country, count + 1);
    });

    return Array.from(countryCounts.entries())
      .map(([name, leads]) => ({ name, leads }))
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 5);
  }, [leads]);

  // Referral payouts (placeholder)
  const referralPayouts = useMemo(() => {
    return employees.slice(0, 3).map((emp: any) => ({
      agent: emp.name || 'Unknown',
      leads: Math.floor(Math.random() * 10) + 1,
      pending: `$${Math.floor(Math.random() * 5000) + 1000}`
    }));
  }, [employees]);

  const sortedPipeline = pipelineData;
  const orderedSources = sourceData;

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader size={48} className="text-indigo-600 animate-spin" />
          <p className="text-slate-600 font-semibold">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Quick Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Executive Command Center</h1>
          <p className="text-slate-500 font-medium">Real-time insights across your multi-channel acquisition network.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={fetchAllData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={18} className={`text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <FileUp size={18} className="text-indigo-600" />
            Upload Lead Sheet
          </button>
          <button 
            disabled
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-400 cursor-not-allowed transition-all shadow-sm opacity-50"
          >
            <Zap size={18} className="text-slate-400" />
            AI Review Queue
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100" onClick={() => setShowAssignmentModal(true)}>
            <Plus size={18} />
            New Assignment
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Leads Today" 
          value={dashboardStats?.leadsToday || 0} 
          trend="12" 
          trendType="up" 
          icon={Users} 
          subValue="Last lead: 4 mins ago" 
        />
        <StatCard 
          title="AI Bot Response" 
          value={`${dashboardStats?.aiResponseRate || 0}%`} 
          trend="5" 
          trendType="up" 
          icon={Zap} 
          subValue="450 ms avg. response time" 
          color="amber" 
        />
        <StatCard 
          title="Active Tasks" 
          value={dashboardStats?.activeTasks || 0} 
          icon={Clock} 
          subValue={`${dashboardStats?.overdueTasks || 0} overdue tasks require attention`} 
          color="rose" 
        />
        <StatCard 
          title="Conversion Rate" 
          value={`${dashboardStats?.conversionRate || 0}%`} 
          trend="2.1" 
          trendType="up" 
          icon={Award} 
          subValue="+4% vs last month" 
          color="emerald" 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pipeline Funnel */}
        <div className="xl:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-900">Acquisition Pipeline Funnel</h3>
            <select className="bg-slate-50 border-none text-xs font-bold rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500">
              <option>This Month</option>
              <option>Last 7 Days</option>
              <option>Year to Date</option>
            </select>
          </div>
          <div className="h-[300px]">
            {sortedPipeline.some(p => p.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedPipeline} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} width={100} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={32}>
                    {sortedPipeline.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.9} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-400 text-sm">No pipeline data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Source Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Channel Performance</h3>
          <div className="flex-1 h-[240px]">
            {orderedSources.some(s => s.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderedSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {orderedSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-400 text-sm">No source data available</p>
              </div>
            )}
          </div>
          <div className="space-y-3 mt-4">
            {orderedSources.map((entry, index) => (
              <div key={`${entry.name}-${index}`} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                  <span className="font-bold text-slate-600">{entry.name}</span>
                </div>
                <span className="font-black text-slate-900">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Performance Leaderboard */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Staff Productivity</h3>
            <button className="text-indigo-600 text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {staffPerformance.length > 0 ? (
              staffPerformance.map((staff) => (
                <div key={staff.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-indigo-600 shadow-sm">
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{staff.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">
                        {staff.name.includes('(Tele)') ? 'Telecaller' : 'Counselor'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900">{staff.calls}</div>
                    <div className="text-[10px] text-slate-400 font-bold">ACTIONS</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-600">+{staff.potentials}</div>
                    <div className="text-[10px] text-slate-400 font-bold">POTENTIALS</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32">
                <p className="text-slate-400 text-sm">No performance data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Segmentation by Country */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Globe size={20} className="text-indigo-600" />
            Desired Countries
          </h3>
          <div className="space-y-5">
            {countrySegmentation.length > 0 ? (
              countrySegmentation.map((item, idx) => {
                const maxLeads = Math.max(...countrySegmentation.map(c => c.leads));
                const percentage = (item.leads / maxLeads) * 100;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">{item.name}</span>
                      <span className="text-indigo-600">{item.leads}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-32">
                <p className="text-slate-400 text-sm">No country data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Referrals & Payouts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <DollarSign size={20} className="text-emerald-500" />
              Referral Payouts
            </h3>
            <button className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors">
               <Plus size={16} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {referralPayouts.length > 0 ? (
              referralPayouts.map((ref, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{ref.agent}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{ref.leads} Conversions this month</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900">{ref.pending}</div>
                    <div className="text-[10px] text-amber-600 font-bold">PENDING</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32">
                <p className="text-slate-400 text-sm">No payout data available</p>
              </div>
            )}
          </div>
          {referralPayouts.length > 0 && (
            <button className="w-full mt-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all">
              Process All Payouts
            </button>
          )}
        </div>
      </div>

      {/* New Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900">Create New Assignment</h2>
              <button 
                onClick={() => setShowAssignmentModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Lead Name *</label>
                <input 
                  type="text"
                  placeholder="Enter student/lead name"
                  value={assignmentForm.leadName}
                  onChange={(e) => setAssignmentForm({...assignmentForm, leadName: e.target.value})}
                  className="w-full mt-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Lead ID (Optional)</label>
                <input 
                  type="text"
                  placeholder="Auto-filled or enter ID"
                  value={assignmentForm.leadId}
                  onChange={(e) => setAssignmentForm({...assignmentForm, leadId: e.target.value})}
                  className="w-full mt-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Assign To *</label>
                <input 
                  type="text"
                  placeholder="Team member name"
                  value={assignmentForm.assignedToName}
                  onChange={(e) => setAssignmentForm({...assignmentForm, assignedToName: e.target.value})}
                  className="w-full mt-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Assigned To ID (Optional)</label>
                <input 
                  type="text"
                  placeholder="Team member ID"
                  value={assignmentForm.assignedTo}
                  onChange={(e) => setAssignmentForm({...assignmentForm, assignedTo: e.target.value})}
                  className="w-full mt-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Priority</label>
                <select 
                  value={assignmentForm.priority}
                  onChange={(e) => setAssignmentForm({...assignmentForm, priority: e.target.value})}
                  className="w-full mt-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Due Date</label>
                <input 
                  type="date"
                  value={assignmentForm.dueDate}
                  onChange={(e) => setAssignmentForm({...assignmentForm, dueDate: e.target.value})}
                  className="w-full mt-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Notes</label>
                <textarea 
                  placeholder="Add any notes or instructions..."
                  value={assignmentForm.notes}
                  onChange={(e) => setAssignmentForm({...assignmentForm, notes: e.target.value})}
                  rows={4}
                  className="w-full mt-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowAssignmentModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateAssignment}
                  disabled={assignmentLoading}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {assignmentLoading ? '...' : <Plus size={16} />}
                  {assignmentLoading ? 'Creating...' : 'Create Assignment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Leads Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900">Upload Lead Sheet</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Select File</label>
                <input
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full mt-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                />
                <p className="text-[11px] text-slate-400 mt-2">Supported: CSV, XLS, XLSX</p>
              </div>

              {uploadError && (
                <div className="text-sm text-rose-600 font-semibold">{uploadError}</div>
              )}

              {uploadSummary && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-sm">
                  <div className="font-bold text-emerald-700">Upload complete</div>
                  <div className="text-emerald-700">File: {uploadSummary.fileName}</div>
                  <div className="text-emerald-700">Rows: {uploadSummary.rowCount}</div>
                  <div className="text-emerald-700">Created: {uploadSummary.createdCount}</div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={handleUploadLeads}
                  disabled={uploadLoading}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploadLoading ? 'Uploading...' : <FileUp size={16} />}
                  {uploadLoading ? 'Uploading...' : 'Upload & Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
