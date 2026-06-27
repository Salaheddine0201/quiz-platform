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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route 
              path="/teacher-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['enseignant']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            {/* Fallback */}
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
          </Route>

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
            <Route 
              path="/student/dashboard" 
              element={<Navigate to="/student-dashboard" replace />} 
            />
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
