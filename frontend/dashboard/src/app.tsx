import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppLayout } from './components/layout';
import { LoadingState } from './components/ui';
import { useAuth } from './lib/auth';
import {
  AuditLogsPage,
  BlogPage,
  ExperiencePage,
  InboxPage,
  LoginPage,
  MediaPage,
  OverviewPage,
  ProfilePage,
  ProjectsPage,
  SettingsPage,
  SkillsPage,
} from './pages';

function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading)
    return (
      <div className="screen-loading">
        <LoadingState label="Memeriksa sesi admin…" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <AppLayout />;
}

export function App() {
  const { user, loading } = useAuth();
  return (
    <Routes>
      <Route
        path="/login"
        element={
          loading ? (
            <div className="screen-loading">
              <LoadingState />
            </div>
          ) : user ? (
            <Navigate to="/" replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route element={<ProtectedRoute />}>
        <Route index element={<OverviewPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="skills" element={<SkillsPage />} />
        <Route path="experiences" element={<ExperiencePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="posts" element={<BlogPage />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="inbox" element={<InboxPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  );
}
