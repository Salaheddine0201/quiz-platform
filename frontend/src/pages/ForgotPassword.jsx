import React, { useState } from 'react';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logique d'envoi d'email
    };

    return (
        <div className="flex-grow flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 w-full max-w-md">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="bg-blue-50 p-3 rounded-full mb-4 text-blue-600">
                        <KeyRound className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Mot de passe oublié</h2>
                    <p className="text-sm text-slate-500 mt-2">
                        Entrez votre adresse email, nous vous enverrons un lien pour réinitialiser votre mot de passe.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Adresse email</label>
                        <input 
                            type="email" 
                            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="votre@email.fr"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition text-sm shadow-sm"
                    >
                        Envoyer le lien
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 font-medium">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        </div>
    );
}
