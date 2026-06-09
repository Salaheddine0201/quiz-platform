import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function TeacherDashboard() {
    const { user } = useAuth();

    return (
        <div className="flex-grow flex items-center justify-center p-6 text-center">
            <h1 className="text-2xl font-semibold text-slate-800">
                Bienvenue {user?.name} dans l'espace enseignant
            </h1>
        </div>
    );
}
