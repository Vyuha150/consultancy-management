
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  ChevronRight,
  UserCheck,
  Flag,
  Calendar,
  Phone
} from 'lucide-react';
import { MOCK_LEADS } from '../constants';
import { Lead, LeadStage, InterestLevel, LeadSource } from '../types';

interface LeadListProps {
  leads?: Lead[];
  onLeadClick: (lead: Lead) => void;
}

const LeadList: React.FC<LeadListProps> = ({ leads = MOCK_LEADS, onLeadClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getStageColor = (stage: LeadStage) => {
    switch (stage) {
      case LeadStage.NEW: return 'bg-sky-100 text-sky-700';
      case LeadStage.QUALIFIED: return 'bg-indigo-100 text-indigo-700';
      case LeadStage.CONVERTED: return 'bg-emerald-100 text-emerald-700';
      case LeadStage.LOST: return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getInterestBadge = (level: InterestLevel) => {
    switch (level) {
      case InterestLevel.HOT: return 'bg-rose-500';
      case InterestLevel.WARM: return 'bg-amber-500';
      case InterestLevel.COLD: return 'bg-sky-400';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search leads by name, email..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter size={18} />
            Filters
          </button>
          <button className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            New Lead
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Info</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Interest</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stage</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Activity</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr 
                  key={lead.id} 
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  onClick={() => onLeadClick(lead)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                          {lead.name.charAt(0)}
                        </div>
                        {lead.aiFlagged && (
                          <div className="absolute -top-1 -right-1 p-0.5 bg-indigo-600 rounded-full text-white shadow-sm ring-2 ring-white">
                            <Flag size={10} fill="currentColor" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{lead.name}</div>
                        <div className="text-xs text-slate-500">{lead.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-600 px-2 py-1 bg-slate-100 rounded">
                      {lead.source.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getInterestBadge(lead.interestLevel)}`}></div>
                      <span className="text-xs font-medium text-slate-700">{lead.interestLevel}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getStageColor(lead.stage)}`}>
                      {lead.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-600 flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(lead.updatedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div>Showing {leads.length} leads</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded bg-white disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 border border-slate-200 rounded bg-white">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadList;
