import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Download,
  FileText,
  Search,
  User,
  X,
  Trash2,
  CheckCircle2
} from 'lucide-react';

interface CounselorDoc {
  id: string;
  docType: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

interface CounselorProfile {
  id: string;
  counselorId: string;
  fullName: string;
  mobile: string;
  email: string;
  aadhar: string;
  createdAt: string;
  updatedAt: string;
  totalDocs: number;
  lorCount: number;
  lastUpload: string | null;
  status?: string;
  docs: CounselorDoc[];
}

const CounselorProfiles: React.FC = () => {
  const [profiles, setProfiles] = useState<CounselorProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<CounselorProfile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/counselor-profile');
        if (!response.ok) {
          const msg = await response.text();
          throw new Error(msg || 'Failed to load counselor profiles');
        }
        const data = await response.json();
        setProfiles(Array.isArray(data.profiles) ? data.profiles : []);
      } catch (err: any) {
        setError(err?.message || 'Failed to load counselor profiles');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const handleDeleteProfile = async (profileId: string) => {
    if (!window.confirm('Are you sure you want to delete this profile and all associated documents?')) {
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await fetch(`/api/counselor-profile?profileId=${profileId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete profile');
      }
      setProfiles(profiles.filter(p => p.id !== profileId));
      setSelectedProfile(null);
      setSuccessMsg('Profile deleted successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete profile');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (profileId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/counselor-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          status: newStatus,
          action: 'updateStatus'
        })
      });
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      const updatedProfiles = profiles.map(p => 
        p.id === profileId ? { ...p, status: newStatus } : p
      );
      setProfiles(updatedProfiles);
      if (selectedProfile?.id === profileId) {
        setSelectedProfile({ ...selectedProfile, status: newStatus });
      }
      setSuccessMsg('Status updated successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await fetch('/api/counselor-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: selectedProfile?.id,
          docId,
          action: 'deleteDoc'
        })
      });
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      if (selectedProfile) {
        const updatedProfile = {
          ...selectedProfile,
          docs: selectedProfile.docs.filter(d => d.id !== docId),
          totalDocs: selectedProfile.totalDocs - 1,
          lorCount: selectedProfile.lorCount - (selectedProfile.docs.find(d => d.id === docId)?.docType === 'LOR' ? 1 : 0)
        };
        setSelectedProfile(updatedProfile);
        const updatedProfiles = profiles.map(p => p.id === selectedProfile.id ? updatedProfile : p);
        setProfiles(updatedProfiles);
      }
      setSuccessMsg('Document deleted successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete document');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredProfiles = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return profiles.filter((profile) => {
      return (
        profile.fullName?.toLowerCase().includes(search) ||
        profile.email?.toLowerCase().includes(search) ||
        profile.mobile?.toLowerCase().includes(search)
      );
    });
  }, [profiles, searchTerm]);

  const totalDocs = profiles.reduce((sum, profile) => sum + (profile.totalDocs || 0), 0);
  const totalLors = profiles.reduce((sum, profile) => sum + (profile.lorCount || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Counselor Docs Center</h1>
          <p className="text-sm text-slate-500">Review counselor profiles, verify documents, and download uploads.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600">
            <User size={14} /> {profiles.length} Profiles
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600">
            <FileText size={14} /> {totalDocs} Docs
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Profiles</div>
          <div className="text-3xl font-black text-slate-900 mt-2">{profiles.length}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Documents</div>
          <div className="text-3xl font-black text-slate-900 mt-2">{totalDocs}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">LOR Files</div>
          <div className="text-3xl font-black text-slate-900 mt-2">{totalLors}</div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search counselor by name, email, or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {error && (
          <div className="px-6 py-4 bg-rose-50 text-rose-700 flex items-center gap-2 text-sm font-semibold">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Counselor</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documents</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Upload</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProfiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-slate-900">{profile.fullName}</div>
                    <div className="text-[10px] font-bold text-slate-400">ID: {profile.counselorId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-semibold text-slate-700">{profile.email}</div>
                    <div className="text-[10px] text-slate-500">{profile.mobile}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-slate-700">{profile.totalDocs} files</div>
                    <div className="text-[10px] text-slate-500">{profile.lorCount} LOR</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-semibold text-slate-700">
                      {profile.lastUpload ? new Date(profile.lastUpload).toLocaleString() : '—'}
                    </div>
                    {profile.status && (
                      <div className="text-[10px] mt-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full w-fit font-semibold">
                        {profile.status}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex items-center gap-2 justify-end">
                    <button
                      onClick={() => setSelectedProfile(profile)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
                    >
                      View Docs
                    </button>
                    <button
                      onClick={() => handleDeleteProfile(profile.id)}
                      disabled={actionLoading}
                      className="px-3 py-2 bg-rose-100 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-200 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredProfiles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">
                    No counselor profiles found.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">
                    Loading counselor profiles...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-white h-full rounded-[32px] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-black text-slate-900">{selectedProfile.fullName}</h2>
                <p className="text-xs text-slate-500">{selectedProfile.email}</p>
              </div>
              <button
                onClick={() => setSelectedProfile(null)}
                className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>
            
            {(error || successMsg) && (
              <div className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 ${
                successMsg ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {successMsg ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {successMsg || error}
              </div>
            )}

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Status</div>
                <div className="flex gap-2">
                  {['Pending', 'Verified', 'Rejected'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedProfile.id, status)}
                      disabled={actionLoading}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                        selectedProfile.status === status
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Personal Details</div>
                <div className="grid grid-cols-1 gap-2 text-sm text-slate-700 mt-3">
                  <div>Mobile: <span className="font-semibold">{selectedProfile.mobile}</span></div>
                  <div>Email: <span className="font-semibold">{selectedProfile.email}</span></div>
                  <div>Aadhar: <span className="font-semibold">{selectedProfile.aadhar}</span></div>
                </div>
              </div>

              <div className="pt-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Uploaded Documents</div>
                <div className="mt-3 space-y-3">
                  {selectedProfile.docs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-800">{doc.docType}</div>
                        <div className="text-[10px] text-slate-500">{doc.fileName}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`/api/counselor-profile/doc/${doc.id}`}
                          className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                        >
                          <Download size={14} />
                        </a>
                        <button
                          onClick={() => handleDeleteDoc(doc.id)}
                          disabled={actionLoading}
                          className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {selectedProfile.docs.length === 0 && (
                    <div className="text-sm text-slate-400">No documents uploaded.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => setSelectedProfile(null)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => handleDeleteProfile(selectedProfile.id)}
                disabled={actionLoading}
                className="px-4 py-3 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 size={16} /> Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounselorProfiles;
