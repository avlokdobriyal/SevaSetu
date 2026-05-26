import React from 'react';
import MayorDashboard from './MayorDashboard.jsx';
import WardMemberDashboard from './WardMemberDashboard.jsx';
import WorkerDashboard from './WorkerDashboard.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import CitizenDashboard from './CitizenDashboard.jsx';

const RoleDashboard = () => {
    const userString = localStorage.getItem('user');
    
    if (!userString) return <div>Loading...</div>;

    const user = JSON.parse(userString);

    switch(user.role) {
        case 'Mayor':
            return <MayorDashboard user={user} />;
        case 'Ward Member':
            return <WardMemberDashboard user={user} />;
        case 'Worker':
            return <WorkerDashboard user={user} />;
        case 'Admin':
            return <AdminDashboard user={user} />;
        case 'Citizen':
            return <CitizenDashboard user={user} />;
        default:
            return <div>Unknown Role</div>;
    }
};

export default RoleDashboard;
