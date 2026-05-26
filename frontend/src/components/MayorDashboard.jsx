import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

const MayorDashboard = ({ user }) => {
    const [stats, setStats] = useState({ total: 0, pending: 0, working: 0, solved: 0 });
    const [wardMembers, setWardMembers] = useState([]);
    const [allGrievances, setAllGrievances] = useState([]);
    const [filter, setFilter] = useState('All');

    // Form state for creating a ward member
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phoneNumber: '', wardNumber: ''
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
            const fetchedGrievances = resG.data;

            let p = 0, w = 0, s = 0;
            fetchedGrievances.forEach(g => {
                if (g.status === 'Pending') p++;
                else if (g.status === 'Working on it') w++;
                else if (g.status === 'Solved') s++;
            });
            setStats({ total: fetchedGrievances.length, pending: p, working: w, solved: s });
            setAllGrievances(fetchedGrievances);

            // 2. Fetch Ward Members
            const resM = await axios.get('http://localhost:5000/api/users/wardmembers', { headers });
            setWardMembers(resM.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleCreateMember = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            // Adding role field so the generic manage endpoint understands it's intended for Ward Member creation
            await axios.post('http://localhost:5000/api/users/manage',
                { ...formData, role: 'Ward Member' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Ward Member created successfully!');
            setFormData({ name: '', email: '', password: '', phoneNumber: '', wardNumber: '' });
            fetchData(); // Refresh list
        } catch (err) {
            console.error(err);
            alert('Error creating Ward Member. E.g. Email or Ward may already exist.');
        }
    };

    const handleDeleteMember = async (id) => {
        if (!window.confirm("Are you sure you want to remove this Ward Member?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Ward Member deleted.');
            fetchData(); // Refresh list
        } catch (err) {
            console.error(err);
            alert('Error deleting Ward Member.');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">City Overview & Management (Mayor)</h2>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div onClick={() => setFilter('All')} className={`bg-white p-6 rounded-2xl border ${filter === 'All' ? 'border-slate-800 ring-2 ring-slate-200' : 'border-slate-200'} shadow-sm text-center cursor-pointer hover:shadow-md transition`}>
                    <p className="text-slate-500 text-sm mb-1">Total Reported</p>
                    <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
                </div>
                <div onClick={() => setFilter('Pending')} className={`bg-white p-6 rounded-2xl border ${filter === 'Pending' ? 'border-amber-500 ring-2 ring-amber-200' : 'border-amber-100'} shadow-sm text-center cursor-pointer hover:shadow-md transition`}>
                    <p className="text-amber-600 text-sm mb-1">Pending</p>
                    <p className="text-3xl font-bold text-amber-700">{stats.pending}</p>
                </div>
                <div onClick={() => setFilter('Working on it')} className={`bg-white p-6 rounded-2xl border ${filter === 'Working on it' ? 'border-sky-500 ring-2 ring-sky-200' : 'border-sky-100'} shadow-sm text-center cursor-pointer hover:shadow-md transition`}>
                    <p className="text-sky-600 text-sm mb-1">In Progress</p>
                    <p className="text-3xl font-bold text-sky-700">{stats.working}</p>
                </div>
                <div onClick={() => setFilter('Solved')} className={`bg-white p-6 rounded-2xl border ${filter === 'Solved' ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-emerald-100'} shadow-sm text-center cursor-pointer hover:shadow-md transition`}>
                    <p className="text-emerald-600 text-sm mb-1">Solved</p>
                    <p className="text-3xl font-bold text-emerald-700">{stats.solved}</p>
                </div>
            </div>

            {/* List of Filtered Grievances */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mt-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 text-left">Grievances ({filter})</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="py-3 px-4 text-sm font-semibold text-slate-600">ID</th>
                                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Issue</th>
                                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Ward</th>
                                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
                                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allGrievances.filter(g => filter === 'All' ? true : g.status === filter).map(g => (
                                <tr key={g._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                                    <td className="py-4 px-4 text-sm font-medium text-slate-700">{g.trackingId}</td>
                                    <td className="py-4 px-4 text-sm text-slate-700">{g.title} <span className="block text-xs text-slate-400">{g.category}</span></td>
                                    <td className="py-4 px-4 text-sm text-slate-600">{g.ward}</td>
                                    <td className="py-4 px-4">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${g.status === 'Solved' ? 'bg-emerald-100 text-emerald-700' : g.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>
                                            {g.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-slate-500">{new Date(g.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {allGrievances.filter(g => filter === 'All' ? true : g.status === filter).length === 0 && (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-slate-500 text-sm">No grievances found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Form to Add Ward Member */}
                <div className="md:col-span-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Add Ward Member</h3>
                    <form onSubmit={handleCreateMember} className="space-y-4">
                        <input type="text" placeholder="Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-lg p-3 bg-slate-50 outline-none focus:border-emerald-500" />
                        <input type="email" placeholder="Email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full border rounded-lg p-3 bg-slate-50 outline-none focus:border-emerald-500" />
                        <input type="text" placeholder="Phone Number" required value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} className="w-full border rounded-lg p-3 bg-slate-50 outline-none focus:border-emerald-500" />
                        <input type="text" placeholder="Ward Number (must be unique)" required value={formData.wardNumber} onChange={e => setFormData({ ...formData, wardNumber: e.target.value })} className="w-full border rounded-lg p-3 bg-slate-50 outline-none focus:border-emerald-500" />
                        <input type="password" placeholder="Temporary Password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full border rounded-lg p-3 bg-slate-50 outline-none focus:border-emerald-500" />

                        <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium p-3 rounded-lg transition-colors">Create Member</button>
                    </form>
                </div>

                {/* List of existing Ward Members */}
                <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Existing Ward Members</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {wardMembers.map(m => (
                            <div key={m._id} className="relative border border-slate-100 bg-slate-50 rounded-xl p-4 hover:shadow-sm transition group">
                                <p className="font-semibold text-slate-800">{m.name}</p>
                                <p className="text-sm text-slate-500">{m.email}</p>
                                <p className="text-sm text-emerald-600 font-medium my-1">📍 {m.wardNumber}</p>
                                <p className="text-xs text-slate-400">{m.phoneNumber}</p>

                                <button
                                    onClick={() => handleDeleteMember(m._id)}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                                    title="Remove Ward Member"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        {wardMembers.length === 0 && <p className="text-slate-500 text-sm">No ward members found. Add one to get started.</p>}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MayorDashboard;
