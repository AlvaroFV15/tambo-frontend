import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Notification from './components/common/Notification';

// Pages
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login'; // agregado
import Menu from './pages/Menu';
import Pago from './pages/Pago';
import Confirmacion from './pages/Confirmacion';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Route protegida para admin
function ProtectedAdminRoute({ children }) {
  const adminToken = localStorage.getItem('adminToken');
  return adminToken ? children : <Navigate to="/admin/login" />;
}

// Route protegida para usuarios autenticados
function ProtectedUserRoute({ children }) {
  const usuario = localStorage.getItem('usuario');
  // Redirigir al login de usuario si no está autenticado
  return usuario ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/registro" element={<Register />} />
              <Route path="/login" element={<Login />} />
              {/* User Routes */}
              <Route path="/menu" element={<ProtectedUserRoute><Menu /></ProtectedUserRoute>} />
              <Route path="/pago" element={<ProtectedUserRoute><Pago /></ProtectedUserRoute>} />
              <Route path="/confirmacion" element={<Confirmacion />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                }
              />

              {/* Redirect */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
          <Notification />
        </div>
      </Router>
    </AppProvider>
  );
}