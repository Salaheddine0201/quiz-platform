import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, token, loading } = useAuth();

    if (loading) {
        return <div style={{ padding: '2rem' }}>Chargement en cours...</div>;
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirection vers le tableau de bord approprié selon le rôle
        if (user.role === 'enseignant') {
            return <Navigate to="/teacher-dashboard" replace />;
        }
        return <Navigate to="/student-dashboard" replace />;
    }

    return children;
}
