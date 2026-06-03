import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Tableau de bord</h2>
            {user ? (
                <div>
                    <p>Bienvenue sur PT58, <strong>{user.name}</strong> !</p>
                    <p>Email: {user.email}</p>
                </div>
            ) : (
                <p>Chargement des données utilisateur...</p>
            )}
            <button onClick={handleLogout} style={{ marginTop: '1rem', background: '#dc3545', color: 'white', padding: '0.5rem 1rem', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                Se déconnecter
            </button>
        </div>
    );
}
