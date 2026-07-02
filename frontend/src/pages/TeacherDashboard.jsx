import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { teacherDashboardApi, deriveQuizStatus } from '@/api/teacherService';
import { BookOpen, GraduationCap, CheckCircle2, TrendingUp, Plus, ArrowRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const DONUT = {
    actif: { label: 'Actifs', color: 'hsl(var(--success))' },
    planifie: { label: 'Planifiés', color: 'hsl(var(--warning))' },
    expire: { label: 'Expirés', color: 'hsl(var(--destructive))' },
    brouillon: { label: 'Brouillons', color: 'hsl(var(--muted-foreground))' },
};

export default function TeacherDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recentSort, setRecentSort] = useState({ key: null, direction: 'asc' });

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const result = await teacherDashboardApi.getDashboardData();
                if (active) setData(result);
            } catch (err) {
                console.error(err);
                if (active) setError('Erreur lors du chargement du tableau de bord.');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    const today = new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).format(new Date());

    // Score moyen (points) par quiz, calculé à partir des sessions récentes.
    const barData = useMemo(() => {
        const sessions = data?.recent_sessions ?? [];
        const acc = {};
        sessions.forEach((s) => {
            acc[s.quiz_title] = acc[s.quiz_title] || { sum: 0, n: 0 };
            acc[s.quiz_title].sum += s.score;
            acc[s.quiz_title].n += 1;
        });
        return Object.entries(acc).map(([title, { sum, n }]) => ({
            title,
            score: Math.round((sum / n) * 10) / 10,
        }));
    }, [data]);

    const maxScore = useMemo(() => Math.max(10, ...barData.map((b) => b.score)), [barData]);

    const stats = data?.stats ?? {};
    const quizzes = data?.quizzes ?? [];
    const recentSessions = data?.recent_sessions ?? [];
    const activeCount = quizzes.filter((q) => deriveQuizStatus(q) === 'actif').length;

    const donutData = useMemo(() => {
        const quizzes = data?.quizzes ?? [];
        const counts = { actif: 0, planifie: 0, expire: 0, brouillon: 0 };
        quizzes.forEach((q) => { counts[deriveQuizStatus(q)] += 1; });
        return Object.entries(counts)
            .filter(([, value]) => value > 0)
            .map(([key, value]) => ({ key, value, ...DONUT[key] }));
    }, [data]);

    const sortedRecentSessions = useMemo(() => {
        let sortableItems = [...recentSessions];
        if (recentSort.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[recentSort.key];
                let bValue = b[recentSort.key];
                
                if (aValue === null) aValue = '';
                if (bValue === null) bValue = '';
                
                if (aValue < bValue) return recentSort.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return recentSort.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [recentSessions, recentSort]);

    if (loading) return <LoadingSkeleton />;
    if (error) return <div className="text-destructive text-center p-4">{error}</div>;

    const requestRecentSort = (key) => {
        let direction = 'asc';
        if (recentSort.key === key && recentSort.direction === 'asc') direction = 'desc';
        setRecentSort({ key, direction });
    };

    const getRecentSortIcon = (columnKey) => {
        if (recentSort.key !== columnKey) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
        if (recentSort.direction === 'asc') return <ArrowUp className="w-4 h-4 ml-1" />;
        return <ArrowDown className="w-4 h-4 ml-1" />;
    };

    // Classes Tailwind écrites en entier (le scanner ne détecte pas les classes dynamiques).
    const cards = [
        { label: 'Quiz créés', value: stats.quizzes_count ?? 0, icon: BookOpen, bg: 'bg-primary/10', text: 'text-primary' },
        { label: 'Étudiants assignés', value: stats.students_assigned_count ?? 0, icon: GraduationCap, bg: 'bg-secondary/10', text: 'text-secondary' },
        { label: 'Sessions terminées', value: stats.completed_sessions_count ?? 0, icon: CheckCircle2, bg: 'bg-success/10', text: 'text-success' },
        { label: 'Quiz actifs', value: activeCount, icon: TrendingUp, bg: 'bg-chart-5/10', text: 'text-chart-5' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
                    <p className="text-muted-foreground capitalize">{today} — Bonjour, {user?.name}</p>
                </div>
                <Button className="gap-2 shrink-0" onClick={() => navigate('/teacher/quizzes/new')}>
                    <Plus className="w-4 h-4" /> Nouveau Quiz
                </Button>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map(({ label, value, icon: Icon, bg, text }) => (
                    <Card key={label} className="shadow-sm border-border">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
                                    <h3 className="text-3xl font-bold text-foreground">{value}</h3>
                                </div>
                                <div className={`p-2 rounded-lg ${bg}`}>
                                    <Icon className={`w-5 h-5 ${text}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="shadow-sm border-border lg:col-span-2">
                    <CardContent className="p-6">
                        <h2 className="text-xl font-bold text-foreground">Scores moyens par Quiz</h2>
                        <p className="text-muted-foreground text-sm mt-1 mb-6">Score moyen (points) des dernières sessions terminées</p>
                        {barData.length === 0 ? (
                            <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
                                Aucune session terminée pour le moment.
                            </div>
                        ) : (
                            <div className="h-64 flex items-end border-b border-border relative">
                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10 pb-6">
                                    {[0, 1, 2, 3, 4].map((i) => <div key={i} className="border-t border-foreground w-full" />)}
                                </div>
                                <div className="flex-1 flex justify-around items-end h-full pb-6 z-10">
                                    {barData.slice(0, 6).map((b, idx) => (
                                        <div key={b.title} className="flex flex-col items-center group relative w-full px-1 sm:px-3 h-full justify-end">
                                            <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs font-bold px-3 py-1.5 rounded shadow-lg whitespace-nowrap z-20">
                                                {b.title} : {b.score} pts
                                            </div>
                                            <div
                                                className="w-full max-w-[56px] rounded-t-md bg-primary transition-all duration-700 ease-out"
                                                style={{ height: `${Math.max((b.score / maxScore) * 100, 4)}%`, animationDelay: `${idx * 100}ms` }}
                                            />
                                            <div className="absolute -bottom-6 text-[10px] sm:text-xs font-semibold text-muted-foreground text-center w-full truncate px-1">
                                                {b.title.length > 12 ? b.title.slice(0, 12) + '…' : b.title}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-border">
                    <CardContent className="p-6">
                        <h2 className="text-xl font-bold text-foreground">Répartition des Quiz</h2>
                        <p className="text-muted-foreground text-sm mt-1 mb-4">Statut de vos quiz</p>
                        {donutData.length === 0 ? (
                            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Aucun quiz.</div>
                        ) : (
                            <>
                                <DonutChart data={donutData} />
                                <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs text-muted-foreground font-medium">
                                    {donutData.map((d) => (
                                        <span key={d.key} className="flex items-center gap-1.5">
                                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                                            {d.label} ({d.value})
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Activité récente */}
            <Card className="shadow-sm border-border">
                <div className="p-6 border-b border-border flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Activité récente</h2>
                        <p className="text-muted-foreground">Dernières sessions terminées</p>
                    </div>
                    <Button variant="outline" className="gap-2 shrink-0" onClick={() => navigate('/teacher/quizzes')}>
                        Voir les quiz <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                            <tr>
                                <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => requestRecentSort('student_name')}>
                                    <div className="flex items-center">Étudiant {getRecentSortIcon('student_name')}</div>
                                </th>
                                <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => requestRecentSort('quiz_title')}>
                                    <div className="flex items-center">Quiz {getRecentSortIcon('quiz_title')}</div>
                                </th>
                                <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => requestRecentSort('completed_at')}>
                                    <div className="flex items-center">Terminé le {getRecentSortIcon('completed_at')}</div>
                                </th>
                                <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-muted/50 transition-colors text-right" onClick={() => requestRecentSort('score')}>
                                    <div className="flex items-center justify-end">Score (pts) {getRecentSortIcon('score')}</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {sortedRecentSessions.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-muted-foreground font-medium">Aucune session terminée.</td></tr>
                            ) : (
                                sortedRecentSessions.map((s) => (
                                    <tr key={s.session_id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-foreground">{s.student_name}</div>
                                            <div className="text-xs text-muted-foreground">{s.student_email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-foreground">{s.quiz_title}</td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(s.completed_at))}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-foreground">{s.score}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

/* Graphique en anneau (donut) en SVG pur — aucune librairie externe. */
function DonutChart({ data }) {
    const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
    const radius = 70;
    const circumference = 2 * Math.PI * radius;

    const segments = data.map((d, i) => {
        const dash = (d.value / total) * circumference;
        const offset = data.slice(0, i).reduce((sum, p) => sum + (p.value / total) * circumference, 0);
        return { ...d, dash, offset };
    });

    return (
        <div className="flex items-center justify-center">
            <svg viewBox="0 0 180 180" className="w-44 h-44 -rotate-90">
                {segments.map((d) => (
                    <circle
                        key={d.key}
                        cx="90" cy="90" r={radius}
                        fill="none" stroke={d.color} strokeWidth="22"
                        strokeDasharray={`${d.dash} ${circumference - d.dash}`}
                        strokeDashoffset={-d.offset}
                    />
                ))}
            </svg>
        </div>
    );
}