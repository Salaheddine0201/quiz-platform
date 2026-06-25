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
        <div className="flex-grow bg-background">
            <div className="container mx-auto px-4 py-16 md:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Hero Section */}
                    <div className="space-y-8">
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                            L'excellence académique <span className="text-primary block">réinventée.</span>
                        </h1>
                        <div className="space-y-4">
                            <p className="text-lg text-muted-foreground border-l-4 border-primary pl-4 py-1">
                                Créez, gérez et automatisez vos évaluations avec une précision chirurgicale. Une interface pensée pour les enseignants exigeants.
                            </p>
                            <p className="text-base text-muted-foreground border-l-4 border-muted pl-4 py-1">
                                Offrez à vos étudiants une expérience d'apprentissage interactive, intuitive et moderne, propulsée par des technologies de pointe.
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            {!user ? (
                                <>
                                    <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8">
                                        <Link to="/register">
                                            Accéder à la plateforme <UserPlus className="ml-2 h-5 w-5" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8">
                                        <Link to="/login">
                                            <LogIn className="mr-2 h-5 w-5" /> Se connecter
                                        </Link>
                                    </Button>
                                </>
                            ) : (
                                <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8">
                                    <Link to={user.role === 'enseignant' ? "/teacher-dashboard" : "/student-dashboard"}>
                                        {user.role === 'enseignant' ? <GraduationCap className="mr-2 h-5 w-5" /> : <User className="mr-2 h-5 w-5" />}
                                        Aller à mon Espace
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {features.map((feature, idx) => (
                            <FeatureCard key={idx} icon={feature.icon} title={feature.title} description={feature.description} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
