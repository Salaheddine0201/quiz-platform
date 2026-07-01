import { useState, useEffect, useCallback, useRef } from 'react';
import { studentQuizApi, studentResultApi } from '../../api/studentService';

export function useQuizSession(quizId) {
    const [quizDetails, setQuizDetails] = useState(null);
    const [sessionData, setSessionData] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [remainingSeconds, setRemainingSeconds] = useState(null);
    const [status, setStatus] = useState('loading'); // loading, starting, in_progress, submitting, finished, error
    const [error, setError] = useState(null);
    const [finalResult, setFinalResult] = useState(null);

    const timerRef = useRef(null);

    const fetchDetailsAndStart = useCallback(async () => {
        try {
            setStatus('starting');
            // Fetch basic details first
            const details = await studentQuizApi.getQuizDetails(quizId);
            setQuizDetails(details);

            // Start or resume session
            const startData = await studentQuizApi.startQuiz(quizId);
            if (startData.auto_submitted) {
                const resultDetails = await studentResultApi.getResultDetails(startData.session_id);
                setFinalResult(resultDetails);
                setStatus('finished');
                return;
            }

            setSessionData(startData);
            setRemainingSeconds(startData.remaining_seconds);
            
            // Load the question
            await loadQuestion(startData.session_id, startData.current_question_id);
            
            setStatus('in_progress');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du démarrage du quiz.');
            setStatus('error');
        }
    }, [quizId]);

    const loadQuestion = async (sessionId, questionId) => {
        try {
            const data = await studentQuizApi.getQuestion(sessionId, questionId);
            if (data.auto_submitted) {
                const resultDetails = await studentResultApi.getResultDetails(data.session_id);
                setFinalResult(resultDetails);
                setStatus('finished');
                return;
            }
            setCurrentQuestion(data.question);
            setProgress(data.progress);
            if (data.remaining_seconds !== undefined) {
                setRemainingSeconds(data.remaining_seconds);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du chargement de la question.');
            setStatus('error');
        }
    };

    const submitAnswer = async (answerId) => {
        if (!sessionData || !currentQuestion || status !== 'in_progress') return;
        
        try {
            setStatus('submitting');
            const data = await studentQuizApi.submitAnswer(
                sessionData.session_id,
                currentQuestion.id,
                answerId
            );

            if (data.auto_submitted || data.is_last) {
                const resultDetails = await studentResultApi.getResultDetails(data.session_id);
                setFinalResult(resultDetails);
                setStatus('finished');
            } else {
                await loadQuestion(sessionData.session_id, data.next_question_id);
                setStatus('in_progress');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la soumission de la réponse.');
            setStatus('error');
        }
    };

    const forceFinish = async () => {
        if (!sessionData || status !== 'in_progress') return;
        try {
            setStatus('submitting');
            const data = await studentQuizApi.finishQuiz(sessionData.session_id);
            const resultDetails = await studentResultApi.getResultDetails(data.session_id);
            setFinalResult(resultDetails);
            setStatus('finished');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la clôture du quiz.');
            setStatus('error');
        }
    };

    useEffect(() => {
        fetchDetailsAndStart();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [fetchDetailsAndStart]);

    // Timer logic
    useEffect(() => {
        if (status === 'in_progress' && remainingSeconds !== null && remainingSeconds > 0) {
            timerRef.current = setInterval(() => {
                setRemainingSeconds(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        forceFinish(); // auto submit when time is up
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status, remainingSeconds]);

    return {
        quizDetails,
        currentQuestion,
        progress,
        remainingSeconds,
        status,
        error,
        finalResult,
        submitAnswer,
        forceFinish
    };
}
