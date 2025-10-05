import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import NavigationNew from './components/NavigationNew';
import HomePage from './components/HomePage';
import LoginPageNew from './components/LoginPageNew';
import RegisterPage from './components/RegisterPage';
import RoleBasedDashboard from './components/RoleBasedDashboard';
import UserManagementEnhanced from './components/UserManagementEnhanced';
import Analytics from './components/Analytics';
import WorkflowManagement from './components/WorkflowManagement';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import HelpPage from './components/HelpPage';
import ReportsPage from './components/ReportsPage';
import SecurityPage from './components/SecurityPage';
import ModerationPage from './components/ModerationPage';
import ApprovalsPage from './components/ApprovalsPage';
import ActivityPage from './components/ActivityPage';
import AccountPage from './components/AccountPage';
import SystemStatus from './components/SystemStatus';
import EmailConfirmationPage from './components/EmailConfirmationPage';
import EmailVerificationPage from './components/EmailVerificationPage';
import './App.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

// Layout Component
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationNew />
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              <Layout>
                <HomePage />
              </Layout>
            } 
          />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPageNew />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/email-confirmation" 
            element={
              <PublicRoute>
                <EmailConfirmationPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/verify-email" 
            element={
              <PublicRoute>
                <EmailVerificationPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/email-verification" 
            element={
              <PublicRoute>
                <EmailVerificationPage />
              </PublicRoute>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout>
                  <RoleBasedDashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <Layout>
                  <UserManagementEnhanced />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Analytics />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workflows" 
            element={
              <ProtectedRoute>
                <Layout>
                  <WorkflowManagement />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/help" 
            element={
              <ProtectedRoute>
                <Layout>
                  <HelpPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ReportsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/security" 
            element={
              <ProtectedRoute>
                <Layout>
                  <SecurityPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/moderation" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ModerationPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/approvals" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ApprovalsPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/activity" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ActivityPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/account" 
            element={
              <ProtectedRoute>
                <Layout>
                  <AccountPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/status" 
            element={
              <ProtectedRoute>
                <Layout>
                  <SystemStatus />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-workflows" 
            element={
              <ProtectedRoute>
                <Layout>
                  <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h2 style={{ color: '#111827', marginBottom: '1rem' }}>My Workflows</h2>
                    <p style={{ color: '#6b7280' }}>
                      Your workflow requests and submissions will appear here.
                    </p>
                  </div>
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Catch-all route */}
          <Route 
            path="*" 
            element={
              <Layout>
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-8">Page not found</p>
                    <a 
                      href="/" 
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Go Home
                    </a>
                  </div>
                </div>
              </Layout>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
