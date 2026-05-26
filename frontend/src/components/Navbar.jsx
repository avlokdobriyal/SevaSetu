import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        const handleAuthChange = () => setToken(localStorage.getItem('token'));
        window.addEventListener('auth-change', handleAuthChange);
        return () => window.removeEventListener('auth-change', handleAuthChange);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        navigate('/');
    };

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2">
                            <Leaf className="h-6 w-6 text-emerald-500" />
                            <span className="text-xl font-bold text-slate-800">SevaSetu</span>
                        </Link>
                        <Link to="/ratings" className="text-sm font-medium text-slate-600 hover:text-emerald-600">Ward Ratings</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {token ? (
                            <>
                                <Link to="/file" className="text-sm font-medium text-slate-600 hover:text-emerald-600">File Grievance</Link>
                                <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-emerald-600">Dashboard</Link>
                                <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Log out</button>
                            </>
                        ) : (
                            <Link to="/login" className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition">
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
