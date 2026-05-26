import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

const WardMemberDashboard = ({ user }) => {
    const [grievances, setGrievances] = useState([]);
    const [workers, setWorkers] = useState([]);
    
    // Form state for creating a worker
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phoneNumber: '', specialization: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            const resG = await axios.get('http://localhost:5000/api/grievances/dashboard', { headers });
            setGrievances(resG.data);

            const resW = await axios.get('http://localhost:5000/api/users/workers', { headers });
            setWorkers(resW.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleAssignWorker = async (grievanceId, workerId) => {
        if (!workerId) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/grievances/${grievanceId}`, { assignedWorker: workerId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (error) {
            console.error('Error assigning worker:', error);
        }
    };

    const handleCreateWorker = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/users/manage', 
            { ...formData, role: 'Worker' }, 
            { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Worker created successfully!');
            setFormData({ name: '', email: '', password: '', phoneNumber: '', specialization: '' });
            fetchData(); // Refresh list
        } catch (err) {
            console.error(err);
            alert('Error creating Worker.');
        }
    };

    const handleDeleteWorker = async (id) => {
        if (!window.confirm("Are you sure you want to remove this Worker?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Worker deleted.');
            fetchData(); // Refresh list
        } catch (err) {
            console.error(err);
            alert('Error deleting Worker.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="mb-6 flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-slate-800">Ward {user.wardNumber} Dashboard</h2>
                    <p className="text-slate-500 text-sm">Assign grievances and manage your ward's ground staff.</p>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Issue</th>
                                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Location</th>
                                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
                                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Assign Work</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grievances.map(g => (
                                <tr key={g._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                                    <td className="py-4 px-4 text-sm">
                                        <p className="font-medium text-slate-700">{g.title}</p>
                                        <p className="text-xs text-slate-500">{g.category}</p>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-slate-500">
                                        {g.location?.lat ? `${g.location.lat.toFixed(3)}, ${g.location.lng.toFixed(3)}` : g.location?.address || 'N/A'}
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${g.status === 'Solved' ? 'bg-emerald-100 text-emerald-700' :
                                                g.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
                                            }`}>
                                            {g.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <select 
                                            className="text-sm border border-slate-200 rounded-lg p-2 bg-slate-50"
                                            value={g.assignedWorker?._id || ''}
                                            onChange={(e) => handleAssignWorker(g._id, e.target.value)}
                                            disabled={g.status === 'Solved'}
                                        >
                                            <option value="">Assign Worker...</option>
                                            {/* Filtering workers by category of grievance to make it easier for ward members */}
                                            {workers.filter(w => w.specialization === g.category).map(w => (
                                                <option key={w._id} value={w._id}>⭐ {w.name} ({w.specialization})</option>
                                            ))}
                                            {workers.filter(w => w.specialization !== g.category).map(w => (
                                                <option key={w._id} value={w._id}>{w.name} ({w.specialization})</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Form to Add Worker */}
                <div className="md:col-span-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Add Ground Worker</h3>
                    <form onSubmit={handleCreateWorker} className="space-y-4">
                        <input type="text" placeholder="Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-3 bg-slate-50 outline-none focus:border-emerald-500" />
                        <input type="email" placeholder="Email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border rounded-lg p-3 bg-slate-50 outline-none focus:border-emerald-500" />
                        <input type="text" placeholder="Phone Number" required value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="w-full border rounded-lg p-3 bg-slate-50 outline-none focus:border-emerald-500" />
                        
                        <select required value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} className="w-full border rounded-lg p-3 bg-slate-50 outline-none focus:border-emerald-500">
                            <option value="">Select Specialization</option>
                            <option value="Electricity">Electricity</option>
                            <option value="Sanitation">Sanitation</option>
                            <option value="Road/Pothole">Road/Pothole</option>
                            <option value="Water Supply">Water Supply</option>
                            <option value="Other">Other</option>
                        </select>

                        <input type="password" placeholder="Temporary Password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border rounded-lg p-3 bg-slate-50 outline-none focus:border-emerald-500" />
                        
                        <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium p-3 rounded-lg transition-colors">Create Worker</button>
                    </form>
                </div>

                {/* List of existing Workers */}
                <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Ward Staff Team</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {workers.map(w => (
                            <div key={w._id} className="relative border border-slate-100 bg-slate-50 rounded-xl p-4 hover:shadow-sm transition group">
                                <p className="font-semibold text-slate-800">{w.name}</p>
                                <p className="text-sm text-slate-500">{w.email}</p>
                                <p className="text-sm text-emerald-600 font-medium my-1">🔧 {w.specialization}</p>
                                <p className="text-xs text-slate-400">{w.phoneNumber}</p>
                                
                                <button 
                                    onClick={() => handleDeleteWorker(w._id)}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                                    title="Remove Worker"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        {workers.length === 0 && <p className="text-slate-500 text-sm">No ground workers found. Add some to assign tasks.</p>}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WardMemberDashboard;
