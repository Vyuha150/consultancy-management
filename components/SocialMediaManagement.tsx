
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Plus, 
  Search, 
  MoreVertical, 
  Facebook, 
  Instagram, 
  Youtube, 
  Globe, 
  Link, 
  ArrowUpRight, 
  Layout, 
  Clipboard, 
  UserPlus, 
  FileText,
  X,
  Smartphone,
  CheckCircle2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { MOCK_CAMPAIGNS } from '../constants';
import { Campaign, LeadSource } from '../types';

interface CampaignData {
  id: string;
  name: string;
  platform: string;
  status: string;
  leads: number;
  conversions: number;
  budget?: number;
  spent?: number;
  roi?: number;
}

const SocialMediaManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'manual' | 'form-builder'>('campaigns');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch campaigns from database
  useEffect(() => {
    if (activeTab === 'campaigns') {
      fetchCampaigns();
    }
  }, [activeTab]);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      } else {
        setError('Failed to load campaigns');
      }
    } catch (err) {
      setError('Error fetching campaigns');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'FACEBOOK': return <Facebook size={18} className="text-blue-600" />;
      case 'INSTAGRAM': return <Instagram size={18} className="text-pink-600" />;
      case 'GOOGLE': return <Globe size={18} className="text-indigo-600" />;
      case 'YOUTUBE': return <Youtube size={18} className="text-red-600" />;
      case 'WHATSAPP': return <Smartphone size={18} className="text-green-600" />;
      case 'EMAIL': return <FileText size={18} className="text-purple-600" />;
      case 'LINKEDIN': return <Link size={18} className="text-blue-700" />;
      default: return <Link size={18} className="text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Social Media Hub</h1>
          <p className="text-sm text-slate-500 font-medium">Monitor active campaigns and ingest leads from DMs or forms.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
          {[
            { id: 'campaigns', label: 'Campaigns', icon: BarChart3 },
            { id: 'manual', label: 'Quick Entry', icon: Clipboard },
            { id: 'form-builder', label: 'Forms', icon: Layout },
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

      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Social Leads</div>
               <div className="text-3xl font-black text-slate-900">
                 {loading ? '...' : campaigns.reduce((sum, c) => sum + c.leads, 0)}
               </div>
               <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                 <ArrowUpRight size={10} /> +12% this month
               </div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Conversions</div>
               <div className="text-3xl font-black text-slate-900">
                 {loading ? '...' : campaigns.reduce((sum, c) => sum + c.conversions, 0)}
               </div>
               <div className="mt-2 text-[10px] font-medium text-slate-400 italic">From active campaigns</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Campaigns</div>
               <div className="text-3xl font-black text-slate-900">
                 {loading ? '...' : campaigns.filter(c => c.status === 'ACTIVE').length}
               </div>
               <div className="mt-2 text-[10px] font-medium text-slate-400 italic">Running right now</div>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-2xl flex items-center gap-3">
              <AlertCircle size={20} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Campaigns</h3>
               <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">
                 <Plus size={14} /> New Campaign
               </button>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-slate-400">Loading campaigns...</div>
              ) : campaigns.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No campaigns found</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaign</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Leads</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Conversions</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Budget</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ROI</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {campaigns.map(campaign => (
                      <tr key={campaign.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-white transition-colors">
                              {getPlatformIcon(campaign.platform)}
                            </div>
                            <div>
                              <div className="text-sm font-black text-slate-900 leading-none mb-1 group-hover:text-indigo-600 transition-colors">{campaign.name}</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{campaign.platform}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center text-sm font-black text-slate-900">{campaign.leads}</td>
                        <td className="px-8 py-6 text-center text-sm font-black text-emerald-600">{campaign.conversions}</td>
                        <td className="px-8 py-6 text-center text-sm font-black text-slate-900">${campaign.budget || 0}</td>
                        <td className="px-8 py-6 text-center text-sm font-black text-indigo-600">{campaign.roi || 0}%</td>
                        <td className="px-8 py-6">
                           <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${campaign.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : campaign.status === 'PAUSED' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                             {campaign.status}
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
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'manual' && (
        <div className="max-w-2xl mx-auto w-full space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl space-y-8">
            <div className="space-y-2 text-center">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[24px] flex items-center justify-center mx-auto mb-4">
                <Clipboard size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Direct Message Ingestion</h2>
              <p className="text-slate-500 text-sm font-medium">Quickly capture a student lead coming from direct social inquiries.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Name</label>
                 <input type="text" placeholder="e.g. Rahul Verma" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                 <input type="tel" placeholder="+91 98XXX XXX00" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all" />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Origin</label>
                 <select className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all">
                    <option>Instagram DM</option>
                    <option>Facebook Message</option>
                    <option>LinkedIn InMail</option>
                    <option>Telegram</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Interest Level</label>
                 <select className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all">
                    <option>Warm (Neutral)</option>
                    <option>Hot (Highly Interested)</option>
                    <option>Cold (Just Querying)</option>
                 </select>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Conversation Context (Notes)</label>
               <textarea placeholder="Paste relevant chat parts or student queries here..." className="w-full h-32 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all resize-none"></textarea>
            </div>

            <button className="w-full py-5 bg-indigo-600 text-white rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-95">
              <UserPlus size={20} /> Create Lead Profile
            </button>
          </div>
        </div>
      )}

      {activeTab === 'form-builder' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
              <div className="flex justify-between items-start">
                 <div>
                    <h3 className="text-lg font-black text-slate-900">Landing Page Form</h3>
                    <p className="text-xs text-slate-500">Public intake form for primary ad traffic.</p>
                 </div>
                 <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                    <CheckCircle2 size={24} />
                 </div>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase">
                    <span>Active Fields</span>
                    <span>6 Total</span>
                 </div>
                 <div className="space-y-2">
                    {['Full Name', 'Email', 'Phone', 'Country Pref', 'Program', 'Consent'].map(f => (
                       <div key={f} className="flex items-center gap-3 text-xs font-bold text-slate-700 bg-white p-3 rounded-xl shadow-sm border border-slate-50">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                          {f}
                       </div>
                    ))}
                 </div>
              </div>
              <div className="flex gap-2">
                 <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                    Copy Public Link
                 </button>
                 <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all">
                    <Trash2 size={18} />
                 </button>
              </div>
           </div>

           <div className="bg-indigo-600 text-white p-8 rounded-[40px] shadow-2xl space-y-6 flex flex-col justify-center">
              <div className="p-4 bg-white/20 rounded-[32px] w-fit mx-auto mb-4">
                 <Smartphone size={48} className="text-white" />
              </div>
              <div className="text-center space-y-2">
                 <h3 className="text-2xl font-black">Mobile Optimized</h3>
                 <p className="text-indigo-100/70 text-sm leading-relaxed max-w-xs mx-auto">
                    All forms are automatically generated as Progressive Web Apps (PWA) for zero-friction mobile lead intake.
                 </p>
              </div>
              <button className="mt-4 w-full py-4 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all">
                 Preview Mobile View
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaManagement;
