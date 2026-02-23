
import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Search, 
  Filter, 
  MoreVertical, 
  ChevronRight, 
  UserPlus, 
  Flag, 
  Clock, 
  CheckCircle2, 
  X,
  History,
  PhoneCall,
  Edit2,
  Loader
} from 'lucide-react';
import { MOCK_SHEETS, MOCK_SHEET_ROWS, MOCK_USERS } from '../constants';
import { LeadSheet, SheetRow, UserRole, CallStatus, InterestLevel } from '../types';

interface TelecallerManagementProps {
  currentUserRole: UserRole;
  currentUserId: string;
}

const TelecallerManagement: React.FC<TelecallerManagementProps> = ({ currentUserRole, currentUserId }) => {
  const [selectedSheet, setSelectedSheet] = useState<LeadSheet | null>(null);
  const [editingRow, setEditingRow] = useState<SheetRow | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sheets, setSheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [uploadName, setUploadName] = useState('');
  const [uploadAssignedTo, setUploadAssignedTo] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [updatingRow, setUpdatingRow] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [newLeadData, setNewLeadData] = useState<any>({
    name: '',
    phone: '',
    location: '',
    callStatus: CallStatus.NOT_CALLED,
    interestLevel: InterestLevel.WARM,
    remarks: '',
    isPotential: true
  });
  const [creatingLead, setCreatingLead] = useState(false);

  const isAdmin = currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.SUPER_ADMIN;

  // Fetch call sheets from database
  useEffect(() => {
    fetchSheets();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchSheets = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (!isAdmin) query.append('assignedTo', currentUserId);
      
      const response = await fetch(`/api/call-sheets?${query.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setSheets(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch call sheets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleUpdateRow = async () => {
    if (!editingRow || !selectedSheet) return;

    setUpdatingRow(true);
    try {
      const response = await fetch('/api/call-sheets/update-row', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId: selectedSheet._id || selectedSheet.id,
          rowId: editingRow.id,
          updates: editFormData
        })
      });

      if (response.ok) {
        await fetchSheets();
        // Update selected sheet with new data
        const updatedSheets = await fetch(`/api/call-sheets?id=${selectedSheet.id || selectedSheet._id}`);
        if (updatedSheets.ok) {
          const data = await updatedSheets.json();
          if (data.length > 0) setSelectedSheet(data[0]);
        }
        setEditingRow(null);
        setEditFormData({});
      } else {
        alert('Failed to update row');
      }
    } catch (error) {
      console.error('Failed to update row:', error);
      alert('Error updating row');
    } finally {
      setUpdatingRow(false);
    }
  };

  const handleConvertToLead = async () => {
    if (!editingRow) return;

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingRow.name,
          email: `${editingRow.phone}@noemail.local`,
          phone: editingRow.phone,
          source: 'TELECALLER_SHEET',
          pipeline: editingRow.interestLevel === 'HOT' ? 'QUALIFIED' : 'CONTACTED',
          interestedCountries: editingRow.location ? [editingRow.location] : [],
          interestedPrograms: [],
          notes: editingRow.remarks || ''
        })
      });

      if (response.ok) {
        alert('Successfully converted to lead!');
        setEditingRow(null);
      } else {
        alert('Failed to convert to lead');
      }
    } catch (error) {
      console.error('Failed to convert to lead:', error);
      alert('Error converting to lead');
    }
  };

  const handleCreateNewLead = async () => {
    if (!newLeadData.name || !newLeadData.phone) {
      alert('Name and phone are required');
      return;
    }

    setCreatingLead(true);
    try {
      // Create a new lead entry
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLeadData.name,
          email: `${newLeadData.phone}@noemail.local`,
          phone: newLeadData.phone,
          source: 'TELECALLER_SHEET',
          pipeline: newLeadData.interestLevel === InterestLevel.HOT ? 'QUALIFIED' : newLeadData.interestLevel === InterestLevel.WARM ? 'CONTACTED' : 'NEW',
          interestedCountries: newLeadData.location ? [newLeadData.location] : [],
          interestedPrograms: [],
          notes: newLeadData.remarks || ''
        })
      });

      if (response.ok) {
        alert('Lead created successfully!');
        setShowNewLeadModal(false);
        setNewLeadData({
          name: '',
          phone: '',
          location: '',
          callStatus: CallStatus.NOT_CALLED,
          interestLevel: InterestLevel.WARM,
          remarks: '',
          isPotential: true
        });
      } else {
        alert('Failed to create lead');
      }
    } catch (error) {
      console.error('Failed to create lead:', error);
      alert('Error creating lead');
    } finally {
      setCreatingLead(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadName || !uploadFile) {
      setUploadError('Sheet name and file are required');
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const uploadRes = await fetch('/api/uploads', {
        method: 'POST',
        body: formData
      });

      if (!uploadRes.ok) {
        const msg = await uploadRes.text();
        throw new Error(msg || 'Upload failed');
      }

      const uploadData = await uploadRes.json();

      const createRes = await fetch('/api/call-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: uploadName,
          uploadId: uploadData.uploadId,
          rows: uploadData.uploadId ? undefined : (uploadData.rows || []),
          assignedTo: uploadAssignedTo ? [uploadAssignedTo] : []
        })
      });

      if (!createRes.ok) {
        const msg = await createRes.text();
        throw new Error(msg || 'Failed to create call sheet');
      }

      setShowUploadModal(false);
      setUploadName('');
      setUploadAssignedTo('');
      setUploadFile(null);
      fetchSheets();
    } catch (error: any) {
      setUploadError(error?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const accessibleSheets = useMemo(() => {
    if (isAdmin) return sheets;
    return sheets.filter(s => s.assignedTo?.includes(currentUserId));
  }, [isAdmin, currentUserId, sheets]);

  const rowsForSelectedSheet = useMemo(() => {
    if (!selectedSheet) return [];
    // Get rows from the sheet's embedded rows array
    return selectedSheet.rows || [];
  }, [selectedSheet]);

  const filteredRows = rowsForSelectedSheet.filter(r => {
    const name = (r.name ?? '').toLowerCase();
    const phone = (r.phone ?? '');
    const search = searchTerm.toLowerCase();
    return name.includes(search) || phone.includes(searchTerm);
  });

  const getCallStatusColor = (status: CallStatus) => {
    switch (status) {
      case CallStatus.NOT_CALLED: return 'bg-slate-100 text-slate-600';
      case CallStatus.CALLED: return 'bg-indigo-100 text-indigo-700';
      case CallStatus.INTERESTED: return 'bg-emerald-100 text-emerald-700';
      case CallStatus.NOT_INTERESTED: return 'bg-rose-100 text-rose-700';
      case CallStatus.BUSY: return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  if (selectedSheet) {
    return (
      <div className="flex flex-col h-full gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedSheet(null)}
              className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-indigo-600 border border-transparent hover:border-slate-200"
            >
              <X size={20} />
            </button>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-none mb-1">{selectedSheet.name}</h2>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {selectedSheet.completedRows} / {selectedSheet.totalRows} PROCESSED
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search rows..." 
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name & Location</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Disposition</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Interest</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Follow-up</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map(row => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {row.isPotential && <Flag size={14} className="text-amber-500 fill-amber-500" />}
                      <div>
                        <div className="text-sm font-bold text-slate-900">{row.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{row.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-700">{row.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${getCallStatusColor(row.callStatus)}`}>
                      {row.callStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {row.interestLevel ? (
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${row.interestLevel === InterestLevel.HOT ? 'bg-rose-500' : row.interestLevel === InterestLevel.WARM ? 'bg-amber-500' : 'bg-sky-400'}`}></div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase">{row.interestLevel}</span>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">
                      {row.nextFollowUp || 'No task'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setEditingRow(row)}
                      className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Row Modal/Drawer */}
        {editingRow && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white h-full rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                     {editingRow.name.charAt(0)}
                   </div>
                   <div>
                     <h3 className="text-lg font-black text-slate-900">{editingRow.name}</h3>
                     <p className="text-[10px] text-slate-400 font-bold uppercase">{editingRow.phone}</p>
                   </div>
                </div>
                <button onClick={() => setEditingRow(null)} className="p-2 hover:bg-slate-50 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Call Disposition</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(CallStatus).map(status => (
                      <button 
                        key={status}
                        onClick={() => setEditFormData({ ...editFormData, callStatus: status })}
                        className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all ${(editFormData.callStatus || editingRow.callStatus) === status ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-50 hover:border-slate-100 text-slate-500'}`}
                      >
                        {status.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interest Rating</label>
                  <div className="flex gap-2">
                    {Object.values(InterestLevel).map(level => (
                      <button 
                        key={level}
                        onClick={() => setEditFormData({ ...editFormData, interestLevel: level })}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all ${(editFormData.interestLevel || editingRow.interestLevel) === level ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-50 hover:border-slate-100 text-slate-500'}`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Potential Candidate?</label>
                    <input 
                      type="checkbox" 
                      checked={editFormData.isPotential !== undefined ? editFormData.isPotential : editingRow.isPotential}
                      onChange={(e) => setEditFormData({ ...editFormData, isPotential: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Call Remarks</label>
                   <textarea 
                     className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                     placeholder="Add notes about the conversation..."
                     value={editFormData.remarks !== undefined ? editFormData.remarks : editingRow.remarks}
                     onChange={(e) => setEditFormData({ ...editFormData, remarks: e.target.value })}
                   />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule Next Follow-up</label>
                  <input 
                    type="date" 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold"
                    value={editFormData.nextFollowUp !== undefined ? editFormData.nextFollowUp : editingRow.nextFollowUp || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, nextFollowUp: e.target.value })}
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
                <button 
                  onClick={handleUpdateRow}
                  disabled={updatingRow}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 size={16} /> {updatingRow ? 'Saving...' : 'Save Row Update'}
                </button>
                <button 
                  onClick={handleConvertToLead}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus size={16} /> Convert to Lead
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Telecaller Workspace</h1>
          <p className="text-sm text-slate-500 font-medium">Process assigned lead sheets and add potential leads.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowNewLeadModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all"
          >
            <UserPlus size={16} /> New Potential Lead
          </button>
          {isAdmin && (
            <button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
            >
              <Upload size={16} /> Upload New Sheet
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={48} className="text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessibleSheets.map(sheet => {
            const sheetId = sheet.id || sheet._id;
            return (
              <div 
                key={sheetId}
                onClick={() => setSelectedSheet(sheet)}
                className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-200 cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <FileSpreadsheet size={24} />
                  </div>
                  <button className="p-2 text-slate-300 hover:text-slate-600">
                    <MoreVertical size={18} />
                  </button>
                </div>
                
                <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{sheet.name}</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Progress</span>
                    <span>{sheet.totalRows > 0 ? Math.round((sheet.completedRows / sheet.totalRows) * 100) : 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                      style={{ width: `${sheet.totalRows > 0 ? (sheet.completedRows / sheet.totalRows) * 100 : 0}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{new Date(sheet.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-[10px] font-black text-indigo-600 flex items-center gap-1 uppercase">
                      View Rows <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">Upload Call Sheet</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">Sheet Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Engineering Seminar Leads - May"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              {isAdmin && (
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Assign To</label>
                  <select
                    value={uploadAssignedTo}
                    onChange={(e) => setUploadAssignedTo(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id || u._id} value={u.id || u._id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">Upload CSV/Excel File</label>
                <label className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-indigo-300 transition-colors cursor-pointer block">
                  <Upload size={32} className="mx-auto mb-3 text-slate-400" />
                  <p className="text-sm font-bold text-slate-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-400 mt-1">CSV or Excel (max 10MB)</p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                  {uploadFile && (
                    <p className="text-xs text-indigo-600 font-bold mt-2">{uploadFile.name}</p>
                  )}
                </label>
              </div>
              {uploadError && (
                <div className="text-sm text-rose-600 font-semibold">{uploadError}</div>
              )}
              <div className="flex gap-3 justify-end pt-4">
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-60"
                >
                  {uploading ? 'Uploading...' : 'Upload Sheet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Lead Entry Modal */}
      {showNewLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900">Add Potential Lead</h3>
              <button onClick={() => setShowNewLeadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Full Name *</label>
                <input 
                  type="text"
                  placeholder="Lead name"
                  value={newLeadData.name}
                  onChange={(e) => setNewLeadData({ ...newLeadData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Phone Number *</label>
                <input 
                  type="tel"
                  placeholder="10 digit mobile number"
                  value={newLeadData.phone}
                  onChange={(e) => setNewLeadData({ ...newLeadData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Location</label>
                <input 
                  type="text"
                  placeholder="City/Area"
                  value={newLeadData.location}
                  onChange={(e) => setNewLeadData({ ...newLeadData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Call Disposition</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(CallStatus).map(status => (
                    <button 
                      key={status}
                      onClick={() => setNewLeadData({ ...newLeadData, callStatus: status })}
                      className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all ${newLeadData.callStatus === status ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-50 hover:border-slate-100 text-slate-500'}`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Interest Level</label>
                <div className="flex gap-2">
                  {Object.values(InterestLevel).map(level => (
                    <button 
                      key={level}
                      onClick={() => setNewLeadData({ ...newLeadData, interestLevel: level })}
                      className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all ${newLeadData.interestLevel === level ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-50 hover:border-slate-100 text-slate-500'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Notes/Remarks</label>
                <textarea 
                  placeholder="Add any notes about this lead..."
                  value={newLeadData.remarks}
                  onChange={(e) => setNewLeadData({ ...newLeadData, remarks: e.target.value })}
                  className="w-full h-24 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <input 
                  type="checkbox" 
                  id="potential"
                  checked={newLeadData.isPotential}
                  onChange={(e) => setNewLeadData({ ...newLeadData, isPotential: e.target.checked })}
                  className="w-5 h-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500" 
                />
                <label htmlFor="potential" className="text-sm font-bold text-emerald-700">
                  Mark as High Potential Candidate
                </label>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-slate-100">
              <button 
                onClick={() => setShowNewLeadModal(false)}
                className="px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewLead}
                disabled={creatingLead}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-bold flex items-center gap-2 disabled:opacity-60"
              >
                {creatingLead ? <Loader size={16} className="animate-spin" /> : <UserPlus size={16} />}
                {creatingLead ? 'Creating...' : 'Add Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelecallerManagement;
