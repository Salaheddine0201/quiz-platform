import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StudentDashboard from './pages/StudentDashboard';
import StudentLayout from './components/student/StudentLayout';
import QuizPlayer from './pages/student/QuizPlayer';
import ResultsList from './pages/student/ResultsList';
import ProtectedRoute from './components/ProtectedRoute';
import TeacherLayout from './components/teacher/TeacherLayout';
import TeacherDashboard from './pages/TeacherDashboard';
import QuizManagement from './pages/teacher/QuizManagement';
import Results from './pages/teacher/Results';
import QuizResults from './pages/teacher/QuizResults';
import SessionDetail from './pages/teacher/SessionDetail';
import QuizEditor from './pages/teacher/QuizEditor';


const teacherOnly = (element) => (
  <ProtectedRoute allowedRoles={['enseignant']}>{element}</ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Pages publiques / authentification */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Espace enseignant */}
          <Route element={<TeacherLayout />}>
            <Route path="/teacher/dashboard" element={teacherOnly(<TeacherDashboard />)} />
            <Route path="/teacher/quizzes" element={teacherOnly(<QuizManagement />)} />
            {/* Gérées par d'autres membres de l'équipe */}
            <Route path="/teacher/quizzes/new" element={teacherOnly(<QuizEditor />)} />
            <Route path="/teacher/quizzes/:id" element={teacherOnly(<QuizEditor />)} />
            <Route path="/teacher/quizzes/:id/edit" element={teacherOnly(<QuizEditor />)} />
            <Route path="/teacher/results" element={teacherOnly(<Results />)} />
            <Route path="/teacher/quizzes/:quizId/results" element={teacherOnly(<QuizResults />)} />
            <Route path="/teacher/quizzes/:quizId/sessions/:sessionId" element={teacherOnly(<SessionDetail />)} />
          </Route>
          {/* Rétro-compatibilité avec l'ancienne URL */}
          <Route path="/teacher-dashboard" element={<Navigate to="/teacher/dashboard" replace />} />

          {/* Espace étudiant */}
          <Route element={<StudentLayout />}>
            <Route path="/student-dashboard" element={<ProtectedRoute allowedRoles={['etudiant']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/results" element={<ProtectedRoute allowedRoles={['etudiant']}><ResultsList /></ProtectedRoute>} />
          </Route>
          <Route path="/student/quiz/:id" element={<ProtectedRoute allowedRoles={['etudiant']}><QuizPlayer /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;