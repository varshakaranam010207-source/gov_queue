import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { StaffProfile, ServiceCenter, User } from '@shared/types';
import {
  Users2,
  Plus,
  ShieldCheck,
  Building2,
  Loader2,
  Search,
  CheckCircle2,
  BadgeAlert
} from 'lucide-react';

export const AdminStaffPage: React.FC = () => {
  const { error: toastError, success: toastSuccess } = useToast();

  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    user_id: '',
    center_id: '',
    employee_id: '',
    designation: 'Senior Verification Officer',
  });

  const fetchData = async () => {
    try {
      const [sRes, cRes, uRes] = await Promise.all([
        api.getStaff(),
        api.getCenters(),
        api.getUsers(),
      ]);
      setStaffList(sRes.staff || []);
      setCenters(cRes.centers || []);
      setUsers(uRes.users || []);
    } catch (err) {
      console.error('Failed to load staff management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user_id || !formData.center_id || !formData.employee_id) {
      toastError('Please fill all required staff profile fields.');
      return;
    }

    setModalLoading(true);
    try {
      await api.assignStaff(formData);
      toastSuccess(`Staff profile assigned for Employee ID ${formData.employee_id}`);
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to assign staff');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 inline-block mb-2">
            Personnel Roster
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Staff & Desk Operator Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Assign authorized desk personnel to facilitation centers and counter shifts.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              user_id: users.find(u => u.role === 'STAFF')?.id || (users[0]?.id || ''),
              center_id: centers[0]?.id || '',
              employee_id: `EMP-GOV-${Math.floor(1000 + Math.random() * 9000)}`,
              designation: 'Senior Verification Officer',
            });
            setIsModalOpen(true);
          }}
          className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Assign Staff to Center</span>
        </button>
      </div>

      {/* Staff Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-xs">Loading staff roster...</p>
        </div>
      ) : staffList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
          <Users2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No staff members assigned</p>
          <p className="text-xs text-slate-400 mt-1">Assign an employee to a center to begin desk operations.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-4">Employee ID</th>
                  <th className="p-4">Personnel Officer</th>
                  <th className="p-4">Assigned Facilitation Center</th>
                  <th className="p-4">Designation</th>
                  <th className="p-4">Shift Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.map((sp) => (
                  <tr key={sp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-indigo-700">
                      {sp.employee_id}
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-900 text-sm">{sp.user?.full_name || 'Staff Member'}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{sp.user?.email}</p>
                    </td>

                    <td className="p-4 font-semibold text-slate-800">
                      {sp.center?.name || 'Center Assigned'}
                    </td>

                    <td className="p-4 text-slate-600 font-medium">
                      {sp.designation}
                    </td>

                    <td className="p-4">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        ACTIVE ON DUTY
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-modal max-w-md w-full p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-900">Assign Staff Profile</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssign} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Select User Account
                </label>
                <select
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  <option value="">-- Choose User --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.email}) - {u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Assign to Facilitation Center
                </label>
                <select
                  value={formData.center_id}
                  onChange={(e) => setFormData({ ...formData, center_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  <option value="">-- Choose Center --</option>
                  {centers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Employee Official ID
                </label>
                <input
                  type="text"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  placeholder="EMP-GOV-8492"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Designation / Role Title
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="Senior Verification Officer"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  {modalLoading ? 'Assigning...' : 'Confirm Staff Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
