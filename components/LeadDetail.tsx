
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare, 
  FileText, 
  Activity, 
  Plus,
  Send,
  Zap,
  Globe,
  GraduationCap,
  Calendar,
  User as UserIcon,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Briefcase,
  History,
  CheckCircle,
  XCircle,
  Flag,
  DollarSign
} from 'lucide-react';
import { Lead, LeadStage, InterestLevel } from '../types';
import { generateLeadResponseSuggestion } from '../services/gemini';

interface LeadDetailProps {
  lead: Lead;
  onClose: () => void;
}

const LeadDetail: React.FC<LeadDetailProps> = ({ lead, onClose }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'timeline' | 'ai'>('profile');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (activeTab === 'ai') {
      fetchAISuggestion();
    }
  }, [activeTab]);

  const fetchAISuggestion = async () => {
    setLoadingSuggestion(true);
    const context = `Student ${lead.name} interested in ${lead.program} for ${lead.countryPreference.join(', ')}. Current stage: ${lead.stage}. Interest level: ${lead.interestLevel}. Program: ${lead.program}. Budget: ${lead.budget}. Intake: ${lead.intakeMonth}.`;
    const res = await generateLeadResponseSuggestion(context);
    setSuggestion(res);
    setLoadingSuggestion(false);
  };

  const getStageColor = (stage: LeadStage) => {
    switch (stage) {
      case LeadStage.NEW: return 'bg-sky-100 text-sky-700';
      case LeadStage.QUALIFIED: return 'bg-indigo-100 text-indigo-700';
      case LeadStage.CONVERTED: return 'bg-emerald-100 text-emerald-700';
      case LeadStage.LOST: return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-slate-50 shadow-2xl z-[60] flex flex-col transform transition-transform border-l border-slate-200 animate-in slide-in-from-right duration-300">
      {/* Header Panel */}
      <div className="bg-white p-6 border-b border-slate-100 flex justify-between items-start">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg">
              {lead.name.charAt(0)}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${lead.interestLevel === InterestLevel.HOT ? 'bg-rose-500' : lead.interestLevel === InterestLevel.WARM ? 'bg-amber-500' : 'bg-sky-400'}`}></div>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 leading-none">{lead.name}</h2>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${getStageColor(lead.stage)}`}>
                {lead.stage}
              </span>
              <span className="text-xs text-slate-400 font-bold">• Lead ID: {lead.id.toUpperCase()}</span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1 font-medium mt-1">
              <History size={12} />
              Last contact: {new Date(lead.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
          <X size={24} />
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex bg-white border-b border-slate-100 px-6 scrollbar-hide overflow-x-auto">
        {[
          { id: 'profile', label: 'Profile', icon: UserIcon },
          { id: 'preferences', label: 'Preferences', icon: Globe },
          { id: 'timeline', label: 'Timeline', icon: Activity },
          { id: 'ai', label: 'AI Counselor', icon: Zap },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap
              ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}
            `}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Student & Guardian */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Personal Identification</h3>
                <button className="text-[10px] font-bold text-indigo-600 hover:underline">Edit Details</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <UserIcon size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Student Details</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">FULL NAME</div>
                      <div className="text-sm font-bold text-slate-900">{lead.name}</div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="text-[10px] text-slate-400 font-bold">PHONE</div>
                        <div className="text-sm font-bold text-slate-900">{lead.phone}</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] text-slate-400 font-bold">EMAIL</div>
                        <div className="text-sm font-bold text-slate-900 truncate">{lead.email}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Guardian Details</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">GUARDIAN NAME</div>
                      <div className="text-sm font-bold text-slate-900">{lead.guardianName || 'Not Provided'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">RELATION</div>
                      <div className="text-sm font-bold text-slate-900">Guardian / Parent</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Consent Status */}
            <section className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${lead.consentStatus ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {lead.consentStatus ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Communication Consent</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    {lead.consentStatus ? `Verified on ${lead.consentDate}` : 'No active consent'}
                  </div>
                </div>
              </div>
              {!lead.consentStatus && (
                <button className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest">Send Request</button>
              )}
            </section>

            {/* Assignments */}
            <section className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Ownership & Assignments</h3>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                    {lead.assignedTo ? 'L' : '?'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Current Owner</div>
                    <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">
                      {lead.assignedTo === 'u4' ? 'Lisa Counselor' : lead.assignedTo === 'u3' ? 'John Caller' : 'Unassigned'}
                    </div>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors border border-slate-100 rounded-lg">
                  <Plus size={18} />
                </button>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
                  <Globe size={16} /> Destination
                </div>
                <div className="space-y-3">
                  {lead.countryPreference.map(c => (
                    <div key={c} className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-700">{c}</span>
                      <span className="text-[10px] font-black text-emerald-600 uppercase">Primary</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-amber-600 font-black text-xs uppercase tracking-widest">
                  <GraduationCap size={16} /> Program
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-900 leading-tight">{lead.program}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Masters / Engineering</div>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Financials & Intake</h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[9px] font-black">
                    <DollarSign size={12} /> Yearly Budget
                  </div>
                  <div className="text-lg font-black text-slate-900">{lead.budget || 'TBD'}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[9px] font-black">
                    <Calendar size={12} /> Target Intake
                  </div>
                  <div className="text-lg font-black text-slate-900">{lead.intakeMonth || 'TBD'}</div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Activity History</h3>
              <div className="flex gap-2">
                 <button className="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                   <Phone size={14} />
                 </button>
                 <button className="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                   <Plus size={14} />
                 </button>
              </div>
            </div>
            
            <div className="relative pl-6 space-y-8">
              <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-slate-100"></div>
              
              <div className="relative">
                <div className="absolute -left-[24px] w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-white shadow-sm"></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="text-xs font-bold text-slate-900">Lead Qualified by AI</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Yesterday</div>
                  </div>
                  <p className="text-[11px] text-slate-500 italic">"Intent detection identified high preference for UK Masters programs. Confidence: 94%"</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[24px] w-4 h-4 rounded-full bg-slate-300 ring-4 ring-white shadow-sm"></div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2 opacity-80">
                  <div className="flex justify-between items-start">
                    <div className="text-xs font-bold text-slate-900">WhatsApp Session Started</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">3 Days Ago</div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600">
                    <MessageSquare size={10} /> View Conversation Log
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-indigo-600 text-white p-8 rounded-[32px] shadow-xl relative overflow-hidden group">
               <Zap className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform" />
               <div className="relative z-10 space-y-4">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-white/20 rounded-xl">
                    <Zap size={24} className="text-amber-300" />
                   </div>
                   <h4 className="text-xl font-black">AI Intent Profile</h4>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white/10 p-3 rounded-2xl">
                     <div className="text-[9px] font-black uppercase text-indigo-200">Confidence</div>
                     <div className="text-lg font-black tracking-tight">94% Hot</div>
                   </div>
                   <div className="bg-white/10 p-3 rounded-2xl">
                     <div className="text-[9px] font-black uppercase text-indigo-200">Sentiment</div>
                     <div className="text-lg font-black tracking-tight">Positive</div>
                   </div>
                 </div>
               </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recommended Counselor Script</h3>
               <div className="p-6 bg-white border border-slate-200 border-dashed rounded-[24px] shadow-sm italic text-slate-600 text-sm leading-relaxed">
                  {loadingSuggestion ? (
                    <div className="flex items-center gap-3 text-slate-400 animate-pulse">
                      <Clock size={16} className="animate-spin" /> Analyzing interaction patterns...
                    </div>
                  ) : suggestion}
               </div>
               {!loadingSuggestion && (
                 <div className="flex gap-2">
                   <button className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                     <Send size={14} /> Send Recommendation
                   </button>
                   <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                     <History size={16} />
                   </button>
                 </div>
               )}
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Extracted Queries</h3>
                 <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black">AI DETECTED</span>
               </div>
               <div className="flex flex-wrap gap-2">
                 {['Scholarships?', 'Accommodation assistance', 'Post-study work visa'].map(q => (
                   <span key={q} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200">{q}</span>
                 ))}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Scheduler Section - Sticky */}
      <div className="p-6 bg-white border-t border-slate-100 space-y-4">
         <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
           Next Follow-up
           <Calendar size={14} />
         </div>
         <div className="flex gap-2">
           <input 
             type="date" 
             className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
             defaultValue={lead.followUpDate}
           />
           <input 
             type="time" 
             className="w-32 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
             defaultValue="10:00"
           />
         </div>
      </div>

      {/* Footer Conversion Actions */}
      <div className="p-6 bg-slate-900 flex gap-2 shrink-0 overflow-x-auto no-scrollbar">
        <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all whitespace-nowrap min-w-[120px]">
          <CheckCircle size={14} /> Qualify Lead
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all whitespace-nowrap min-w-[120px]">
          <GraduationCap size={14} /> Converted
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all whitespace-nowrap min-w-[120px]">
          <XCircle size={14} /> Mark Lost
        </button>
      </div>
    </div>
  );
};

export default LeadDetail;
