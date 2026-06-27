import React from 'react';
import { User, LogOut, UserCircle } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';

export default function Layout() {
    const { user, logout } = useAuth();

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center space-x-2.5 group">
                            <img src="/logo.png" alt="QuizMaster" className="h-9 w-9 rounded-xl group-hover:scale-105 transition-transform duration-300" />
                            <span className="font-bold text-xl text-foreground tracking-tight">QuizMaster</span>
                        </Link>
                        <div className="flex items-center">
                            {user ? (
                                <div className="flex items-center space-x-3">
                                    <Link to="/profile" className="text-muted-foreground hover:text-primary transition-colors" title="Profil">
                                        <UserCircle className="h-6 w-6" />
                                    </Link>
                                    <Button onClick={logout} variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer">
                                        <LogOut className="h-4 w-4 mr-1.5" />
                                        Déconnexion
                                    </Button>
                                </div>
                            ) : (
                                <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                                    <Link to="/login" className="inline-flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Connexion
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex flex-col w-full">
                <Outlet />
            </main>

            <footer className="bg-muted/30 border-t border-border py-8">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                        <img src="/logo.png" alt="QuizMaster" className="h-7 w-7 rounded-lg" />
                        <span className="font-semibold text-sm text-foreground">QuizMaster</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © 2026 QuizMaster. Tous droits réservés.
                    </p>
                </div>
            </footer>
        </div>
    );
}
