import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';

const RatingPage = () => {
    const [wards, setWards] = useState([]);
    const [expandedWard, setExpandedWard] = useState(null);
    const [wardWorkers, setWardWorkers] = useState({});

    useEffect(() => {
        const fetchWards = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/ratings/wards');
                setWards(res.data);
            } catch (err) {
                console.error('Error fetching wards:', err);
            }
        };
        fetchWards();
    }, []);

    const fetchWorkers = async (wardNumber) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/ratings/ward/${wardNumber}/workers`);
            setWardWorkers(prev => ({ ...prev, [wardNumber]: res.data }));
        } catch (err) {
            console.error('Error fetching workers:', err);
        }
    };

    const toggleWard = (wardNumber) => {
        if (expandedWard === wardNumber) {
            setExpandedWard(null);
        } else {
            setExpandedWard(wardNumber);
            if (!wardWorkers[wardNumber]) {
                fetchWorkers(wardNumber);
            }
        }
    };

    const renderStars = (rating) => {
        const r = Math.round(rating);
        return (
            <div className="flex gap-1 items-center">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className={`w-4 h-4 ${star <= r ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-4 py-12">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold text-slate-800 mb-4">Ward Ratings</h1>
                <p className="text-slate-600">See how each ward and their workers are performing based on citizen feedback.</p>
            </div>

            <div className="space-y-4">
                {wards.map((ward) => (
                    <div key={ward._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div 
                            className="p-6 cursor-pointer hover:bg-slate-50 transition flex justify-between items-center"
                            onClick={() => toggleWard(ward.wardNumber)}
                        >
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                                    {ward.wardNumber} 
                                    <span className="text-sm font-normal text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                        Member: {ward.name}
                                    </span>
                                </h2>
                                <div className="mt-2 flex items-center gap-3">
                                    {renderStars(ward.averageRating)}
                                    <span className="text-sm font-medium text-slate-700">{ward.averageRating || 0} / 5</span>
                                    <span className="text-xs text-slate-400">({ward.ratingCount} reviews)</span>
                                </div>
                            </div>
                            <div className="text-slate-400">
                                {expandedWard === ward.wardNumber ? <ChevronUp /> : <ChevronDown />}
                            </div>
                        </div>

                        {expandedWard === ward.wardNumber && (
                            <div className="bg-slate-50 p-6 border-t border-slate-100">
                                <h3 className="text-sm font-semibold text-slate-600 mb-4 uppercase tracking-wider">Worker Performance</h3>
                                {!wardWorkers[ward.wardNumber] ? (
                                    <p className="text-sm text-slate-500">Loading workers...</p>
                                ) : wardWorkers[ward.wardNumber].length === 0 ? (
                                    <p className="text-sm text-slate-500">No workers assigned to this ward.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {wardWorkers[ward.wardNumber].map(worker => (
                                            <div key={worker._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold text-slate-800">{worker.name}</p>
                                                    <p className="text-xs text-slate-500 mb-2">{worker.specialization}</p>
                                                    <div className="flex items-center gap-2">
                                                        {renderStars(worker.averageRating)}
                                                        <span className="text-xs font-medium text-slate-600">{worker.averageRating || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {wards.length === 0 && (
                    <div className="text-center py-12 text-slate-500">No wards data available.</div>
                )}
            </div>
        </div>
    );
};

export default RatingPage;
