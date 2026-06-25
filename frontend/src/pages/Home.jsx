import React from 'react';
import { GraduationCap, User, LogIn, UserPlus, Settings, Clock, BarChart, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Sous-composant pour le principe DRY
const FeatureCard = ({ icon: Icon, title, description }) => (
  <Card className="border shadow-sm hover:shadow-md transition-shadow">
    <CardHeader>
      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription>{description}</CardDescription>
    </CardContent>
  </Card>
);

export default function Home() {
    const { user } = useAuth();

    const features = [
      {
        icon: Settings,
        title: "Gestion experte",
        description: "Création de quiz multicritères avec une flexibilité totale."
      },
      {
        icon: Clock,
        title: "Temps maîtrisé",
        description: "Contraintes temporelles précises pour chaque évaluation."
      },
      {
        icon: BarChart,
        title: "Analytique avancée",
        description: "Notation automatique et rapports de performance détaillés."
      },
      {
        icon: Zap,
        title: "Expérience fluide",
        description: "Interface étudiante intuitive favorisant la concentration."
      }
    ];

    return (
        <div className="flex-grow bg-background relative overflow-hidden">
            
            {/* Décoration d'arrière-plan avec motif et lumière */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    
                    {/* Hero Section */}
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                            L'excellence académique <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 block mt-2">réinventée.</span>
                        </h1>
                        <div className="space-y-4 max-w-2xl mx-auto">
                            <p className="text-xl text-muted-foreground">
                                Créez, gérez et automatisez vos évaluations avec une précision chirurgicale. Une interface pensée pour les enseignants exigeants.
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                            {!user ? (
                                <>
                                    <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                                        <Link to="/register">
                                            Accéder à la plateforme <UserPlus className="ml-2 h-5 w-5" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full shadow-sm hover:shadow-md transition-all">
                                        <Link to="/login">
                                            <LogIn className="mr-2 h-5 w-5" /> Se connecter
                                        </Link>
                                    </Button>
                                </>
                            ) : (
                                <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                                    <Link to={user.role === 'enseignant' ? "/teacher-dashboard" : "/student-dashboard"}>
                                        {user.role === 'enseignant' ? <GraduationCap className="mr-2 h-5 w-5" /> : <User className="mr-2 h-5 w-5" />}
                                        Aller à mon Espace
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
                        {features.map((feature, idx) => (
                            <FeatureCard key={idx} icon={feature.icon} title={feature.title} description={feature.description} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
