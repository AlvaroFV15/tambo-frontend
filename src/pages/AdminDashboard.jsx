import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import PedidosTab from '../components/admin/PedidosTab';
import ProductosTab from '../components/admin/ProductosTab';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { state, setPedidos, logoutAdmin, setNotification } = useApp();
  const { isAdminAuthenticated, pedidos } = state;
  const [activeTab, setActiveTab] = useState('pedidos');
  const [loading, setLoading] = useState(true);

  // Proteger ruta: Solo admin autenticado
  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
      return;
    }

    // Cargar pedidos
    const loadPedidos = async () => {
      try {
        const response = await apiService.obtenerPedidos();
        if (response.success) {
          setPedidos(response.data);
        }
      } catch (error) {
        console.error('[Load Pedidos Error]', error);
        setNotification({ type: 'error', message: 'Error al cargar pedidos' });
      } finally {
        setLoading(false);
      }
    };

    loadPedidos();
  }, [isAdminAuthenticated, navigate, setPedidos, setNotification]);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  if (!isAdminAuthenticated) {
    return null;
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>El Tambo</h2>
          <p>Admin Panel</p>
        </div>

        <nav className="admin-nav">
          <button
            className={`nav-item ${activeTab === 'pedidos' ? 'active' : ''}`}
            onClick={() => setActiveTab('pedidos')}
          >
            📋 Pedidos
          </button>
          <button
            className={`nav-item ${activeTab === 'productos' ? 'active' : ''}`}
            onClick={() => setActiveTab('productos')}
          >
            🍽️ Productos
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </aside>

      <main className="admin-content">
        <header className="admin-header">
          <h1>
            {activeTab === 'pedidos' ? 'Gestión de Pedidos' : 'Gestión de Productos'}
          </h1>
          <p>Sistema de administración - El Tambo Cañetano</p>
        </header>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Cargando datos...</p>
          </div>
        ) : (
          <div className="tab-content">
            {activeTab === 'pedidos' && <PedidosTab pedidos={pedidos} />}
            {activeTab === 'productos' && <ProductosTab />}
          </div>
        )}
      </main>
    </div>
  );
}
