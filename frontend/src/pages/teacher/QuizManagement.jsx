import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { teacherQuizApi, deriveQuizStatus, QUIZ_STATUS, getSubject } from '@/api/teacherService';
import { Plus, Search, Eye, Pencil, Trash2, FileQuestion, Calendar } from 'lucide-react';

const TABS = [
    { key: 'tous', label: 'Tous' },
    { key: 'actif', label: 'Actif' },
    { key: 'brouillon', label: 'Brouillon' },
    { key: 'expire', label: 'Expiré' },
];

export default function QuizManagement() {
    const navigate = useNavigate();

    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState('tous');
    const [search, setSearch] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const result = await teacherQuizApi.getQuizzes();
                if (active) setQuizzes(result.quizzes ?? []);
            } catch (err) {
                console.error(err);
                if (active) setError('Erreur lors du chargement des quiz.');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    const counts = useMemo(() => {
        const c = { tous: quizzes.length, actif: 0, brouillon: 0, expire: 0 };
        quizzes.forEach((q) => { c[deriveQuizStatus(q)] += 1; });
        return c;
    }, [quizzes]);

    const filtered = useMemo(() => (
        quizzes.filter((q) => {
            const matchTab = tab === 'tous' || deriveQuizStatus(q) === tab;
            const matchSearch = !search || q.title.toLowerCase().includes(search.toLowerCase());
            return matchTab && matchSearch;
        })
    ), [quizzes, tab, search]);

    const handleDelete = async (quiz) => {
        if (!window.confirm(`Supprimer le quiz « ${quiz.title} » et toutes ses données ?`)) return;
        try {
            setDeletingId(quiz.id);
            await teacherQuizApi.deleteQuiz(quiz.id);
            setQuizzes((prev) => prev.filter((q) => q.id !== quiz.id));
        } catch (err) {
            console.error(err);
            window.alert('Échec de la suppression.');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (d) =>
        d ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d)) : '—';

    if (loading) return <LoadingSkeleton />;
    if (error) return <div className="text-destructive text-center p-4">{error}</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Gestion des Quiz</h1>
                    <p className="text-muted-foreground">Gérez facilement l'intégralité de vos évaluations.</p>
                </div>
                <Button className="gap-2 shrink-0" onClick={() => navigate('/teacher/quizzes/new')}>
                    <Plus className="w-4 h-4" /> Nouveau Quiz
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
                    <Input placeholder="Rechercher un quiz..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
            </div>

            {/* Tableau */}
            <Card className="shadow-sm border-border p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Titre &amp; Matière</th>
                                <th className="px-6 py-4 font-semibold">Questions</th>
                                <th className="px-6 py-4 font-semibold">Clôture</th>
                                <th className="px-6 py-4 font-semibold">Statut</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-muted-foreground font-medium">Aucun quiz dans cette catégorie.</td></tr>
                            ) : (
                                filtered.map((quiz) => {
                                    const meta = QUIZ_STATUS[deriveQuizStatus(quiz)];
                                    return (
                                        <tr key={quiz.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-foreground">{quiz.title}</div>
                                                <div className="text-xs text-muted-foreground">{getSubject(quiz.title)}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <FileQuestion className="w-4 h-4" />
                                                    <span className="font-semibold text-foreground">{quiz.questions_count}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(quiz.expires_at)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.className}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                                                    {meta.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => navigate(`/teacher/quizzes/${quiz.id}`)} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Voir">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => navigate(`/teacher/quizzes/${quiz.id}/edit`)} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Modifier">
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(quiz)} disabled={deletingId === quiz.id} className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50" title="Supprimer">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
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
        </div>
    );
}
