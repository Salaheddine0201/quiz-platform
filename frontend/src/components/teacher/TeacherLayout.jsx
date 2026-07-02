import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, BarChart3, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import TeacherSidebar from './TeacherSidebar';

export default function TeacherLayout() {
    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans">
            <TeacherSidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}