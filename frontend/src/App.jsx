import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/Layout/DashboardLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentsPage } from './pages/admin/StudentsPage';
import { WardensPage } from './pages/admin/WardensPage';
import { SecurityStaffPage } from './pages/admin/SecurityStaffPage';
import { HostelsRoomsPage } from './pages/admin/HostelsRoomsPage';
import { RoomAllocationPage } from './pages/admin/RoomAllocationPage';
import { FeesPaymentsPage } from './pages/admin/FeesPaymentsPage';
import { FoodMenuAdminPage } from './pages/admin/FoodMenuAdminPage';
import { ComplaintsAdminPage } from './pages/admin/ComplaintsAdminPage';
import { AttendanceAdminPage } from './pages/admin/AttendanceAdminPage';
import { VisitorsAdminPage } from './pages/admin/VisitorsAdminPage';
import { NoticesAdminPage } from './pages/admin/NoticesAdminPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { SettingsPage } from './pages/admin/SettingsPage';

// Warden Pages
import { WardenDashboard } from './pages/warden/WardenDashboard';
import { WardenProfilePage } from './pages/warden/WardenProfilePage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentRoomPage } from './pages/student/StudentRoomPage';
import { StudentFoodMenuPage } from './pages/student/StudentFoodMenuPage';
import { StudentComplaintsPage } from './pages/student/StudentComplaintsPage';
import { StudentFeesPage } from './pages/student/StudentFeesPage';
import { StudentNoticesPage } from './pages/student/StudentNoticesPage';

// Security Pages
import { SecurityDashboard } from './pages/security/SecurityDashboard';
import { VisitorRegisterPage } from './pages/security/VisitorRegisterPage';
import { VisitorEntryExitPage } from './pages/security/VisitorEntryExitPage';
import { VisitorHistoryPage } from './pages/security/VisitorHistoryPage';
import { SecurityProfilePage } from './pages/security/SecurityProfilePage';

const RootRedirect = () => {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (role === 'WARDEN') return <Navigate to="/warden" replace />;
  if (role === 'STUDENT') return <Navigate to="/student" replace />;
  if (role === 'SECURITY') return <Navigate to="/security" replace />;
  return <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Administrator Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="wardens" element={<WardensPage />} />
              <Route path="security" element={<SecurityStaffPage />} />
              <Route path="rooms" element={<HostelsRoomsPage />} />
              <Route path="allocations" element={<RoomAllocationPage />} />
              <Route path="fees" element={<FeesPaymentsPage />} />
              <Route path="food-menu" element={<FoodMenuAdminPage />} />
              <Route path="complaints" element={<ComplaintsAdminPage />} />
              <Route path="attendance" element={<AttendanceAdminPage />} />
              <Route path="visitors" element={<VisitorsAdminPage />} />
              <Route path="notices" element={<NoticesAdminPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Warden Routes */}
          <Route element={<ProtectedRoute allowedRoles={['WARDEN']} />}>
            <Route path="/warden" element={<DashboardLayout />}>
              <Route index element={<WardenDashboard />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="allocations" element={<RoomAllocationPage />} />
              <Route path="attendance" element={<AttendanceAdminPage />} />
              <Route path="visitors" element={<VisitorsAdminPage />} />
              <Route path="complaints" element={<ComplaintsAdminPage />} />
              <Route path="food-menu" element={<FoodMenuAdminPage />} />
              <Route path="notices" element={<NoticesAdminPage />} />
              <Route path="profile" element={<WardenProfilePage />} />
            </Route>
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="/student" element={<DashboardLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="profile" element={<StudentProfilePage />} />
              <Route path="room" element={<StudentRoomPage />} />
              <Route path="food-menu" element={<StudentFoodMenuPage />} />
              <Route path="complaints" element={<StudentComplaintsPage />} />
              <Route path="fees" element={<StudentFeesPage />} />
              <Route path="notices" element={<StudentNoticesPage />} />
            </Route>
          </Route>

          {/* Security Staff Routes */}
          <Route element={<ProtectedRoute allowedRoles={['SECURITY']} />}>
            <Route path="/security" element={<DashboardLayout />}>
              <Route index element={<SecurityDashboard />} />
              <Route path="register" element={<VisitorRegisterPage />} />
              <Route path="visitors" element={<VisitorEntryExitPage />} />
              <Route path="history" element={<VisitorHistoryPage />} />
              <Route path="profile" element={<SecurityProfilePage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
