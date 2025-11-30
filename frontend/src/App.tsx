import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { CreateWorkspaceProvider } from './contexts/CreateWorkspaceContext';
import { CreateTeamProvider } from './contexts/CreateTeamContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WorkspaceDetail from './pages/WorkspaceDetail';
import PageEditor from './pages/PageEditor';
import Ideas from './pages/Ideas';
import Teams from './pages/Teams';
import TeamDetail from './pages/TeamDetail';
import Settings from './pages/Settings';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore();
  
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <CreateWorkspaceProvider>
      <CreateTeamProvider>
        <Router>
          <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="workspaces/:workspaceId" element={<WorkspaceDetail />} />
              <Route path="pages/:pageId" element={<PageEditor />} />
              <Route path="ideas" element={<Ideas />} />
              <Route path="teams" element={<Teams />} />
              <Route path="teams/:teamId" element={<TeamDetail />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
      </CreateTeamProvider>
    </CreateWorkspaceProvider>
  );
}

export default App;

