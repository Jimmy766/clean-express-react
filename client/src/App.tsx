import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Recharge } from './pages/Recharge';
import { Payment } from './pages/Payment';
import { History } from './pages/History';
import { useAuthStore } from './store/authStore';


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { client } = useAuthStore();
  
  if (!client) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};


const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { client } = useAuthStore();
  
  if (client) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>

          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="recharge" element={<Recharge />} />
            <Route path="payment" element={<Payment />} />
            <Route path="history" element={<History />} />
          </Route>
          

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        

        <Toaster 
          position="top-right"
          richColors
          closeButton
          duration={4000}
        />
      </div>
    </Router>
  );
}

export default App;
