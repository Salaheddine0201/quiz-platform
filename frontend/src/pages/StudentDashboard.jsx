<<<<<<< HEAD
import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
    const { user } = useAuth();

    return (
        <div className="flex-grow flex items-center justify-center p-6 text-center">
            <h1 className="text-2xl font-semibold text-slate-800">
                Bienvenue {user?.name} dans l'espace étudiant
            </h1>
=======
import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStudentDashboard } from '../hooks/student/useStudentDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, CheckCircle2, TrendingUp, Clock, Search, BookOpen, Calendar, ArrowRight, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

export default function StudentDashboard() {
    const { user } = useAuth();
    const { data, loading, error } = useStudentDashboard();
    const navigate = useNavigate();

    const formattedDate = new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date());

    const formatTime = (minutes) => {
        if (!minutes) return '0m';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h > 0) return `${h}h ${m > 0 ? m + 'm' : ''}`;
        return `${m}m`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateString));
    };

    const getSubject = (title) => {
        if (!title) return 'Divers';
        const parts = title.split(/—|-/);
        if (parts.length > 0) {
            return parts[0].trim();
        }
        return title;
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (error) {
        return <div className="text-destructive text-center p-4">{error}</div>;
    }

    const pendingQuizzes = data?.pending_quizzes || [];
    const completedCount = data?.completed_count || 0;
    const averageScore = data?.average_score || 0;
    const totalTime = data?.total_time_minutes || 0;
    const recentResults = data?.recent_results || [];

    let motivationMessage = "Ne vous découragez pas, la pratique fait la perfection. 📚";
    if (averageScore >= 16) {
        motivationMessage = "Excellent travail, continuez sur cette lancée ! 🚀";
    } else if (averageScore >= 10) {
        motivationMessage = "Sur la bonne voie, persévérez ! 💪";
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Tableau de bord Étudiant</h1>
                    <p className="text-muted-foreground capitalize mb-2">
                        {formattedDate} — Bonjour, {user?.name}
                    </p>
                    <p className="text-sm font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-md inline-block">
                        {motivationMessage}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-sm border-border">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Évaluations à faire</p>
                                <h3 className="text-3xl font-bold text-foreground">{pendingQuizzes.length}</h3>
                            </div>
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <FileText className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-border">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Évaluations terminées</p>
                                <h3 className="text-3xl font-bold text-foreground">{completedCount}</h3>
                            </div>
                            <div className="p-2 bg-success/10 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 text-success" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-border">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Moyenne Globale</p>
                                <div className="flex items-baseline gap-1">
                                    <h3 className="text-3xl font-bold text-foreground">{averageScore}</h3>
                                    <span className="text-sm font-semibold text-muted-foreground">/ 20</span>
                                </div>
                            </div>
                            <div className="p-2 bg-secondary/10 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-secondary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-border">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Temps passé</p>
                                <h3 className="text-3xl font-bold text-foreground">{formatTime(totalTime)}</h3>
                            </div>
                            <div className="p-2 bg-chart-5/10 rounded-lg">
                                <Clock className="w-5 h-5 text-chart-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Quizzes */}
            <div>
                <h2 className="text-xl font-bold text-foreground mb-1">À faire prochainement</h2>
                <p className="text-muted-foreground mb-4">Vos évaluations en attente</p>
                
                {pendingQuizzes.length === 0 ? (
                    <Card className="border-dashed border-2 bg-transparent shadow-none">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                            <CheckCircle2 className="w-12 h-12 text-success/50 mb-4" />
                            <h3 className="text-lg font-semibold text-foreground">Aucun quiz assigné pour le moment</h3>
                            <p className="text-muted-foreground max-w-sm mt-2">Vous êtes à jour ! Revenez plus tard pour voir si de nouvelles évaluations vous ont été assignées.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {pendingQuizzes.map((quiz) => (
                            <Card key={quiz.id} className="shadow-sm border-border flex flex-col h-full hover:shadow-md transition-shadow">
                                <CardContent className="p-6 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-bold text-lg text-foreground leading-tight line-clamp-2 pr-2">{quiz.title}</h3>
                                        {quiz.status === 'en_cours' ? (
                                            <span className="shrink-0 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                                En cours
                                            </span>
                                        ) : (
                                            <span className="shrink-0 inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                                                En attente
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground mb-4">
                                        <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                                            <Clock className="w-4 h-4" />
                                            {quiz.duration_minutes ? `${quiz.duration_minutes} min` : 'Illimité'}
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                                            <BookOpen className="w-4 h-4" />
                                            {quiz.questions_count} Qs
                                        </div>
                                    </div>
                                    {quiz.expires_at && (
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-destructive mb-6 bg-destructive/10 px-2.5 py-1 rounded-md self-start">
                                            <Calendar className="w-4 h-4" />
                                            Exp. {formatDate(quiz.expires_at)}
                                        </div>
                                    )}
                                    <div className="mt-auto pt-4 border-t border-border">
                                        <Button 
                                            className="w-full justify-between group" 
                                            onClick={() => navigate(`/student/quiz/${quiz.id}`)}
                                        >
                                            {quiz.status === 'en_cours' ? 'Reprendre' : 'Commencer'}
                                            <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Progression Chart */}
            {recentResults.length > 0 && (
                <Card className="shadow-sm border-border">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Évolution de vos résultats</h2>
                                <p className="text-muted-foreground text-sm mt-1">Basé sur vos 5 dernières évaluations</p>
                            </div>
                        </div>
                        <div className="h-64 flex items-end gap-2 sm:gap-6 pt-4 border-b border-border relative">
                            {/* Grid lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10 pb-6">
                                <div className="border-t border-foreground w-full"></div>
                                <div className="border-t border-foreground w-full"></div>
                                <div className="border-t border-foreground w-full"></div>
                                <div className="border-t border-foreground w-full"></div>
                                <div className="border-t border-foreground w-full"></div>
                            </div>
                            
                            {/* Y-axis labels */}
                            <div className="h-full flex flex-col justify-between items-end pr-2 text-xs text-muted-foreground font-medium pb-6 pointer-events-none shrink-0 w-6">
                                <span>20</span>
                                <span>15</span>
                                <span>10</span>
                                <span>5</span>
                                <span>0</span>
                            </div>

                            {/* Bars */}
                            <div className="flex-1 flex justify-around items-end h-full pb-6 z-10 pl-2">
                                {[...recentResults].slice(0, 5).reverse().map((result, idx) => {
                                    const scoreOn20 = result.score;
                                    const heightPercentage = Math.max((scoreOn20 / 20) * 100, 5); // min 5% height
                                    const isPassed = scoreOn20 >= 10;
                                    
                                    return (
                                        <div key={result.id} className="flex flex-col items-center group relative w-full px-1 sm:px-4 h-full justify-end">
                                            {/* Tooltip */}
                                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs font-bold px-3 py-1.5 rounded shadow-lg pointer-events-none whitespace-nowrap z-20">
                                                {result.quiz_title} : {scoreOn20}/20
                                            </div>
                                            
                                            {/* Bar */}
                                            <div 
                                                className={`w-full max-w-[60px] rounded-t-md transition-all duration-1000 ease-out animate-in slide-in-from-bottom-full ${isPassed ? 'bg-primary' : 'bg-destructive'}`}
                                                style={{ height: `${heightPercentage}%`, animationDelay: `${idx * 150}ms`, animationFillMode: 'both' }}
                                            ></div>
                                            
                                            {/* X-axis label (date) */}
                                            <div className="absolute -bottom-6 text-[10px] sm:text-xs font-semibold text-muted-foreground text-center w-full truncate px-1">
                                                {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(result.completed_at))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recent Results Table */}
            <Card className="shadow-sm border-border">
                <div className="p-6 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Historique des Évaluations</h2>
                        <p className="text-muted-foreground">Consultez vos derniers résultats</p>
                    </div>
                    <Button variant="outline" className="gap-2 shrink-0" onClick={() => navigate('/student/results')}>
                        Tous les résultats
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                            <tr>
                                <th className="px-6 py-4 font-semibold">#</th>
                                <th className="px-6 py-4 font-semibold">QUIZ</th>
                                <th className="px-6 py-4 font-semibold">MATIÈRE</th>
                                <th className="px-6 py-4 font-semibold">DATE</th>
                                <th className="px-6 py-4 font-semibold">RÉSULTAT</th>
                                <th className="px-6 py-4 font-semibold text-right">NOTE</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {recentResults.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground font-medium">Aucun résultat récent.</td>
                                </tr>
                            ) : (
                                recentResults.slice(0, 5).map((result, idx) => {
                                    const isPassed = result.score >= 10;
                                    
                                    return (
                                        <tr key={result.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 font-bold text-foreground">{String(idx + 1).padStart(2, '0')}</td>
                                            <td className="px-6 py-4 font-semibold text-foreground">{result.quiz_title}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{getSubject(result.quiz_title)}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{formatDate(result.completed_at)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    isPassed ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                                                }`}>
                                                    {isPassed ? 'Réussi' : 'Insuffisant'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1.5 font-bold">
                                                    {isPassed ? (
                                                        <CheckCircle2 className="w-4 h-4 text-success" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4 text-destructive" />
                                                    )}
                                                    <span className={isPassed ? 'text-success' : 'text-destructive'}>
                                                        {result.score}
                                                    </span>
                                                    <span className="text-muted-foreground">/20</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
>>>>>>> df30979466f6746f5723451cab2c479dc416fb9a
        </div>
    );
}
