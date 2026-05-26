import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

const AdminDashboard = ({ user }) => {
    const [stats, setStats] = useState({ total: 0, pending: 0, working: 0, solved: 0 });
    const [users, setUsers] = useState([]);

    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'Ward Member', wardNumber: '', specialization: '', phoneNumber: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            // 1. Fetch Grievance Stats
            const resG = await axios.get('http://localhost:5000/api/grievances/dashboard', { headers });
            const allGrievances = resG.data;
            
            let p = 0, w = 0, s = 0;
            allGrievances.forEach(g => {
                if (g.status === 'Pending') p++;
                else if (g.status === 'Working on it') w++;
                else if (g.status === 'Solved') s++;
            });
            setStats({ total: allGrievances.length, pending: p, working: w, solved: s });

            // 2. Fetch Users
            const resU = await axios.get('http://localhost:5000/api/users', { headers });
            setUsers(resU.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/users/manage', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('User created successfully!');
            setFormData({ name: '', email: '', password: '', role: 'Ward Member', wardNumber: '', specialization: '', phoneNumber: '' });
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Error creating user.');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to completely remove this user from the system?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('User deleted.');
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Error deleting user.');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">System Administration</h2>
            
            {/* System Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                    <p className="text-slate-500 text-sm mb-1">Total Grievances</p>
                    <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                    <p className="text-slate-500 text-sm mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-slate-800">{users.length}</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-800 shadow-sm text-center text-white">
                    <p className="text-slate-300 text-sm mb-1">System Health</p>
                    <p className="text-3xl font-bold text-emerald-400">100%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form to Add Any User */}
                <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Add Official User</h3>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border border-slate-200 rounded-lg p-3 bg-slate-50 font-medium">
                            <option value="Ward Member">Role: Ward Member</option>
                            <option value="Worker">Role: Worker</option>
                            <option value="Mayor">Role: Mayor</option>
                            <option value="Admin">Role: Admin</option>
                        </select>

                        <input type="text" placeholder="Full Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-3 bg-slate-50 outline-none focus:border-emerald-500" />
                        <input type="email" placeholder="Email Address" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border rounded-lg p-3 bg-slate-50 outline-none focus:border-emerald-500" />
                        <input type="text" placeholder="Phone Number" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="w-full border rounded-lg p-3 bg-slate-50 outline-none focus:border-emerald-500" />
                        
                        {(formData.role === 'Ward Member' || formData.role === 'Worker') && (
                            <input type="text" placeholder="Ward Number (e.g. Ward 45)" required value={formData.wardNumber} onChange={e => setFormData({...formData, wardNumber: e.target.value})} className="w-full border rounded-lg p-3 bg-slate-50 outline-none focus:border-emerald-500" />
                        )}

                        {formData.role === 'Worker' && (
                            <select required value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} className="w-full border rounded-lg p-3 bg-slate-50 outline-none focus:border-emerald-500">
                                <option value="">Select Specialization</option>
                                <option value="Electricity">Electricity</option>
                                <option value="Sanitation">Sanitation</option>
                                <option value="Road/Pothole">Road/Pothole</option>
                                <option value="Water Supply">Water Supply</option>
                                <option value="Other">Other</option>
                            </select>
                        )}

                        <input type="password" placeholder="System Password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border rounded-lg p-3 bg-slate-50 outline-none focus:border-emerald-500" />

                        <button type="submit" className="w-full bg-slate-800 text-white font-medium p-3 rounded-lg hover:bg-slate-700 transition">Create Account</button>
                    </form>
                </div>

                {/* List of ALL Users */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Complete User Directory</h3>
                    <div className="overflow-y-auto flex-1 pr-2">
                        <div className="grid gap-3">
                            {users.map(u => (
                                <div key={u._id} className="flex items-center justify-between p-4 border border-slate-100 bg-slate-50 rounded-xl hover:shadow-sm transition">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-slate-800">{u.name}</p>
                                            <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full
                                                ${u.role === 'Admin' ? 'bg-slate-800 text-white' : 
                                                  u.role === 'Mayor' ? 'bg-indigo-100 text-indigo-700' :
                                                  u.role === 'Ward Member' ? 'bg-emerald-100 text-emerald-700' :
                                                  u.role === 'Worker' ? 'bg-amber-100 text-amber-700' :
                                                  'bg-slate-200 text-slate-600'}`}>
                                                {u.role}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">{u.email}</p>
                                        <div className="text-xs text-slate-400 mt-1 flex gap-3">
                                            {u.wardNumber && <span>📍 {u.wardNumber}</span>}
                                            {u.specialization && <span>🔧 {u.specialization}</span>}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteUser(u._id)}
                                        className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition"
                                        title="Delete User"
                                        disabled={u.email === 'admin@sevasetu.gov'} // Prevent deleting main admin
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
