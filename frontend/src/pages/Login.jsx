import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [searchParams] = useSearchParams();
    const defaultRole = searchParams.get('role') === 'enseignant' ? 'enseignant' : 'etudiant';
    
    const [role, setRole] = useState(defaultRole);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const { login, user } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login({ email, password });
        } catch (err) {
            setError('Identifiants incorrects.');
        }
    };

    useEffect(() => {
        if (user) {
            if (user.role === 'enseignant') {
                navigate('/teacher-dashboard');
            } else {
                navigate('/student-dashboard');
            }
        }
    }, [user, navigate]);

    const isTeacher = role === 'enseignant';

    return (
        <div className="flex-grow flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Bienvenue</h2>
                    <p className="text-sm text-slate-500 mt-2">Connectez-vous pour accéder à votre espace</p>
                </div>

                <div className="flex p-1 bg-slate-100 rounded-lg mb-6">
                    <button 
                        type="button"
                        onClick={() => setRole('enseignant')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${isTeacher ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        Enseignant
                    </button>
                    <button 
                        type="button"
                        onClick={() => setRole('etudiant')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${!isTeacher ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        Étudiant
                    </button>
                </div>

                {error && <div className="mb-4 text-sm text-red-600 text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Adresse email</label>
                        <input 
                            type="email" 
                            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="prof@ecole.fr"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-slate-700">Mot de passe</label>
                            <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">Mot de passe oublié ?</Link>
                        </div>
                        <input 
                            type="password" 
                            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition text-sm shadow-sm"
                    >
                        Se connecter en tant qu'{isTeacher ? 'enseignant' : 'étudiant'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    Vous n'avez pas de compte ? <Link to={`/register?role=${role}`} className="text-blue-600 hover:underline font-medium">S'inscrire</Link>
                </div>
            </div>
        </div>
    );
}
