import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { teacherSessionApi } from '@/api/teacherService';
import { ArrowLeft, Check, X, MinusCircle } from 'lucide-react';

export default function SessionDetail() {
    const { quizId, sessionId } = useParams();
    const navigate = useNavigate();

    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const result = await teacherSessionApi.getSessionDetail(quizId, sessionId);
                if (active) setSession(result.session ?? null);
            } catch (err) {
                console.error(err);
                if (active) setError('Erreur lors du chargement de la session.');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [quizId, sessionId]);

    if (loading) return <LoadingSkeleton />;
    if (error) return <div className="text-destructive text-center p-4">{error}</div>;
    if (!session) return <div className="text-muted-foreground text-center p-4">Session introuvable.</div>;

    const done = session.status === 'termine';

    const summary = [
        { label: 'Correctes', value: session.correct_count ?? 0, className: 'text-success' },
        { label: 'Incorrectes', value: session.incorrect_count ?? 0, className: 'text-destructive' },
        { label: 'Sans réponse', value: session.unanswered_count ?? 0, className: 'text-muted-foreground' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* En-tête */}
            <div className="flex items-start gap-3">
                <button onClick={() => navigate(`/teacher/quizzes/${quizId}/results`)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground mt-1" title="Retour">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{session.student?.name}</h1>
                    <p className="text-muted-foreground">{session.student?.email}</p>
                </div>
            </div>

            {/* Résumé */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="shadow-sm border-border">
                    <CardContent className="p-5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Note</p>
                        <p className="text-2xl font-bold text-foreground">
                            {done ? session.score_on_20 : '—'}<span className="text-base text-muted-foreground font-medium">/20</span>
                        </p>
                    </CardContent>
                </Card>
                {summary.map((s) => (
                    <Card key={s.label} className="shadow-sm border-border">
                        <CardContent className="p-5">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
                            <p className={`text-2xl font-bold ${s.className}`}>{s.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Détail des questions */}
            <div className="space-y-4">
                {(session.questions ?? []).map((q, idx) => (
                    <Card key={q.id} className="shadow-sm border-border">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <h3 className="font-semibold text-foreground">
                                    <span className="text-muted-foreground mr-2">{idx + 1}.</span>{q.text_content}
                                </h3>
                                <QuestionBadge question={q} />
                            </div>

                            <div className="space-y-2">
                                {q.answers.map((a) => {
                                    const isSelected = a.id === q.selected_answer_id;
                                    const isCorrect = a.is_correct;

                                    // Couleurs : bonne réponse en vert ; mauvais choix de l'étudiant en rouge.
                                    let style = 'border-border';
                                    let icon = null;
                                    if (isCorrect) {
                                        style = 'border-success/40 bg-success/5';
                                        icon = <Check className="w-4 h-4 text-success" />;
                                    } else if (isSelected) {
                                        style = 'border-destructive/40 bg-destructive/5';
                                        icon = <X className="w-4 h-4 text-destructive" />;
                                    }

                                    return (
                                        <div key={a.id} className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border ${style}`}>
                                            <span className="text-sm text-foreground">{a.text_content}</span>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {isSelected && (
                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Choix de l'étudiant</span>
                                                )}
                                                {icon}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function QuestionBadge({ question }) {
    if (!question.was_answered) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground shrink-0">
                <MinusCircle className="w-3.5 h-3.5" /> Sans réponse
            </span>
        );
    }
    if (question.is_correct) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success/10 text-success shrink-0">
                <Check className="w-3.5 h-3.5" /> +{question.points} pts
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-destructive/10 text-destructive shrink-0">
            <X className="w-3.5 h-3.5" /> Incorrect
        </span>
    );
}