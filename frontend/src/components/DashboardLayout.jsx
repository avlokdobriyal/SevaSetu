import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    if (!user) return null;

    return (
        <div className="flex-grow flex bg-slate-50 p-4 md:p-8">
            <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm sticky top-24">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xl uppercase">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800">{user.name}</h3>
                                <p className="text-sm text-slate-500">{user.role}</p>
                            </div>
                        </div>
                        <nav className="space-y-2">
                            <a href="#" className="block px-4 py-2 bg-emerald-50 text-emerald-700 font-medium rounded-lg">
                                {user.role === 'Citizen' ? 'My Grievances' : 'Dashboard'}
                            </a>
                            <a href="#" className="block px-4 py-2 text-slate-600 hover:bg-slate-50 font-medium rounded-lg">Settings</a>
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-grow">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
