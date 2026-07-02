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

/* Questions (l'éditeur envoie la question avec son tableau `answers`) */
export const teacherQuestionApi = {
    addQuestion: async (quizId, payload) => {
        const { data } = await api.post(`/teacher/quizzes/${quizId}/questions`, payload);
        return data;
    },
    updateQuestion: async (questionId, payload) => {
        const { data } = await api.put(`/teacher/questions/${questionId}`, payload);
        return data;
    },
    deleteQuestion: async (questionId) => {
        const { data } = await api.delete(`/teacher/questions/${questionId}`);
        return data;
    },
};

/* Réponses (utilisé pour l'édition fine d'une réponse existante) */
export const teacherAnswerApi = {
    addAnswer: async (questionId, payload) => {
        const { data } = await api.post(`/teacher/questions/${questionId}/answers`, payload);
        return data;
    },
    updateAnswer: async (answerId, payload) => {
        const { data } = await api.put(`/teacher/answers/${answerId}`, payload);
        return data;
    },
    deleteAnswer: async (answerId) => {
        const { data } = await api.delete(`/teacher/answers/${answerId}`);
        return data;
    },
};

/* Affectation des étudiants */
export const teacherAssignmentApi = {
    getAssignments: async (quizId) => {
        const { data } = await api.get(`/teacher/quizzes/${quizId}/assignments`);
        return data;
    },
    assignStudents: async (quizId, userIds) => {
        const { data } = await api.post(`/teacher/quizzes/${quizId}/assignments`, { user_ids: userIds });
        return data;
    },
    removeAssignment: async (quizId, userId) => {
        const { data } = await api.delete(`/teacher/quizzes/${quizId}/assignments/${userId}`);
        return data;
    },
};

/* Recherche d'étudiants (pour la double-liste d'affectation) */
export const teacherStudentApi = {
    searchStudents: async ({ search = '', quizId = null } = {}) => {
        const params = {};
        if (search) params.search = search;
        if (quizId) params.quiz_id = quizId;
        const { data } = await api.get('/teacher/students', { params });
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