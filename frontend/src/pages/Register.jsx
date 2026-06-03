import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== passwordConfirmation) {
            return setError('Les mots de passe ne correspondent pas.');
        }
        try {
            await register({ name, email, password, password_confirmation: passwordConfirmation });
            navigate('/dashboard');
        } catch (err) {
            setError("Erreur lors de l'inscription. L'email est peut-être déjà utilisé.");
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
            <h2>Inscription</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="text" placeholder="Nom" value={name} onChange={e => setName(e.target.value)} required />
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />
                <input type="password" placeholder="Confirmer le mot de passe" value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} required />
                <button type="submit">S'inscrire</button>
            </form>
            <p>Déjà un compte ? <Link to="/login">Se connecter</Link></p>
        </div>
    );
}
