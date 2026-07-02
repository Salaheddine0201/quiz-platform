import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import {
    teacherQuizApi, teacherQuestionApi, teacherAssignmentApi, teacherStudentApi,
} from '@/api/teacherService';
import {
    ArrowLeft, Plus, Trash2, Save, Check, ChevronRight, ChevronLeft,
    ChevronsRight, ChevronsLeft, CircleCheck, CircleAlert,
} from 'lucide-react';

let uid = 0;
const nextId = () => `local-${++uid}`;

const emptyAnswer = () => ({ localId: nextId(), text_content: '', is_correct: false });
const emptyQuestion = () => ({
    localId: nextId(),
    serverId: null,
    text_content: '',
    points: 1,
    penalty_points: 0,
    answers: [emptyAnswer(), emptyAnswer(), emptyAnswer(), emptyAnswer()],
});

/* Une question est complète si : énoncé ≥ 3 caractères, ≥ 2 réponses
   non vides et exactement une (au moins) marquée correcte. */
function isQuestionComplete(q) {
    const filled = q.answers.filter((a) => a.text_content.trim().length > 0);
    const hasCorrect = q.answers.some((a) => a.is_correct && a.text_content.trim().length > 0);
    return q.text_content.trim().length >= 3 && filled.length >= 2 && hasCorrect;
}

