import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Flag,
  Calendar,
  User,
  Trash2,
  Edit2,
  Eye,
  ArrowUpDown,
  MoreVertical,
  ChevronDown,
  Loader
} from 'lucide-react';
import { Task, UserRole } from '../types';

interface MyTasksProps {
  currentUserRole: UserRole;
  currentUserId: string;
}

const MyTasks: React.FC<MyTasksProps> = ({ currentUserRole, currentUserId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status'>('dueDate');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    leadName: '',
    dueDate: '',
    priority: 'MEDIUM',
    type: '',
    assignedTo: ''
  });

  const isSuperAdmin = currentUserRole === UserRole.SUPER_ADMIN || currentUserRole === UserRole.ADMIN;

  // Fetch tasks and users
  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskData.title || !newTaskData.dueDate) {
      alert('Please fill in required fields');
      return;
    }

    const payload = {
      ...newTaskData,
      assignedTo: newTaskData.assignedTo || (isSuperAdmin ? '' : currentUserId)
    };

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setNewTaskData({
          title: '',
          description: '',
          leadName: '',
          dueDate: '',
          priority: 'MEDIUM',
          type: '',
          assignedTo: ''
        });
        setShowNewTaskForm(false);
        await fetchTasks();
      } else {
        const errorText = await response.text();
        alert(errorText || 'Failed to create task');
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task');
    }
  };

  // Filter tasks
  const filteredAndSortedTasks = useMemo(() => {
    let result = tasks;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.leadName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      result = result.filter(t => t.priority === priorityFilter);
    }

    // Filter by assigned user for non-admins
    if (!isSuperAdmin) {
      result = result.filter(t => t.assignedTo === currentUserId);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === 'priority') {
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3) -
          (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3);
      } else if (sortBy === 'status') {
        const statusOrder = { ASSIGNED: 0, IN_PROGRESS: 1, COMPLETED: 2, OVERDUE: 3, UNASSIGNED: 4 };
        return (statusOrder[a.status as keyof typeof statusOrder] ?? 5) -
          (statusOrder[b.status as keyof typeof statusOrder] ?? 5);
      }
      return 0;
    });

    return result;
  }, [tasks, searchTerm, statusFilter, priorityFilter, sortBy, isSuperAdmin, currentUserId]);

  // Stats
  const stats = useMemo(() => ({
    total: tasks.length,
    assigned: tasks.filter(t => t.status === 'ASSIGNED').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    overdue: tasks.filter(t => t.status === 'OVERDUE').length,
  }), [tasks]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'LOW': return 'text-sky-600 bg-sky-50 border-sky-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'IN_PROGRESS': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'OVERDUE': return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'ASSIGNED': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'UNASSIGNED': return 'text-slate-700 bg-slate-50 border-slate-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getAssigneeInfo = (userId?: string) => {
    if (!userId) return null;
    return users.find(u => u.id === userId || u._id === userId);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setTasks(tasks.map(t =>
          t.id === taskId || t._id === taskId ? { ...t, status: newStatus as any } : t
        ));
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== taskId && t._id !== taskId));
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">My Tasks</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Manage and track all task activities. {isSuperAdmin ? 'View all tasks across the team.' : 'View your assigned tasks.'}
          </p>
        </div>

        <button 
          onClick={() => setShowNewTaskForm(!showNewTaskForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
        >
          <Plus size={18} />
          New Task
        </button>
      </div>

      {/* New Task Form */}
      {showNewTaskForm && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Task</h3>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Task Title"
                value={newTaskData.title}
                onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              <input
                type="date"
                value={newTaskData.dueDate}
                onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <textarea
              placeholder="Description"
              value={newTaskData.description}
              onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-24"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Lead Name"
                value={newTaskData.leadName}
                onChange={(e) => setNewTaskData({ ...newTaskData, leadName: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <select
                value={newTaskData.priority}
                onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>
              <select
                value={isSuperAdmin ? newTaskData.assignedTo : currentUserId}
                onChange={(e) => setNewTaskData({ ...newTaskData, assignedTo: e.target.value })}
                disabled={!isSuperAdmin}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id || user._id} value={user.id || user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowNewTaskForm(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Assigned</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.assigned}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{stats.inProgress}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.completed}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Overdue</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{stats.overdue}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks, leads, descriptions..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="OVERDUE">Overdue</option>
            <option value="UNASSIGNED">Unassigned</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Priority</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader size={32} className="text-indigo-600 animate-spin" />
          </div>
        ) : filteredAndSortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <CheckSquare size={48} className="mb-4 opacity-30" />
            <p className="font-semibold">No tasks found</p>
            <p className="text-sm">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Task</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Lead</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAndSortedTasks.map((task) => {
                  const taskId = task.id || task._id;
                  const assignee = getAssigneeInfo(task.assignedTo);
                  return (
                    <tr key={taskId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">{task.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{task.leadName || '-'}</td>
                      <td className="px-6 py-4">
                        {assignee ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-sm font-medium text-slate-600">{assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDate(task.dueDate)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
                          <Flag size={12} />
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusUpdate(taskId, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border cursor-pointer ${getStatusColor(task.status)}`}
                        >
                          <option value="ASSIGNED">Assigned</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="OVERDUE">Overdue</option>
                          <option value="UNASSIGNED">Unassigned</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowTaskModal(true);
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Eye size={16} className="text-slate-600" />
                          </button>
                          {isSuperAdmin && (
                            <button
                              onClick={() => handleDeleteTask(taskId)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedTask.title}</h2>
                <p className="text-sm text-slate-600 mt-1">{selectedTask.description}</p>
              </div>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Lead Name</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{selectedTask.leadName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Due Date</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{formatDate(selectedTask.dueDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Status</p>
                  <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusColor(selectedTask.status)}`}>
                    {selectedTask.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Priority</p>
                  <span className={`inline-flex items-center gap-1 mt-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${getPriorityColor(selectedTask.priority)}`}>
                    <Flag size={12} />
                    {selectedTask.priority}
                  </span>
                </div>
              </div>

              {selectedTask.checklist && selectedTask.checklist.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">Checklist</p>
                  <div className="space-y-2">
                    {selectedTask.checklist.map((item, idx) => (
                      <label key={idx} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={item.completed}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600"
                        />
                        <span className={item.completed ? 'line-through text-slate-400' : 'text-slate-700'}>
                          {item.item}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                Edit Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
