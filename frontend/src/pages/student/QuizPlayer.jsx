import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizSession } from '../../hooks/student/useQuizSession';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, XCircle, CheckCircle2, FileText, GraduationCap } from 'lucide-react';
export default function QuizPlayer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        quizDetails,
        currentQuestion,
        progress,
        remainingSeconds,
        status,
        error,
        finalResult,
        submitAnswer
    } = useQuizSession(id);

    const [selectedAnswerId, setSelectedAnswerId] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // States for result UI
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        if (status === 'finished' && finalResult) {
            const targetScore = finalResult.score_on_20 ?? 0;

            let startTimestamp = null;
            const duration = 2000; // 2 seconds counter

            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                // easeOutExpo
                const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                setAnimatedScore(targetScore * easeProgress);

                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    setAnimatedScore(targetScore);
                }
            };
            window.requestAnimationFrame(step);
        }
    }, [status, finalResult]);

    const formatTime = (seconds) => {
        if (seconds === null) return '--:--';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const handleAnswerSubmit = () => {
        if (selectedAnswerId !== null) {
            submitAnswer(selectedAnswerId);
            setSelectedAnswerId(null);
        }
    };

    if (status === 'loading' || status === 'starting') {
        return (
            <div className="min-h-screen bg-background flex flex-col font-sans animate-pulse">
                <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card sticky top-0 shadow-sm">
                    <div className="w-32 h-6 bg-muted rounded-md"></div>
                    <div className="w-48 h-6 bg-muted rounded-md hidden md:block"></div>
                </header>
                <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 flex flex-col">
                        <div className="bg-muted rounded-t-2xl p-6 sm:p-8 h-32"></div>
                        <div className="bg-card border border-t-0 border-border rounded-b-2xl p-6 sm:p-8 shadow-sm flex-1 flex flex-col">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-muted rounded-xl"></div>)}
                            </div>
                            <div className="mt-auto flex justify-end">
                                <div className="w-48 h-12 bg-muted rounded-xl"></div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-64 shrink-0">
                        <div className="h-64 bg-card border border-border shadow-sm rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
                <Card className="p-8 max-w-md w-full text-center border-destructive/20 shadow-md">
                    <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-foreground mb-2">Erreur</h2>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <Button onClick={() => navigate('/student-dashboard')}>Retour au tableau de bord</Button>
                </Card>
            </div>
        );
    }

    if (status === 'finished' && finalResult) {
        const calculatedScoreOn20 = finalResult.score_on_20 ?? 0;
        const isPassed = finalResult.result === 'Réussi';
        const percentage = finalResult.percentage ?? 0;

        return (
            <div className="h-[calc(100vh-4rem)] w-full bg-background p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center animate-in fade-in duration-500">
                <div className="max-w-md w-full flex flex-col gap-6">

                    {/* Score Panel */}
                    <Card className="shadow-sm border-border bg-card p-8 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm ${isPassed ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                            {isPassed ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                        </div>
                        <h2 className="text-3xl font-extrabold text-foreground mb-2 text-center">Quiz terminé</h2>
                        <p className="text-muted-foreground text-center mb-10 font-medium">
                            {isPassed ? 'Félicitations, vous avez réussi !' : 'N\'abandonnez pas, la persévérance paie.'}
                        </p>

                        <div className="relative flex items-center justify-center mb-2">
                            <svg className="w-48 h-48 transform -rotate-90">
                                <circle cx="96" cy="96" r="88" className="stroke-muted/30" strokeWidth="12" fill="none" />
                                <circle
                                    cx="96" cy="96" r="88"
                                    className={`transition-all duration-[2000ms] ease-out ${isPassed ? 'stroke-success' : 'stroke-destructive'}`}
                                    strokeWidth="12"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray={2 * Math.PI * 88}
                                    strokeDashoffset={2 * Math.PI * 88 * (1 - (animatedScore / 20))}
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center">
                                <span className={`text-6xl font-black tracking-tighter ${isPassed ? 'text-success' : 'text-destructive'}`}>
                                    {animatedScore.toFixed(1)}
                                </span>
                                <span className="text-lg font-bold text-muted-foreground mt-1">/ 20</span>
                            </div>
                        </div>
                    </Card>

                    <Button
                        size="lg"
                        className="w-full h-16 rounded-xl text-lg font-bold shadow-sm"
                        onClick={() => navigate('/student-dashboard')}
                    >
                        Retour au tableau de bord
                    </Button>
                </div>
            </div>
        );
    }

    if (!currentQuestion) return null;

    const progressPercentage = (progress.current / progress.total) * 100;
    const timePercentage = remainingSeconds !== null && quizDetails?.duration_minutes
        ? (remainingSeconds / (quizDetails.duration_minutes * 60)) * 100
        : 100;
    const isLastQuestion = progress.current === progress.total;

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            {/* Topbar */}
            <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/student/dashboard')}>
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold shrink-0 group-hover:scale-105 transition-transform">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-foreground">Portail Scolaire</span>
                    </div>
                    <div className="h-8 w-px bg-border mx-2 hidden sm:block"></div>
                    <div className="hidden sm:block">
                        <h1 className="font-bold text-sm text-foreground leading-tight">{quizDetails?.title}</h1>
                        <p className="text-xs text-muted-foreground">Notation {quizDetails?.grading_system === 'standard' ? 'Standard' : 'Canadienne'} - {quizDetails?.questions_count} questions</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-sm font-medium text-muted-foreground hidden md:flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {progress.current}/{progress.total} répondues
                    </div>
                    {remainingSeconds !== null && (
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                                <div className={`flex items-center gap-1.5 font-bold font-mono transition-colors ${remainingSeconds <= 60 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
                                    <Clock className={`w-4 h-4 ${remainingSeconds <= 60 ? 'text-destructive' : 'text-muted-foreground'}`} />
                                    TEMPS <span className="ml-1 tracking-wider">{formatTime(remainingSeconds)}</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full mt-1 overflow-hidden">
                                    <div className="h-full bg-primary transition-all duration-1000 linear" style={{ width: `${timePercentage}%` }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">

                {/* Main Question Area */}
                <div key={currentQuestion.id} className="flex-1 flex flex-col animate-in slide-in-from-right fade-in duration-300">
                    <div className="bg-primary rounded-t-2xl p-6 sm:p-8 text-primary-foreground">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                Question {progress.current} sur {progress.total}
                            </span>
                            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                {currentQuestion.points} pt{currentQuestion.points > 1 ? 's' : ''}
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold leading-tight mt-2">
                            {currentQuestion.text_content}
                        </h2>
                    </div>

                    <div className="bg-card border border-t-0 border-border rounded-b-2xl p-6 sm:p-8 shadow-sm flex-1 flex flex-col">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            {currentQuestion.answers.map((answer, index) => {
                                const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
                                const isSelected = selectedAnswerId === answer.id;
                                return (
                                    <div
                                        key={answer.id}
                                        onClick={() => setSelectedAnswerId(answer.id)}
                                        className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${isSelected
                                                ? 'border-primary ring-1 ring-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50 hover:bg-muted/30'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mr-4 transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                            }`}>
                                            {letters[index] || index + 1}
                                        </div>
                                        <p className="font-medium text-foreground">{answer.text_content}</p>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-auto flex justify-end">
                            <Button
                                size="lg"
                                className="px-8 bg-primary/90 hover:bg-primary text-primary-foreground font-semibold rounded-xl text-base"
                                disabled={selectedAnswerId === null || status === 'submitting'}
                                onClick={() => {
                                    if (isLastQuestion) {
                                        setShowConfirmModal(true);
                                    } else {
                                        handleAnswerSubmit();
                                    }
                                }}
                            >
                                {status === 'submitting' ? 'Envoi...' : (isLastQuestion ? 'Terminer le Quiz' : 'Valider et continuer >')}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Navigation Info */}
                <div className="w-full lg:w-64 shrink-0">
                    <Card className="border-border shadow-sm sticky top-24">
                        <div className="p-5 border-b border-border">
                            <h3 className="font-bold text-xs uppercase text-muted-foreground tracking-wider mb-4">Navigation</h3>
                            <div className="flex flex-wrap gap-2">
                                {Array.from({ length: progress.total }).map((_, i) => {
                                    const qNum = i + 1;
                                    let stateClass = "bg-muted text-muted-foreground"; // non répondue
                                    if (qNum < progress.current) stateClass = "bg-success/20 text-success"; // validée
                                    if (qNum === progress.current) stateClass = "bg-primary text-primary-foreground"; // en cours

                                    return (
                                        <div key={qNum} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${stateClass}`}>
                                            {qNum}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-6 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                                    <span className="text-muted-foreground">En cours</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="w-3 h-3 rounded-full bg-success/40"></div>
                                    <span className="text-muted-foreground">Validée</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="w-3 h-3 rounded-full bg-muted"></div>
                                    <span className="text-muted-foreground">Non répondue</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between text-sm font-semibold text-foreground mb-2">
                                <span>Progression</span>
                                <span>{progress.current}/{progress.total}</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mb-4">
                                <div className="h-full bg-primary" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                            {quizDetails?.duration_minutes && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                    <Clock className="w-4 h-4" />
                                    {quizDetails.duration_minutes} min au total
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Confirm Submission Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-card border border-border shadow-lg rounded-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-foreground mb-2">Terminer le Quiz ?</h3>
                        <p className="text-muted-foreground text-sm mb-6">
                            Vous êtes sur le point de soumettre votre dernière réponse. Voulez-vous vraiment terminer le quiz ?
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={status === 'submitting'}>
                                Annuler
                            </Button>
                            <Button
                                className="bg-primary text-primary-foreground"
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    handleAnswerSubmit();
                                }}
                                disabled={status === 'submitting'}
                            >
                                {status === 'submitting' ? 'Envoi...' : 'Oui, terminer'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
