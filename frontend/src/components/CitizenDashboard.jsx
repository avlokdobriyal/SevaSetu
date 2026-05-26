import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Star } from 'lucide-react';

const CitizenDashboard = ({ user }) => {
    const [grievances, setGrievances] = useState([]);

    useEffect(() => {
        fetchGrievances();
    }, []);

    const fetchGrievances = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/grievances/my', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGrievances(res.data);
        } catch (error) {
            console.error('Error fetching grievances:', error);
        }
    };

    const handleRate = async (grievanceId, rating) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/ratings/rate/${grievanceId}`, { rating }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchGrievances();
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('Could not submit rating.');
        }
    };

    const RatingStars = ({ g }) => {
        if (g.status !== 'Solved') return null;
        if (g.isRated) {
            return (
                <div className="flex gap-1 mt-2 items-center">
                    {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-4 h-4 ${star <= g.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                    <span className="text-xs text-slate-400 ml-1">Rated</span>
                </div>
            );
        }
        return (
            <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star
                        key={star}
                        className="w-5 h-5 text-slate-300 hover:text-amber-400 hover:fill-amber-400 cursor-pointer transition"
                        onClick={() => handleRate(g._id, star)}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm min-h-[500px]">
            <div className="mb-6 flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-slate-800">Your Complaints</h2>
                <p className="text-slate-500 text-sm">Track and manage your submitted issues.</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="py-3 px-4 text-sm font-semibold text-slate-600">Tracking ID</th>
                            <th className="py-3 px-4 text-sm font-semibold text-slate-600">Issue</th>
                            <th className="py-3 px-4 text-sm font-semibold text-slate-600">Date</th>
                            <th className="py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {grievances.map(g => (
                            <tr key={g._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                                <td className="py-4 px-4 text-sm font-medium text-slate-700">{g.trackingId}</td>
                                <td className="py-4 px-4 text-sm text-slate-700">{g.title} <span className="text-xs text-slate-400 block">{g.category}</span></td>
                                <td className="py-4 px-4 text-sm text-slate-500">{new Date(g.createdAt).toLocaleDateString()}</td>
                                <td className="py-4 px-4">
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${g.status === 'Solved' ? 'bg-emerald-100 text-emerald-700' :
                                        g.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
                                        }`}>
                                        {g.status}
                                    </span>
                                    <RatingStars g={g} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {grievances.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-slate-500">No grievances found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CitizenDashboard;
