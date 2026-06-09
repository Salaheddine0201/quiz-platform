import React from 'react';
import { BookOpen, User, LogOut, UserCircle } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
    const { user, logout } = useAuth();

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="bg-blue-50 p-1.5 rounded-md">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="font-bold text-xl text-slate-900">QuizMaster</span>
                        </Link>
                        <div className="flex items-center">
                            {user ? (
                                <div className="flex items-center space-x-5">
                                    <Link to="/profile" className="text-slate-500 hover:text-blue-600 transition" title="Profil">
                                        <UserCircle className="h-6 w-6" />
                                    </Link>
                                    <button onClick={logout} className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 font-medium transition cursor-pointer">
                                        <LogOut className="h-4 w-4" />
                                        <span>Déconnexion</span>
                                    </button>
                                </div>
                            ) : (
                                <Link to="/login" className="flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-900 font-medium transition">
                                    <User className="h-4 w-4" />
                                    <span>Connexion</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex flex-col w-full">
                <Outlet />
            </main>

            <footer className="bg-white border-t border-slate-200 py-6">
                <p className="text-center text-sm text-slate-500">
                    © 2026 QuizMaster. Tous droits réservés.
                </p>
            </footer>
        </div>
    );
}
