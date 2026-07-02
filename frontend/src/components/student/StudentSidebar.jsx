import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, History, LogOut, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function StudentSidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <aside className="dark w-64 flex-shrink-0 flex flex-col h-screen sticky top-0 bg-sidebar text-sidebar-foreground">
            {/* Logo area */}
            <Link to="/" className="h-16 flex items-center px-6 gap-3 pt-6 pb-4 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center text-sidebar-primary-foreground font-bold shrink-0">
                    <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="font-bold text-base leading-tight">Portail Scolaire</h1>
                    <p className="text-xs text-sidebar-foreground/70">Espace Étudiant</p>
                </div>
            </Link>

            {/* Menu */}
            <div className="px-4 mt-8 flex-1">
                <p className="text-xs font-semibold text-sidebar-foreground/50 mb-4 px-2 uppercase tracking-wider">Menu</p>
                <nav className="flex flex-col gap-1">
                    <NavLink
                        to="/student-dashboard"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            }`
                        }
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Tableau de bord
                    </NavLink>
                    <NavLink
                        to="/student/results"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            }`
                        }
                    >
                        <History className="w-4 h-4" />
                        Mes résultats
                    </NavLink>
                </nav>
            </div>

            {/* User Area */}
            <div className="p-4 border-t border-sidebar-border flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0">
                        {user?.name?.charAt(0)?.toUpperCase() || 'E'}
                    </div>
                    <div className="truncate">
                        <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name || 'Étudiant'}</p>
                        <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email || 'etudiant@ecole.fr'}</p>
                    </div>
                </div>
                <button 
                    onClick={handleLogout}
                    className="p-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors shrink-0"
                    title="Déconnexion"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        </aside>
    );
}
