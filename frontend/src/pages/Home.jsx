import React from 'react';
import { GraduationCap, User, LogIn, UserPlus, Settings, Clock, BarChart, Zap, ArrowRight, CheckCircle2, BookOpen, Users, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Sous-composant DRY pour les cartes de fonctionnalités
const FeatureCard = ({ icon: Icon, title, description }) => (
  <Card className="group border bg-card/80 backdrop-blur-sm hover:shadow-xl hover:border-primary/30 transition-all duration-500 hover:-translate-y-2">
    <CardHeader>
      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
        <Icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors duration-500" />
      </div>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription className="leading-relaxed">{description}</CardDescription>
    </CardContent>
  </Card>
);

// Sous-composant DRY pour les étapes du workflow
const StepCard = ({ number, title, description }) => (
  <div className="flex flex-col items-center text-center space-y-4 group">
    <div className="relative">
      <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
        {number}
      </div>
      <div className="absolute -inset-2 rounded-full bg-primary/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
    <h3 className="text-lg font-bold text-foreground">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">{description}</p>
  </div>
);

// Sous-composant DRY pour les statistiques
const StatItem = ({ value, label }) => (
  <div className="text-center space-y-1">
    <p className="text-4xl font-extrabold text-primary">{value}</p>
    <p className="text-sm text-muted-foreground font-medium">{label}</p>
  </div>
);

export default function Home() {
    const { user } = useAuth();

    const features = [
      { icon: Settings, title: "Gestion experte", description: "Créez des quiz multicritères avec une flexibilité totale : QCM, vrai/faux, questions ouvertes." },
      { icon: Clock, title: "Temps maîtrisé", description: "Définissez des contraintes temporelles précises pour chaque évaluation et chaque question." },
      { icon: BarChart, title: "Analytique avancée", description: "Notation automatique instantanée et rapports de performance détaillés par étudiant." },
      { icon: Zap, title: "Expérience fluide", description: "Interface étudiante intuitive et responsive favorisant la concentration et l'engagement." },
      { icon: Shield, title: "Sécurité renforcée", description: "Authentification sécurisée et contrôle d'accès basé sur les rôles pour protéger vos données." },
      { icon: Users, title: "Collaboration", description: "Gérez vos classes, suivez la progression de vos étudiants et communiquez efficacement." },
    ];

    const steps = [
      { number: "1", title: "Créez votre compte", description: "Inscrivez-vous en quelques secondes en tant qu'enseignant ou étudiant." },
      { number: "2", title: "Concevez vos quiz", description: "Utilisez notre éditeur intuitif pour créer des évaluations sur mesure." },
      { number: "3", title: "Analysez les résultats", description: "Consultez les performances en temps réel et exportez vos rapports." },
    ];

    return (
        <div className="flex-grow bg-background relative overflow-hidden">
            
            {/* ===== HERO SECTION ===== */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                {/* Décorations d'arrière-plan */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="container mx-auto px-4 py-20 relative z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-10">
                        
                        {/* Badge */}
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
                                <BookOpen className="h-4 w-4" /> Plateforme d'évaluation nouvelle génération
                            </span>
                        </div>

                        {/* Titre */}
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150 fill-mode-both">
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.08]">
                                L'excellence
                                <br />
                                académique{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-secondary">
                                    réinventée.
                                </span>
                            </h1>
                        </div>

                        {/* Sous-titre */}
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both">
                            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
                                Créez, gérez et automatisez vos évaluations avec une précision chirurgicale. Une interface pensée pour les enseignants exigeants.
                            </p>
                        </div>
                        
                        {/* Boutons CTA */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-both">
                            {!user ? (
                                <>
                                    <Button asChild size="lg" className="h-13 px-10 text-base rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                                        <Link to="/register" className="inline-flex items-center gap-2">
                                            Commencer gratuitement <ArrowRight className="h-4 w-4 shrink-0" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="lg" className="h-13 px-10 text-base rounded-full hover:bg-accent transition-all">
                                        <Link to="/login" className="inline-flex items-center gap-2">
                                            <LogIn className="h-4 w-4 shrink-0" /> Se connecter
                                        </Link>
                                    </Button>
                                </>
                            ) : (
                                <Button asChild size="lg" className="h-13 px-10 text-base rounded-full shadow-lg shadow-primary/25 hover:shadow-xl transition-all hover:-translate-y-1">
                                    <Link to={user.role === 'enseignant' ? "/teacher-dashboard" : "/student-dashboard"} className="inline-flex items-center gap-2">
                                        {user.role === 'enseignant' ? <GraduationCap className="h-4 w-4 shrink-0" /> : <User className="h-4 w-4 shrink-0" />}
                                        Aller à mon Espace
                                    </Link>
                                </Button>
                            )}
                        </div>

                        {/* Statistiques */}
                        <div className="grid grid-cols-3 gap-8 pt-12 max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700 fill-mode-both">
                            <StatItem value="500+" label="Enseignants" />
                            <StatItem value="10K+" label="Quiz créés" />
                            <StatItem value="50K+" label="Étudiants" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SECTION FONCTIONNALITÉS ===== */}
            <section className="py-24 bg-muted/30 relative">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                        <span className="text-primary font-semibold text-sm tracking-widest uppercase">Fonctionnalités</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                            Tout ce dont vous avez besoin
                        </h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            Une suite d'outils complète pour transformer votre façon d'évaluer et de suivre vos étudiants.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {features.map((feature, idx) => (
                            <FeatureCard key={idx} icon={feature.icon} title={feature.title} description={feature.description} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== SECTION COMMENT ÇA MARCHE ===== */}
            <section className="py-24 relative">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                        <span className="text-primary font-semibold text-sm tracking-widest uppercase">Comment ça marche</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                            Opérationnel en 3 étapes
                        </h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            De la création de votre compte à l'analyse des résultats, tout est conçu pour être simple et rapide.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto relative">
                        {/* Ligne de connexion entre les étapes (desktop) */}
                        <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-[2px] bg-border z-0"></div>
                        
                        {steps.map((step, idx) => (
                            <StepCard key={idx} number={step.number} title={step.title} description={step.description} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== SECTION CTA FINAL ===== */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5"></div>
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center space-y-8">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
                            Prêt à transformer vos
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary block mt-1">
                                évaluations ?
                            </span>
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-xl mx-auto">
                            Rejoignez des centaines d'enseignants qui font déjà confiance à QuizMaster pour leurs évaluations.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Button asChild size="lg" className="h-13 px-10 text-base rounded-full shadow-lg shadow-primary/25 hover:shadow-xl transition-all hover:-translate-y-1">
                                <Link to="/register" className="inline-flex items-center gap-2">
                                    Créer un compte gratuit <ArrowRight className="h-4 w-4 shrink-0" />
                                </Link>
                            </Button>
                        </div>
                        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-2">
                            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Gratuit</span>
                            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Sans carte bancaire</span>
                            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Prêt en 2 min</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
