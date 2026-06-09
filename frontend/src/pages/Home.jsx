import React from 'react';
import { GraduationCap, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                L'apprentissage rendu <span className="text-blue-600">simple</span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-2xl">
                Une plateforme épurée et moderne pour créer et passer des quiz. Conçue pour les enseignants et les étudiants.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login?role=enseignant" className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition shadow-sm">
                    <GraduationCap className="h-5 w-5" />
                    <span>Espace Enseignant</span>
                </Link>
                <Link to="/login?role=etudiant" className="flex items-center justify-center space-x-2 bg-white text-slate-900 border border-slate-200 px-6 py-3 rounded-md font-medium hover:bg-slate-50 transition shadow-sm">
                    <User className="h-5 w-5" />
                    <span>Espace Étudiant</span>
                </Link>
            </div>
        </div>
    );
}
