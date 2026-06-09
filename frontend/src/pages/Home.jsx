import React from 'react';
import { GraduationCap, User, LogIn, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { user } = useAuth();

    return (
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                L'apprentissage rendu <span className="text-blue-600">simple</span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-2xl">
                Une plateforme épurée et moderne pour créer et passer des quiz. Conçue pour les enseignants et les étudiants.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
                {!user && (
                    <>
                        <Link to="/login" className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition shadow-sm">
                            <LogIn className="h-5 w-5" />
                            <span>Connexion</span>
                        </Link>
                        <Link to="/register" className="flex items-center justify-center space-x-2 bg-white text-slate-900 border border-slate-200 px-6 py-3 rounded-md font-medium hover:bg-slate-50 transition shadow-sm">
                            <UserPlus className="h-5 w-5" />
                            <span>Inscription</span>
                        </Link>
                    </>
                )}

                {user?.role === 'enseignant' && (
                    <Link to="/teacher-dashboard" className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition shadow-sm">
                        <GraduationCap className="h-5 w-5" />
                        <span>Espace Enseignant</span>
                    </Link>
                )}

                {user?.role === 'etudiant' && (
                    <Link to="/student-dashboard" className="flex items-center justify-center space-x-2 bg-white text-slate-900 border border-slate-200 px-6 py-3 rounded-md font-medium hover:bg-slate-50 transition shadow-sm">
                        <User className="h-5 w-5" />
                        <span>Espace Étudiant</span>
                    </Link>
                )}
            </div>
        </div>
    );
}
