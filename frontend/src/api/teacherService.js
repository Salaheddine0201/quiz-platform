import api from './axios';

/* ============================================================
 *  APPELS API — ESPACE ENSEIGNANT
 *  Toutes les requêtes vers le backend Laravel sont centralisées ici.
 * ============================================================ */

/* Tableau de bord */
export const teacherDashboardApi = {
    getDashboardData: async () => {
        const { data } = await api.get('/teacher/dashboard');
        return data;
    },
};

/* Gestion des quiz (CRUD) */
export const teacherQuizApi = {
    getQuizzes: async () => {
        const { data } = await api.get('/teacher/quizzes');
        return data;
    },
    getQuiz: async (quizId) => {
        const { data } = await api.get(`/teacher/quizzes/${quizId}`);
        return data;
    },
    createQuiz: async (payload) => {
        const { data } = await api.post('/teacher/quizzes', payload);
        return data;
    },
    updateQuiz: async (quizId, payload) => {
        const { data } = await api.put(`/teacher/quizzes/${quizId}`, payload);
        return data;
    },
    deleteQuiz: async (quizId) => {
        const { data } = await api.delete(`/teacher/quizzes/${quizId}`);
        return data;
    },
};

/* Sessions / résultats des étudiants */
export const teacherSessionApi = {
    getSessions: async (quizId) => {
        const { data } = await api.get(`/teacher/quizzes/${quizId}/sessions`);
        return data;
    },
    getSessionDetail: async (quizId, sessionId) => {
        const { data } = await api.get(`/teacher/quizzes/${quizId}/sessions/${sessionId}`);
        return data;
    },
};

/* ============================================================
 *  STATUT D'UN QUIZ (logique métier côté front)
 *
 *  Le backend n'expose ni champ `status` ni `starts_at`. On déduit
 *  donc le statut à partir des données disponibles :
 *   - brouillon : aucune question (quiz non diffusable)
 *   - expire    : date d'expiration dépassée
 *   - actif     : sinon
 * ============================================================ */

export const QUIZ_STATUS = {
    actif: { label: 'Actif', className: 'bg-success/10 text-success', dot: 'bg-success' },
    expire: { label: 'Expiré', className: 'bg-destructive/10 text-destructive', dot: 'bg-destructive' },
    brouillon: { label: 'Brouillon', className: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
};

export function deriveQuizStatus(quiz) {
    if (!quiz) return 'brouillon';
    if ((quiz.questions_count ?? 0) === 0) return 'brouillon';
    if (quiz.is_expired) return 'expire';
    return 'actif';
}

/* Extrait la "matière" depuis le titre (ex: "Physique — Mécanique" -> "Physique"). */
export function getSubject(title) {
    if (!title) return 'Divers';
    return title.split(/—|-/)[0].trim() || title;
}