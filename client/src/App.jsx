import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import CoursePage from './pages/CoursePage';
import LessonPage from './pages/LessonPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourses from './pages/admin/AdminCourses';
import AdminCourseEdit from './pages/admin/AdminCourseEdit';
import AdminUsers from './pages/admin/AdminUsers';

import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '16px', background: '#0f172a', color: '#fff', fontSize: '14px', fontWeight: 'bold' }
          }}
        />
      <Routes>
        {/* Admin routes — no Navbar */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <Navbar />
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="courses/:id" element={<AdminCourseEdit />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* Main routes */}
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/catalog" element={<><Navbar /><Catalog /></>} />
        <Route path="/course/:id" element={<><Navbar /><CoursePage /></>} />
        <Route path="/login" element={<><Navbar /><Login /></>} />
        <Route path="/register" element={<><Navbar /><Register /></>} />
        <Route
          path="/lesson/:id"
          element={
            <ProtectedRoute>
              <Navbar />
              <LessonPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navbar />
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* Wildcard 404 */}
        <Route path="*" element={<><Navbar /><NotFound /></>} />
      </Routes>
      </AuthProvider>
    </LanguageProvider>
  );
}
