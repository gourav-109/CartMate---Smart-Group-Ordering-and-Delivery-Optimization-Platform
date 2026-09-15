import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ActiveCartModal } from './components/ActiveCartModal';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { NewRequest } from './pages/NewRequest';
import { EditRequest } from './pages/EditRequest';
import { GroupDetail } from './pages/GroupDetail';
import { Profile } from './pages/Profile';

export const App = () => {
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar onOpenActiveCartModal={() => setIsCartModalOpen(true)} />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/new-request"
                element={
                  <ProtectedRoute>
                    <NewRequest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-request/:id"
                element={
                  <ProtectedRoute>
                    <EditRequest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/groups/:id"
                element={
                  <ProtectedRoute>
                    <GroupDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <ActiveCartModal
            isOpen={isCartModalOpen}
            onClose={() => setIsCartModalOpen(false)}
          />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
