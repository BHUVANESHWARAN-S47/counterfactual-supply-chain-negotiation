import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, UserRole } from '../types';
import {
  Users,
  Search,
  Filter,
  Shield,
  CheckCircle2,
  XCircle,
  RefreshCw,
  UserCheck,
  UserX,
  History,
  Lock,
  ArrowRight
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'audit'>('users');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userData, logData] = await Promise.all([
        api.getUsers(),
        api.getAuditLogs(40),
      ]);
      setUsers(userData);
      setAuditLogs(logData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (user: User) => {
    try {
      const updated = await api.updateUserStatus(user.id, !user.is_active);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      setFeedbackMsg({
        type: 'success',
        text: `Account for ${user.email} is now ${updated.is_active ? 'ACTIVE' : 'DEACTIVATED'}.`,
      });
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Status update failed' });
    }
  };

  const handleChangeRole = async (userId: number, newRole: string) => {
    try {
      const updated = await api.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      setFeedbackMsg({
        type: 'success',
        text: `Role successfully updated to ${newRole} for ${updated.email}.`,
      });
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Role change failed' });
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.company_name && u.company_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-[#EFF6FF] text-[#2563EB]">
              <Users className="h-4 w-4" />
            </span>
            <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">
              System Administration
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
            User & Role Governance
          </h1>
          <p className="text-xs text-[#6B7280] font-medium mt-0.5">
            Manage user accounts, assign verified enterprise roles, and audit security events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'users'
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'bg-white border border-[#E5E7EB] text-[#4B5563] hover:text-[#111827]'
            }`}
          >
            Registered Users ({users.length})
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'audit'
                ? 'bg-[#7C3AED] text-white shadow-2xs'
                : 'bg-white border border-[#E5E7EB] text-[#4B5563] hover:text-[#111827]'
            }`}
          >
            Audit Logs ({auditLogs.length})
          </button>
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#2563EB] text-[#374151] hover:text-[#2563EB] transition shadow-2xs cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            feedbackMsg.type === 'success'
              ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
              : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {activeSubTab === 'users' ? (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F5F7FB] border border-[#E5E7EB] rounded-xl pl-9 pr-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Filter className="h-4 w-4 text-[#9CA3AF]" />
              <span className="text-xs font-semibold text-[#4B5563]">Role:</span>
              {['ALL', 'ADMIN', 'PROCUREMENT', 'SUPPLIER', 'CUSTOMER'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    roleFilter === r
                      ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]'
                      : 'text-[#6B7280] hover:bg-[#F3F4F6]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Assigned Role</th>
                    <th className="px-5 py-3.5">Organization</th>
                    <th className="px-5 py-3.5">Account Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-[#6B7280]">
                        <span className="animate-pulse font-bold text-[#2563EB]">
                          Loading user directory...
                        </span>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-[#6B7280]">
                        No users match the search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-[#F9FAFB] transition">
                        <td className="px-5 py-3.5 font-bold text-[#111827]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold flex items-center justify-center text-xs">
                              {user.full_name.charAt(0).toUpperCase()}
                            </div>
                            <span>{user.full_name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-[#4B5563]">{user.email}</td>
                        <td className="px-5 py-3.5">
                          <select
                            value={user.role}
                            onChange={(e) => handleChangeRole(user.id, e.target.value)}
                            className="bg-white border border-[#E5E7EB] rounded-lg px-2 py-1 text-xs font-bold text-[#111827] focus:outline-none focus:border-[#2563EB] cursor-pointer"
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="PROCUREMENT">PROCUREMENT</option>
                            <option value="SUPPLIER">SUPPLIER</option>
                            <option value="CUSTOMER">CUSTOMER</option>
                          </select>
                        </td>
                        <td className="px-5 py-3.5 text-[#6B7280]">
                          {user.company_name || 'Individual'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              user.is_active
                                ? 'bg-[#ECFDF5] text-[#059669]'
                                : 'bg-[#FEF2F2] text-[#DC2626]'
                            }`}
                          >
                            {user.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                              user.is_active
                                ? 'border-[#FED7AA] text-[#C2410C] hover:bg-[#FFF7ED]'
                                : 'border-[#A7F3D0] text-[#047857] hover:bg-[#ECFDF5]'
                            }`}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Audit Logs View */
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#F3F4F6] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111827]">Security & Administrative Audit Trail</h3>
            <span className="text-[11px] text-[#6B7280]">Immutable system activity records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Event Action</th>
                  <th className="px-5 py-3.5">User / Initiator</th>
                  <th className="px-5 py-3.5">Entity</th>
                  <th className="px-5 py-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-[#6B7280]">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F9FAFB] transition">
                      <td className="px-5 py-3 text-[#9CA3AF] text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-semibold text-[#111827]">
                        {log.user_email || 'System Daemon'}
                      </td>
                      <td className="px-5 py-3 text-[#4B5563]">
                        {log.entity_type} #{log.entity_id}
                      </td>
                      <td className="px-5 py-3 text-[#6B7280] text-[11px] max-w-xs truncate">
                        {log.new_values ? JSON.stringify(log.new_values) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
