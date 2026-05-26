import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPin } from 'lucide-react';

const WorkerDashboard = ({ user }) => {
    const [grievances, setGrievances] = useState([]);

    useEffect(() => {
        fetchGrievances();
    }, []);

    const fetchGrievances = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/grievances/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGrievances(res.data);
        } catch (error) {
            console.error('Error fetching grievances:', error);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/grievances/${id}`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchGrievances();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm min-h-[500px]">
            <div className="mb-6 flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-slate-800">Assigned Tasks ({user.specialization})</h2>
                <p className="text-slate-500 text-sm">Manage issues assigned to you.</p>
            </div>

            <div className="grid gap-6">
                {grievances.map(g => (
                    <div key={g._id} className="border border-slate-200 rounded-xl p-5 hover:shadow-sm transition">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-semibold text-slate-900">{g.title}</h3>
                                <p className="text-sm text-slate-500">{g.category} - {g.trackingId}</p>
                            </div>
                            <select
                                className="text-sm border border-slate-200 rounded p-1 bg-white"
                                value={g.status}
                                onChange={(e) => handleStatusUpdate(g._id, e.target.value)}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Working on it">Working on it</option>
                                <option value="Solved">Solved</option>
                            </select>
                        </div>
                        <p className="text-sm text-slate-700 mb-4">{g.description}</p>
                        <p className="text-xs text-slate-500 mb-4">
                            Reported on: {new Date(g.createdAt).toLocaleString()}
                        </p>

                        {(g.location?.lat || g.location?.address) && (
                            <div className="text-xs text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <div className="flex items-center gap-2 font-semibold text-slate-700 mb-2">
                                    <MapPin className="w-4 h-4 text-rose-500" />
                                    Location to reach
                                </div>
                                <div className="text-slate-600 mb-3">
                                    {g.location.lat ? `${g.location.lat}, ${g.location.lng}` : g.location.address}
                                </div>
                                <div className="rounded-lg overflow-hidden border border-slate-200 shadow-sm relative w-full h-[180px]">
                                    <iframe
                                        title="Location Map"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        allowFullScreen
                                        src={`https://maps.google.com/maps?q=${g.location.lat ? `${g.location.lat},${g.location.lng}` : encodeURIComponent(g.location.address)}&z=15&output=embed`}
                                    ></iframe>
                                </div>
                            </div>
                        )}

                        {g.images && g.images.length > 0 && (
                            <div className="flex gap-2 mt-2">
                                {g.images.map((img, i) => (
                                    <a key={i} href={`http://localhost:5000${img}`} target="_blank" rel="noopener noreferrer">
                                        <img src={`http://localhost:5000${img}`} alt="Evidence" className="h-16 w-16 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-80 transition" />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {grievances.length === 0 && (
                <div className="text-center py-12 text-slate-500">No tasks assigned to you.</div>
            )}
        </div>
    );
};

export default WorkerDashboard;
