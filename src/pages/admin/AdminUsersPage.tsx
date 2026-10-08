import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { User, UserRole } from '@shared/types';
import {
  Users2,
  Search,
  Filter,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  UserCheck,
  ShieldCheck,
  Shield
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { error: toastError, success: toastSuccess } = useToast();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Change Role Modal state
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);
  const [newSelectedRole, setNewSelectedRole] = useState<UserRole>('CITIZEN');
  const [modalLoading, setModalLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const rf = roleFilter === 'ALL' ? undefined : (roleFilter as UserRole);
      const res = await api.getUsers(rf, search || undefined);
      setUsers(res.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleRoleChangeConfirm = async () => {
    if (!roleModalUser) return;
    setModalLoading(true);

    try {
      await api.updateUserRole(roleModalUser.id, newSelectedRole);
      toastSuccess(`Role updated to ${newSelectedRole} for ${roleModalUser.full_name}. Audit log created.`);
      setRoleModalUser(null);
      await fetchUsers();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update role');
    } finally {
      setModalLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 inline-block mb-2">
            Access Control Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            User Administration & Roles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search registered citizens, staff, and administrators with audited permission control.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') fetchUsers(); }}
            placeholder="Search by name, email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Roles</option>
            <option value="CITIZEN">Citizen Only</option>
            <option value="STAFF">Staff Only</option>
            <option value="ADMIN">Admin Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-xs">Loading user accounts...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
          <Users2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No users match your criteria</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-4">User Identity</th>
                  <th className="p-4">Mobile</th>
                  <th className="p-4">Current Role</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 text-sm">{u.full_name}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{u.email}</p>
                    </td>

                    <td className="p-4 font-mono text-slate-700">
                      {u.phone}
                    </td>

                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        u.role === 'ADMIN'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : u.role === 'STAFF'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="p-4 text-slate-400 font-mono">
                      {new Date(u.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setRoleModalUser(u);
                          setNewSelectedRole(u.role);
                        }}
                        className="py-1 px-3 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 font-semibold text-slate-700 transition-colors"
                      >
                        Change Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-modal max-w-md w-full p-6 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Change User Role Access Level
            </h3>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Target user: <strong className="text-slate-900">{roleModalUser.full_name}</strong> (<span className="font-mono text-slate-500">{roleModalUser.email}</span>).
              Every sensitive role change is permanently committed to immutable audit logs.
            </p>

            <div className="space-y-3 mb-6 text-xs">
              <label className="block font-semibold uppercase tracking-wider text-slate-700">
                Select New Access Level
              </label>

              {(['CITIZEN', 'STAFF', 'ADMIN'] as UserRole[]).map((r) => (
                <div
                  key={r}
                  onClick={() => setNewSelectedRole(r)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    newSelectedRole === r
                      ? 'border-indigo-600 bg-indigo-50/70 font-bold text-indigo-950 ring-1 ring-indigo-600'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {r === 'ADMIN' && <Shield className="w-4 h-4 text-indigo-600" />}
                    {r === 'STAFF' && <ShieldCheck className="w-4 h-4 text-amber-500" />}
                    {r === 'CITIZEN' && <UserCheck className="w-4 h-4 text-emerald-600" />}
                    <span>{r}</span>
                  </div>
                  {newSelectedRole === r && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRoleModalUser(null)}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={modalLoading || newSelectedRole === roleModalUser.role}
                onClick={handleRoleChangeConfirm}
                className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-40"
              >
                {modalLoading ? 'Updating Role...' : 'Save & Audit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