export default function QuizEditor() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [meta, setMeta] = useState({
        title: '',
        description: '',
        duration_minutes: 30,
        expires_at: '',
        grading_system: 'standard',
    });
    const [questions, setQuestions] = useState([emptyQuestion()]);
    const [deletedQuestionIds, setDeletedQuestionIds] = useState([]);

    const [available, setAvailable] = useState([]);
    const [assigned, setAssigned] = useState([]);
    const [originalAssignedIds, setOriginalAssignedIds] = useState([]);
    const [studentSearch, setStudentSearch] = useState('');

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    /* -------- Chargement des données -------- */
    useEffect(() => {
        let active = true;
        (async () => {
            try {
                // Liste des étudiants disponibles (exclut ceux déjà affectés en mode édition).
                const studentsRes = await teacherStudentApi.searchStudents(isEdit ? { quizId: id } : {});
                if (active) setAvailable(studentsRes.students ?? []);

                if (isEdit) {
                    const [{ quiz }, assignRes] = await Promise.all([
                        teacherQuizApi.getQuiz(id),
                        teacherAssignmentApi.getAssignments(id),
                    ]);
                    if (!active) return;

                    setMeta({
                        title: quiz.title ?? '',
                        description: quiz.description ?? '',
                        duration_minutes: quiz.duration_minutes ?? 30,
                        expires_at: quiz.expires_at ? String(quiz.expires_at).slice(0, 16) : '',
                        grading_system: quiz.grading_system ?? 'standard',
                    });

                    setQuestions((quiz.questions ?? []).map((q) => ({
                        localId: nextId(),
                        serverId: q.id,
                        text_content: q.text_content,
                        points: q.points,
                        penalty_points: q.penalty_points ?? 0,
                        answers: q.answers.map((a) => ({
                            localId: nextId(), serverId: a.id, text_content: a.text_content, is_correct: a.is_correct,
                        })),
                    })));

                    const assignedStudents = assignRes.assignments ?? [];
                    setAssigned(assignedStudents);
                    setOriginalAssignedIds(assignedStudents.map((s) => s.id));
                }
            } catch (err) {
                console.error(err);
                if (active) setError('Erreur lors du chargement.');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [id, isEdit]);

    /* -------- Métadonnées -------- */
    const setMetaField = (field, value) => setMeta((m) => ({ ...m, [field]: value }));

    /* -------- Questions -------- */
    const addQuestion = () => setQuestions((qs) => [...qs, emptyQuestion()]);

    const removeQuestion = (localId) => {
        setQuestions((qs) => {
            const target = qs.find((q) => q.localId === localId);
            if (target?.serverId) setDeletedQuestionIds((ids) => [...ids, target.serverId]);
            return qs.filter((q) => q.localId !== localId);
        });
    };

    const updateQuestion = (localId, patch) =>
        setQuestions((qs) => qs.map((q) => (q.localId === localId ? { ...q, ...patch } : q)));

    const updateAnswer = (qLocalId, aLocalId, patch) =>
        setQuestions((qs) => qs.map((q) => (
            q.localId !== qLocalId ? q : {
                ...q,
                answers: q.answers.map((a) => (a.localId === aLocalId ? { ...a, ...patch } : a)),
            }
        )));

    const setCorrectAnswer = (qLocalId, aLocalId) =>
        setQuestions((qs) => qs.map((q) => (
            q.localId !== qLocalId ? q : {
                ...q,
                answers: q.answers.map((a) => ({ ...a, is_correct: a.localId === aLocalId })),
            }
        )));

    const addAnswer = (qLocalId) =>
        setQuestions((qs) => qs.map((q) => (
            q.localId === qLocalId && q.answers.length < 6 ? { ...q, answers: [...q.answers, emptyAnswer()] } : q
        )));

    const removeAnswer = (qLocalId, aLocalId) =>
        setQuestions((qs) => qs.map((q) => (
            q.localId === qLocalId && q.answers.length > 2
                ? { ...q, answers: q.answers.filter((a) => a.localId !== aLocalId) }
                : q
        )));

    /* -------- Affectation étudiants (double-liste) -------- */
    const assign = (student) => {
        setAssigned((a) => [...a, student]);
        setAvailable((a) => a.filter((s) => s.id !== student.id));
    };
    const unassign = (student) => {
        setAvailable((a) => [...a, student]);
        setAssigned((a) => a.filter((s) => s.id !== student.id));
    };
    const assignAll = () => { setAssigned((a) => [...a, ...available]); setAvailable([]); };
    const unassignAll = () => { setAvailable((a) => [...a, ...assigned]); setAssigned([]); };

    const filteredAvailable = useMemo(() => (
        available.filter((s) => {
            const q = studentSearch.toLowerCase();
            return !studentSearch || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
        })
    ), [available, studentSearch]);

    /* -------- Validation (checklist RG-12) -------- */
    const checks = useMemo(() => {
        const titleOk = meta.title.trim().length >= 3;
        const expiryOk = !meta.expires_at || new Date(meta.expires_at) > new Date();
        const allQuestionsComplete = questions.length > 0 && questions.every(isQuestionComplete);
        return [
            { key: 'title', label: 'Titre renseigné (≥ 3 caractères)', ok: titleOk },
            { key: 'expiry', label: "Date d'expiration dans le futur (ou vide)", ok: expiryOk },
            { key: 'questions', label: 'Au moins une question, toutes complètes', ok: allQuestionsComplete },
            { key: 'students', label: 'Au moins un étudiant affecté', ok: assigned.length > 0 },
        ];
    }, [meta, questions, assigned]);

    const canPublish = checks.every((c) => c.ok) && !saving;

    /* -------- Publication -------- */
    const handlePublish = async () => {
        setError(null);
        setSaving(true);
        try {
            const payloadMeta = {
                title: meta.title.trim(),
                description: meta.description?.trim() || null,
                duration_minutes: meta.duration_minutes ? Number(meta.duration_minutes) : null,
                expires_at: meta.expires_at || null,
                grading_system: meta.grading_system,
            };

            let quizId = id;

            if (isEdit) {
                await teacherQuizApi.updateQuiz(id, payloadMeta);
                // Supprimer les questions retirées
                for (const qid of deletedQuestionIds) {
                    await teacherQuestionApi.deleteQuestion(qid);
                }
                // Ajouter les nouvelles questions (celles sans serverId)
                for (const q of questions.filter((q) => !q.serverId)) {
                    await teacherQuestionApi.addQuestion(id, buildQuestionPayload(q));
                }
            } else {
                const { quiz } = await teacherQuizApi.createQuiz(payloadMeta);
                quizId = quiz.id;
                // Le backend exige au moins une question avant d'affecter des étudiants.
                for (const q of questions) {
                    await teacherQuestionApi.addQuestion(quizId, buildQuestionPayload(q));
                }
            }

            // Affectations : on calcule les ajouts et retraits par rapport à l'état initial.
            const assignedIds = assigned.map((s) => s.id);
            const toAdd = assignedIds.filter((sid) => !originalAssignedIds.includes(sid));
            const toRemove = originalAssignedIds.filter((sid) => !assignedIds.includes(sid));

            if (toAdd.length > 0) await teacherAssignmentApi.assignStudents(quizId, toAdd);
            for (const sid of toRemove) {
                await teacherAssignmentApi.removeAssignment(quizId, sid);
            }

            navigate('/teacher/quizzes');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message
                || Object.values(err.response?.data?.errors ?? {})[0]?.[0]
                || 'Une erreur est survenue lors de l\'enregistrement.';
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSkeleton />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-16">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <button onClick={() => navigate('/teacher/quizzes')} className="p-2 rounded-lg hover:bg-muted text-muted-foreground mt-1" title="Retour">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{isEdit ? 'Modifier le quiz' : 'Créer un nouveau quiz'}</h1>
                        <p className="text-muted-foreground">Affectation directe — sans code d'accès</p>
                    </div>
                </div>
                <Button className="gap-2 shrink-0" onClick={handlePublish} disabled={!canPublish}>
                    <Save className="w-4 h-4" /> {saving ? 'Enregistrement…' : (isEdit ? 'Enregistrer' : 'Publier le quiz')}
                </Button>
            </div>

            {error && (
                <div className="rounded-lg bg-destructive/10 text-destructive px-4 py-3 text-sm font-medium">{error}</div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Colonne gauche : infos + checklist */}
                <div className="space-y-6">
                    <Card className="shadow-sm border-border">
                        <CardContent className="p-6 space-y-4">
                            <h2 className="font-bold text-foreground">Informations générales</h2>

                            <div>
                                <Label className="mb-1.5 block">Titre</Label>
                                <Input value={meta.title} onChange={(e) => setMetaField('title', e.target.value)} placeholder="Évaluation de Mathématiques…" />
                            </div>
                            <div>
                                <Label className="mb-1.5 block">Description</Label>
                                <textarea
                                    value={meta.description}
                                    onChange={(e) => setMetaField('description', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
                                    placeholder="Description du quiz (facultatif)"
                                />
                            </div>
                            <div>
                                <Label className="mb-1.5 block">Durée (minutes)</Label>
                                <Input type="number" min="1" max="480" value={meta.duration_minutes} onChange={(e) => setMetaField('duration_minutes', e.target.value)} />
                            </div>
                            <div>
                                <Label className="mb-1.5 block">Date d'expiration</Label>
                                <Input type="datetime-local" value={meta.expires_at} onChange={(e) => setMetaField('expires_at', e.target.value)} />
                            </div>
                            <div>
                                <Label className="mb-1.5 block">Système de notation</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { key: 'standard', label: 'Standard' },
                                        { key: 'canadien', label: 'Canadien (−pts)' },
                                    ].map((g) => (
                                        <button
                                            key={g.key}
                                            onClick={() => setMetaField('grading_system', g.key)}
                                            className={`py-2 rounded-md text-sm font-semibold border transition-colors ${
                                                meta.grading_system === g.key
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-border text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {g.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-border">
                        <CardContent className="p-6">
                            <h2 className="font-bold text-foreground mb-4">Vérification</h2>
                            <ul className="space-y-2.5">
                                {checks.map((c) => (
                                    <li key={c.key} className="flex items-center gap-2 text-sm">
                                        {c.ok
                                            ? <CircleCheck className="w-4 h-4 text-success shrink-0" />
                                            : <CircleAlert className="w-4 h-4 text-muted-foreground shrink-0" />}
                                        <span className={c.ok ? 'text-foreground' : 'text-muted-foreground'}>{c.label}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Colonne droite : étudiants + questions */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Double-liste d'affectation */}
                    <Card className="shadow-sm border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-foreground">Affectation des étudiants</h2>
                                <span className="text-xs font-semibold text-muted-foreground">{assigned.length} affecté(s)</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
                                {/* Disponibles */}
                                <div className="border border-border rounded-lg overflow-hidden flex flex-col">
                                    <div className="px-3 py-2 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Disponibles ({available.length})
                                    </div>
                                    <div className="p-2">
                                        <Input placeholder="Rechercher…" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} className="mb-2 h-8 text-sm" />
                                    </div>
                                    <StudentList list={filteredAvailable} onPick={assign} action="add" />
                                </div>

                                {/* Boutons de transfert */}
                                <div className="flex sm:flex-col items-center justify-center gap-2">
                                    <TransferBtn onClick={assignAll} disabled={available.length === 0} title="Tout affecter"><ChevronsRight className="w-4 h-4" /></TransferBtn>
                                    <TransferBtn onClick={unassignAll} disabled={assigned.length === 0} title="Tout retirer"><ChevronsLeft className="w-4 h-4" /></TransferBtn>
                                </div>

                                {/* Affectés */}
                                <div className="border border-border rounded-lg overflow-hidden flex flex-col">
                                    <div className="px-3 py-2 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Affectés ({assigned.length})
                                    </div>
                                    <StudentList list={assigned} onPick={unassign} action="remove" empty="Aucun étudiant affecté" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Questions */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Questions ({questions.length})</h2>
                            <p className="text-sm text-muted-foreground">
                                {questions.filter(isQuestionComplete).length} complète(s) · {questions.filter((q) => !isQuestionComplete(q)).length} à remplir
                            </p>
                        </div>
                        <Button variant="outline" className="gap-2" onClick={addQuestion}>
                            <Plus className="w-4 h-4" /> Ajouter une question
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {questions.map((q, idx) => (
                            <QuestionCard
                                key={q.localId}
                                index={idx}
                                question={q}
                                onRemove={() => removeQuestion(q.localId)}
                                onUpdate={(patch) => updateQuestion(q.localId, patch)}
                                onUpdateAnswer={(aId, patch) => updateAnswer(q.localId, aId, patch)}
                                onSetCorrect={(aId) => setCorrectAnswer(q.localId, aId)}
                                onAddAnswer={() => addAnswer(q.localId)}
                                onRemoveAnswer={(aId) => removeAnswer(q.localId, aId)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* Construit le payload d'une question tel qu'attendu par StoreQuestionRequest. */
function buildQuestionPayload(q) {
    return {
        text_content: q.text_content.trim(),
        points: Number(q.points),
        penalty_points: Number(q.penalty_points) || 0,
        answers: q.answers
            .filter((a) => a.text_content.trim().length > 0)
            .map((a) => ({ text_content: a.text_content.trim(), is_correct: Boolean(a.is_correct) })),
    };
}

function TransferBtn({ children, ...props }) {
    return (
        <button
            {...props}
            className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
            {children}
        </button>
    );
}

function StudentList({ list, onPick, action, empty = 'Aucun étudiant' }) {
    return (
        <div className="flex-1 max-h-56 overflow-y-auto p-2 space-y-1">
            {list.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">{empty}</p>
            ) : (
                list.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => onPick(s)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors text-left"
                    >
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                            {(s.name ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                        </div>
                        {action === 'add' ? <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" />}
                    </button>
                ))
            )}
        </div>
    );
}

function QuestionCard({ index, question, onRemove, onUpdate, onUpdateAnswer, onSetCorrect, onAddAnswer, onRemoveAnswer }) {
    const complete = isQuestionComplete(question);
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

    return (
        <Card className={`shadow-sm border-l-4 ${complete ? 'border-l-success border-border' : 'border-l-orange-400 border-border'}`}>
            <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">{index + 1}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${complete ? 'bg-success/10 text-success' : 'bg-orange-100 text-orange-600'}`}>
                            {complete ? 'Complète' : 'Incomplète'}
                        </span>
                    </div>
                    <button onClick={onRemove} className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors" title="Supprimer la question">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <div>
                    <Label className="mb-1.5 block">Énoncé de la question</Label>
                    <textarea
                        value={question.text_content}
                        onChange={(e) => onUpdate({ text_content: e.target.value })}
                        rows={2}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
                        placeholder="Saisissez l'énoncé…"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label className="mb-1.5 block">Points</Label>
                        <Input type="number" min="0.5" max="100" step="0.5" value={question.points} onChange={(e) => onUpdate({ points: e.target.value })} />
                    </div>
                    <div>
                        <Label className="mb-1.5 block">Pénalité (mode canadien)</Label>
                        <Input type="number" min="0" max="100" step="0.5" value={question.penalty_points} onChange={(e) => onUpdate({ penalty_points: e.target.value })} />
                    </div>
                </div>

                <div>
                    <Label className="mb-2 block">Réponses — cochez la bonne réponse</Label>
                    <div className="space-y-2">
                        {question.answers.map((a, i) => (
                            <div key={a.localId} className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-md bg-muted text-muted-foreground text-sm font-semibold flex items-center justify-center shrink-0">{letters[i]}</span>
                                <Input
                                    value={a.text_content}
                                    onChange={(e) => onUpdateAnswer(a.localId, { text_content: e.target.value })}
                                    placeholder={`Réponse ${letters[i]}`}
                                    className="flex-1"
                                />
                                <button
                                    onClick={() => onSetCorrect(a.localId)}
                                    title="Marquer comme bonne réponse"
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${
                                        a.is_correct ? 'border-success bg-success text-white' : 'border-border text-transparent hover:border-success'
                                    }`}
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                {question.answers.length > 2 && (
                                    <button onClick={() => onRemoveAnswer(a.localId)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors shrink-0" title="Retirer">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    {question.answers.length < 6 && (
                        <button onClick={onAddAnswer} className="mt-2 text-sm text-primary font-medium hover:underline flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" /> Ajouter une réponse
                        </button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}