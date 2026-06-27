import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('auth_token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            api.get('/user')
                .then(response => {
                    setUser(response.data);
                })
                .catch(() => {
                    setToken(null);
                    setUser(null);
                    localStorage.removeItem('auth_token');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (credentials) => {
        const response = await api.post('/login', credentials);
        setToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem('auth_token', response.data.token);
        return response.data.user;
    };

    const register = async (data) => {
        const response = await api.post('/register', data);
        setToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem('auth_token', response.data.token);
        return response.data.user;
    };

    const logout = async () => {
        try {
            if (token) {
                await api.post('/logout');
            }
        } catch (e) {
            console.error('Erreur lors de la déconnexion', e);
        } finally {
            setToken(null);
            setUser(null);
            localStorage.removeItem('auth_token');
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
