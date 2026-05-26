import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import GrievanceForm from './components/GrievanceForm';
import RoleDashboard from './components/RoleDashboard';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import RatingPage from './components/RatingPage.jsx';

const App = () => {
    return (
        <BrowserRouter>
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow flex flex-col">
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/file" element={<GrievanceForm />} />
                        <Route path="/ratings" element={<RatingPage />} />
                        <Route path="/dashboard" element={
                            <DashboardLayout>
                                <RoleDashboard />
                            </DashboardLayout>
                        } />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
};

export default App;
