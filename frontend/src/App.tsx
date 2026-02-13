import { Navigate, Route, Routes } from 'react-router-dom';
import { useSession } from './context/SessionContext';
import FeedPage from './pages/Feed';
import LoginPage from './pages/Login';
import ProfilePage from './pages/Profile';
import SignupPage from './pages/Signup';
import NetworkPage from './pages/Network';
import MessagesPage from './pages/Messages';
import { Spinner } from './components/layout/Spinner';
import NavBar from './components/layout/NavBar';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <>
      <NavBar />
      <main className="pt-16">{children}</main>
    </>
  );
}

function App() {
  const { user, loading } = useSession();

  if (loading) return <Spinner label="Loading Vibe" full />;

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
      <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" replace />} />
      <Route path="/" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/profile/:id" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/network" element={<ProtectedRoute><NetworkPage /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
      <Route path="/messages/:conversationId" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  );
}

export default App;
