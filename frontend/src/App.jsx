import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import StudentLayout from './components/student/StudentLayout';
import QuizPlayer from './pages/student/QuizPlayer';
import ResultsList from './pages/student/ResultsList';
import TeacherLayout from './components/teacher/TeacherLayout';
import QuizManagement from './pages/teacher/QuizManagement';
import TeacherPlaceholder from './pages/teacher/TeacherPlaceholder';

const teacherOnly = (element) => (
  <ProtectedRoute allowedRoles={['enseignant']}>{element}</ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public / Auth */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* Fallback */}
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
          </Route>

          {/* Teacher Routes */}
          <Route element={<TeacherLayout />}>
            <Route path="/teacher/dashboard" element={teacherOnly(<TeacherDashboard />)} />
            <Route path="/teacher/quizzes" element={teacherOnly(<QuizManagement />)} />
            {/* À construire dans la prochaine itération */}
            <Route path="/teacher/quizzes/new" element={teacherOnly(<TeacherPlaceholder title="Créer un nouveau quiz" />)} />
            <Route path="/teacher/quizzes/:id" element={teacherOnly(<TeacherPlaceholder title="Détail du quiz" />)} />
            <Route path="/teacher/quizzes/:id/edit" element={teacherOnly(<TeacherPlaceholder title="Modifier le quiz" />)} />
            <Route path="/teacher/results" element={teacherOnly(<TeacherPlaceholder title="Résultats" />)} />
          </Route>
          {/* Rétro-compatibilité : ancienne URL */}
          <Route path="/teacher-dashboard" element={<Navigate to="/teacher/dashboard" replace />} />

          {/* Student Routes */}
          <Route element={<StudentLayout />}>
            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute allowedRoles={['etudiant']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/student/dashboard" element={<Navigate to="/student-dashboard" replace />} />
            <Route
              path="/student/results"
              element={
                <ProtectedRoute allowedRoles={['etudiant']}>
                  <ResultsList />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            path="/student/quiz/:id"
            element={
              <ProtectedRoute allowedRoles={['etudiant']}>
                <QuizPlayer />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;