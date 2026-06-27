import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';

export default function StudentLayout() {
    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans">
            <StudentSidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
