import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { teacherQuizApi, getSubject } from '@/api/teacherService';
import { Search, BarChart3, Users, ChevronRight } from 'lucide-react';

/**
 * Menu "Résultats" : l'enseignant choisit un quiz pour en voir les
 * participations. La page de résultats détaillée est par quiz
 * (endpoint GET /teacher/quizzes/{quiz}/sessions).
 */
export default function Results() {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

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

    const filtered = useMemo(() => (
        quizzes.filter((q) => !search || q.title.toLowerCase().includes(search.toLowerCase()))
    ), [quizzes, search]);

    if (loading) return <LoadingSkeleton />;
    if (error) return <div className="text-destructive text-center p-4">{error}</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Résultats</h1>
                <p className="text-muted-foreground">Choisissez un quiz pour consulter les participations et les notes.</p>
            </div>

            <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input placeholder="Rechercher un quiz..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>

            {filtered.length === 0 ? (
                <Card className="shadow-sm border-border p-12 text-center text-muted-foreground font-medium">
                    Aucun quiz trouvé.
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((quiz) => (
                        <button
                            key={quiz.id}
                            onClick={() => navigate(`/teacher/quizzes/${quiz.id}/results`)}
                            className="text-left"
                        >
                            <Card className="shadow-sm border-border p-5 hover:border-primary/50 hover:shadow-md transition-all h-full">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="p-2 rounded-lg bg-primary/10 inline-flex mb-3">
                                            <BarChart3 className="w-5 h-5 text-primary" />
                                        </div>
                                        <h3 className="font-bold text-foreground truncate">{quiz.title}</h3>
                                        <p className="text-xs text-muted-foreground">{getSubject(quiz.title)}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
                                    <Users className="w-4 h-4" />
                                    <span className="font-semibold text-foreground">{quiz.sessions_count}</span> participation(s)
                                </div>
                            </Card>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}