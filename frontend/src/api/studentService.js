import api from './axios';

export const studentDashboardApi = {
    getDashboardData: async () => {
        const response = await api.get('/student/dashboard');
        return response.data;
    }
};

export const studentQuizApi = {
    getQuizDetails: async (quizId) => {
        const response = await api.get(`/student/quizzes/${quizId}`);
        return response.data;
    },
    startQuiz: async (quizId) => {
        const response = await api.post(`/student/quizzes/${quizId}/start`);
        return response.data;
    },
    getQuestion: async (sessionId, questionId) => {
        const response = await api.get(`/student/sessions/${sessionId}/questions/${questionId}`);
        return response.data;
    },
    submitAnswer: async (sessionId, questionId, answerId) => {
        const response = await api.post(`/student/sessions/${sessionId}/questions/${questionId}/answer`, {
            answer_id: answerId
        });
        return response.data;
    },
    finishQuiz: async (sessionId) => {
        const response = await api.post(`/student/sessions/${sessionId}/finish`);
        return response.data;
    }
};

export const studentResultApi = {
    getResultsList: async () => {
        const response = await api.get('/student/results');
        return response.data;
    },
    getResultDetails: async (sessionId) => {
        const response = await api.get(`/student/results/${sessionId}`);
        return response.data;
    }
};
