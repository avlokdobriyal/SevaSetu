import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            setError('');
            // By default, registration from the public page sets role to 'Citizen'
            const res = await axios.post('http://localhost:5000/api/auth/register', {
                ...formData,
                role: 'Citizen'
            });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));
            window.dispatchEvent(new Event('auth-change'));

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register');
        }
    };

    return (
        <div className="flex-grow flex items-center justify-center bg-slate-50 p-4 py-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Account</h2>
                <p className="text-slate-500 mb-8">Join SevaSetu to report and track issues.</p>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm">{error}</div>}

                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                        <input
                            type="text"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                        <input
                            type="password"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-xl shadow-sm transition-colors mt-4">
                        Create Account
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-500">
                    Already have an account? <Link to="/login" className="text-emerald-600 font-medium hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
