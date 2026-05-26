import React, { useState } from 'react';
import { Search, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import axios from 'axios';

const LandingPage = () => {
    const [trackingId, setTrackingId] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleTrack = async (e) => {
        e.preventDefault();
        try {
            setError('');
            const res = await axios.get(`http://localhost:5000/api/grievances/track/${trackingId}`);
            setResult(res.data);
        } catch (err) {
            setResult(null);
            setError('Grievance not found. Please check your tracking ID.');
        }
    };

    return (
        <div className="flex-grow flex flex-col items-center justify-center bg-slate-50 p-4">
            <div className="text-center max-w-2xl mx-auto mt-16 lg:mt-24">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
                    Civic solutions, <span className="text-emerald-500">simplified.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 mb-10">
                    Report issues in your neighborhood effortlessly. Track resolving progress in real-time.
                </p>

                <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row max-w-lg mx-auto mb-16">
                    <form className="flex-grow flex w-full" onSubmit={handleTrack}>
                        <div className="relative flex-grow flex items-center pl-4">
                            <Search className="w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Enter Tracking ID (e.g. SEVA-2026-ABCD)"
                                className="w-full py-3 pl-3 pr-4 text-slate-700 bg-transparent outline-none placeholder-slate-400"
                                value={trackingId}
                                onChange={(e) => setTrackingId(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-600 transition-colors flex items-center gap-2 m-1">
                            Track <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                </div>

                {error && <p className="text-red-500 font-medium mb-8">{error}</p>}
                {result && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-w-lg mx-auto text-left mb-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-semibold text-lg text-slate-800">{result.title}</h3>
                                <p className="text-sm text-slate-500">{result.category}</p>
                            </div>
                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${result.status === 'Solved' ? 'bg-emerald-100 text-emerald-700' :
                                result.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
                                }`}>
                                {result.status}
                            </span>
                        </div>

                        <div className="relative border-l-2 border-slate-200 ml-3 pl-6 space-y-6">
                            <div className="relative">
                                <div className="absolute -left-[31px] bg-sky-500 w-4 h-4 rounded-full border-4 border-white"></div>
                                <h4 className="text-sm font-semibold text-slate-800">Grievance Submitted</h4>
                                <p className="text-xs text-slate-500">{new Date(result.createdAt).toLocaleString()}</p>
                            </div>

                            <div className={`relative ${!result.inProgressAt ? 'opacity-50' : ''}`}>
                                <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-4 border-white ${result.inProgressAt ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                                <h4 className="text-sm font-semibold text-slate-800">In Progress</h4>
                                {result.inProgressAt ? (
                                    <p className="text-xs text-slate-500">{new Date(result.inProgressAt).toLocaleString()}</p>
                                ) : (
                                    <p className="text-xs text-slate-400">Awaiting assignment...</p>
                                )}
                            </div>

                            <div className={`relative ${!result.resolvedAt ? 'opacity-50' : ''}`}>
                                <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-4 border-white ${result.resolvedAt ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                <h4 className="text-sm font-semibold text-slate-800">Solved</h4>
                                {result.resolvedAt ? (
                                    <p className="text-xs text-slate-500">{new Date(result.resolvedAt).toLocaleString()}</p>
                                ) : (
                                    <p className="text-xs text-slate-400">Resolution pending</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full mt-10 p-8 pt-0">
                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex gap-4">
                    <div className="bg-sky-50 p-3 rounded-xl h-fit">
                        <Clock className="w-6 h-6 text-sky-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-2">Fast Resolution</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">Local officers are notified immediately. Track every step till completion.</p>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex gap-4">
                    <div className="bg-indigo-50 p-3 rounded-xl h-fit">
                        <ShieldCheck className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-2">Secure & Transparent</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">Built with trust in mind. Direct access to your local administration.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
