import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { teacherSessionApi } from '@/api/teacherService';
import { ArrowLeft, Search, Download, Eye, Check, CircleDot } from 'lucide-react';

const TABS = [
    { key: 'toutes', label: 'Toutes' },
    { key: 'valides', label: 'Validés' },
    { key: 'arevoir', label: 'À revoir' },
];

/* Catégorie d'une session pour le filtrage par onglet. */
function category(session) {
    if (session.status !== 'termine') return 'encours';
    return (session.score_on_20 ?? 0) >= 10 ? 'valides' : 'arevoir';
}

export default function QuizResults() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState('toutes');
    const [search, setSearch] = useState('');

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const result = await teacherSessionApi.getSessions(quizId);
                if (active) {
                    setQuiz(result.quiz ?? null);
                    setSessions(result.sessions ?? []);
                }
            } catch (err) {
                console.error(err);
                if (active) setError('Erreur lors du chargement des résultats.');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [quizId]);

    const counts = useMemo(() => {
        const c = { toutes: sessions.length, valides: 0, arevoir: 0 };
        sessions.forEach((s) => {
            const cat = category(s);
            if (cat === 'valides') c.valides += 1;
            if (cat === 'arevoir') c.arevoir += 1;
        });
        return c;
    }, [sessions]);

    const filtered = useMemo(() => (
        sessions.filter((s) => {
            const matchTab = tab === 'toutes' || category(s) === tab;
            const q = search.toLowerCase();
            const matchSearch = !search
                || s.student?.name?.toLowerCase().includes(q)
                || s.student?.email?.toLowerCase().includes(q);
            return matchTab && matchSearch;
        })
    ), [sessions, tab, search]);

    const exportExcel = () => {
        const header = ['Nom', 'Email', 'Statut', 'Score', 'Total', 'Note /20', 'Pourcentage', 'Terminé le'];
        const rows = sessions.map((s) => [
            s.student?.name ?? '',
            s.student?.email ?? '',
            s.status === 'termine' ? 'Terminé' : 'En cours',
            s.score,
            s.total_points,
            s.score_on_20,
            `${s.percentage}%`,
            s.completed_at ?? '',
        ]);
        
        const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
        
        // Ajuster la largeur des colonnes
        const colWidths = header.map(h => ({ wch: Math.max(10, h.length) }));
        rows.forEach(row => {
            row.forEach((cell, i) => {
                const len = String(cell).length;
                if (len > (colWidths[i].wch || 10)) {
                    colWidths[i].wch = len;
                }
            });
        });
        worksheet['!cols'] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Résultats');
        
        XLSX.writeFile(workbook, `resultats-${quiz?.title ?? 'quiz'}.xlsx`);
    };

    if (loading) return <LoadingSkeleton />;
    if (error) return <div className="text-destructive text-center p-4">{error}</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <button onClick={() => navigate('/teacher/results')} className="p-2 rounded-lg hover:bg-muted text-muted-foreground mt-1" title="Retour">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Résultats du Quiz</h1>
                        <p className="text-muted-foreground">{quiz?.title} · {sessions.length} participation(s)</p>
                    </div>
                </div>
                <Button variant="outline" className="gap-2 shrink-0" onClick={exportExcel} disabled={sessions.length === 0}>
                    <Download className="w-4 h-4" /> Exporter Excel
                </Button>
            </div>

            {/* Onglets + recherche */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border">
                <div className="flex items-center gap-1 overflow-x-auto">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${
                                tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {t.label}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                {counts[t.key]}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="relative w-full lg:w-72 pb-3 lg:pb-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none lg:-mt-1.5" />
                    <Input placeholder="Rechercher un étudiant..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
            </div>

            {/* Liste des participations */}
            {filtered.length === 0 ? (
                <Card className="shadow-sm border-border p-12 text-center text-muted-foreground font-medium">
                    Aucune participation dans cette catégorie.
                </Card>
            ) : (
                <div className="space-y-3">
                    {filtered.map((s) => (
                        <SessionRow
                            key={s.id}
                            session={s}
                            onView={() => navigate(`/teacher/quizzes/${quizId}/sessions/${s.id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/* Une ligne de participation avec la barre de progression Assigné → Démarré → Soumis. */
function SessionRow({ session, onView }) {
    const done = session.status === 'termine';
    const initials = (session.student?.name ?? '?')
        .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

    const cat = category(session);
    const badge = !done
        ? { label: 'En cours', className: 'text-muted-foreground' }
        : cat === 'valides'
            ? { label: 'Acquis', className: 'text-success' }
            : { label: 'À revoir', className: 'text-orange-500' };

    return (
        <Card className="shadow-sm border-border p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Étudiant */}
                <div className="flex items-center gap-3 lg:w-64 shrink-0">
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{session.student?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{session.student?.email}</p>
                    </div>
                </div>

                {/* Progression */}
                <div className="flex items-center flex-1 min-w-0 px-2">
                    <Step label="Assigné" state="done" />
                    <Line state="done" />
                    <Step label="Démarré" state="done" />
                    <Line state={done ? 'done' : 'current'} />
                    <Step label="Soumis" state={done ? 'done' : 'current'} />
                </div>

                {/* Statut + score + action */}
                <div className="flex items-center justify-between lg:justify-end gap-6 shrink-0">
                    <div className="text-right">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Statut</p>
                        <p className={`text-sm font-bold ${badge.className}`}>{badge.label}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Score</p>
                        <p className="text-sm font-bold text-foreground">
                            {done ? session.score_on_20 : '—'}<span className="text-muted-foreground font-medium">/20</span>
                        </p>
                    </div>
                    <button onClick={onView} className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Voir le détail">
                        <Eye className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </Card>
    );
}

function Step({ label, state }) {
    return (
        <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                state === 'done' ? 'bg-success text-white' : 'border-2 border-orange-400 text-orange-400'
            }`}>
                {state === 'done' ? <Check className="w-3.5 h-3.5" /> : <CircleDot className="w-3.5 h-3.5" />}
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        </div>
    );
}

function Line({ state }) {
    return <div className={`h-0.5 flex-1 min-w-4 -mt-5 ${state === 'done' ? 'bg-success' : 'bg-border'}`} />;
}