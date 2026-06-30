import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Construction } from 'lucide-react';

export default function TeacherPlaceholder({ title = 'Bientôt disponible' }) {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center text-center py-24 animate-in fade-in duration-500">
            <div className="p-4 bg-primary/10 rounded-2xl mb-6">
                <Construction className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground max-w-md mt-2">
                Cette section est en cours de construction et sera disponible prochainement.
            </p>
            <Button variant="outline" className="mt-6" onClick={() => navigate('/teacher/dashboard')}>
                Retour au tableau de bord
            </Button>
        </div>
    );
}
