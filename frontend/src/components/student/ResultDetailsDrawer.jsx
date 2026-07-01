import React, { useEffect, useState, useRef } from 'react';
import { studentResultApi } from '../../api/studentService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Calendar, BookOpen, Target, CheckCircle2, XCircle, Check, ChevronDown } from 'lucide-react';

export default function ResultDetailsDrawer({ sessionId, onClose }) {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasScrolled, setHasScrolled] = useState(false);
    const drawerRef = useRef(null);

    useEffect(() => {
        let isMounted = true;
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const data = await studentResultApi.getResultDetails(sessionId);
                if (isMounted) {
                    setDetails(data);
                    setHasScrolled(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Impossible de charger les détails du résultat.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (sessionId) {
            fetchDetails();
        }

        return () => {
            isMounted = false;
        };
    }, [sessionId]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (sessionId) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [sessionId, onClose]);

    const handleBackdropClick = (e) => {
        if (drawerRef.current && !drawerRef.current.contains(e.target)) {
            onClose();
        }
    };

    if (!sessionId) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm animate-in fade-in"
            onClick={handleBackdropClick}
        >
            <div 
                ref={drawerRef}
                className="w-full max-w-md md:max-w-xl h-full bg-card border-l border-border shadow-2xl flex flex-col relative animate-in slide-in-from-right duration-300"
            >
                {/* Header */}
                <div className="flex-none p-5 sm:p-6 border-b border-border bg-muted/30 flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">
                            Détails du résultat
                        </h2>
                        <p className="text-muted-foreground text-sm">Performances détaillées pour cette session</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div 
                    className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar"
                    onScroll={(e) => {
                        if (e.target.scrollTop > 20 && !hasScrolled) {
                            setHasScrolled(true);
                        }
                    }}
                >
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-muted-foreground font-medium">Chargement des détails...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <XCircle className="w-12 h-12 text-destructive mb-4 opacity-80" />
                            <p className="text-destructive font-medium">{error}</p>
                            <Button onClick={onClose} variant="outline" className="mt-6">Fermer</Button>
                        </div>
                    ) : details ? (
                        <div className="space-y-8">
                            {/* Header Info */}
                            <div>
                                <h3 className="text-xl font-bold text-foreground mb-2">{details.quiz_title}</h3>
                                <div className="flex flex-wrap items-center gap-3">
                                    {details.grading_system && (
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium bg-muted px-2.5 py-1 rounded-md">
                                            <BookOpen className="w-4 h-4" />
                                            {details.grading_system === 'standard' ? 'Standard' : 'Canadienne'}
                                        </div>
                                    )}
                                    {details.completed_at && (
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium bg-muted px-2.5 py-1 rounded-md">
                                            <Calendar className="w-4 h-4" />
                                            {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(details.completed_at))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Main Score Banner */}
                            <div className={`p-5 rounded-xl flex items-center justify-between border ${details.result === 'Réussi' ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${details.result === 'Réussi' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                                        {details.result === 'Réussi' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Statut</div>
                                        <div className={`text-lg sm:text-xl font-bold ${details.result === 'Réussi' ? 'text-success' : 'text-destructive'}`}>
                                            {details.result === 'Réussi' ? 'Réussi' : 'Insuffisant'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Note</div>
                                    <div className="flex items-baseline gap-1 justify-end">
                                        <span className={`text-3xl font-black ${details.result === 'Réussi' ? 'text-success' : 'text-destructive'}`}>
                                            {details.score_on_20}
                                        </span>
                                        <span className="text-lg font-bold text-muted-foreground">/20</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <Card className="p-4 flex flex-col items-center justify-center gap-1 bg-card border border-border shadow-sm">
                                    <div className="text-2xl font-black text-foreground">{details.correct_count}</div>
                                    <div className="text-[11px] font-bold text-success uppercase tracking-wide flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Correctes
                                    </div>
                                </Card>
                                <Card className="p-4 flex flex-col items-center justify-center gap-1 bg-card border border-border shadow-sm">
                                    <div className="text-2xl font-black text-foreground">{details.incorrect_count}</div>
                                    <div className="text-[11px] font-bold text-destructive uppercase tracking-wide flex items-center gap-1">
                                        <XCircle className="w-3 h-3" /> Incorrectes
                                    </div>
                                </Card>
                                <Card className="p-4 flex items-center justify-between gap-3 bg-card border border-border shadow-sm col-span-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <Target className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-xl font-black text-foreground">{details.score} <span className="text-sm text-muted-foreground font-semibold">/ {details.total_points} pts</span></div>
                                            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Score brut</div>
                                        </div>
                                    </div>
                                    <div className="text-right border-l border-border pl-4">
                                        <div className="text-xl font-black text-foreground">{details.percentage}%</div>
                                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Réussite</div>
                                    </div>
                                </Card>
                            </div>

                            {/* Questions List */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                                    <BookOpen className="w-5 h-5 text-primary" /> 
                                    Détail des questions
                                </h4>
                                
                                {details.questions && details.questions.map((question, qIndex) => (
                                    <Card key={question.id} className={`p-4 border ${question.is_correct ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'}`}>
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex-1">
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Question {qIndex + 1}</span>
                                                <p className="text-sm font-semibold text-foreground">{question.text_content}</p>
                                            </div>
                                            <div className="shrink-0 flex items-center gap-1">
                                                {question.is_correct ? (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-md">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> +{question.points} pts
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-md">
                                                        <XCircle className="w-3.5 h-3.5" /> 0 pt
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2 mt-3">
                                            {question.answers && question.answers.map((answer) => {
                                                const isSelected = question.selected_answer_id === answer.id;
                                                const isCorrectAnswer = answer.is_correct;
                                                
                                                let style = "border-border bg-card/50 text-muted-foreground"; // Default
                                                let icon = null;

                                                if (isSelected && isCorrectAnswer) {
                                                    style = "border-success bg-success/10 text-success font-semibold";
                                                    icon = <CheckCircle2 className="w-4 h-4" />;
                                                } else if (isSelected && !isCorrectAnswer) {
                                                    style = "border-destructive bg-destructive/10 text-destructive font-semibold";
                                                    icon = <XCircle className="w-4 h-4" />;
                                                } else if (!isSelected && isCorrectAnswer) {
                                                    style = "border-success/50 bg-success/5 text-success font-semibold";
                                                    icon = <Check className="w-4 h-4 opacity-50" />;
                                                }

                                                return (
                                                    <div key={answer.id} className={`p-3 text-sm rounded-lg border flex items-center justify-between gap-3 transition-colors ${style}`}>
                                                        <span>{answer.text_content}</span>
                                                        {icon && <span className="shrink-0">{icon}</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Floating Scroll Indicator */}
                {!hasScrolled && details?.questions && details.questions.length > 0 && (
                    <div className="absolute bottom-[72px] sm:bottom-[80px] left-0 right-0 p-4 bg-gradient-to-t from-background/90 via-background/60 to-transparent pointer-events-none flex flex-col items-center justify-end pb-8 animate-in slide-in-from-bottom-4 fade-in duration-500 z-10">
                        <div className="bg-primary text-primary-foreground shadow-lg px-5 py-2.5 rounded-full flex items-center gap-2 animate-bounce">
                            <span className="text-sm font-bold tracking-wide">Faites défiler pour voir les questions</span>
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex-none p-5 sm:p-6 border-t border-border bg-card flex justify-end">
                    <Button onClick={onClose} variant="default" className="w-full sm:w-auto">Fermer</Button>
                </div>
            </div>
        </div>
    );
}
