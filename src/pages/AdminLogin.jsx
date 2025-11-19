import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import './AdminLogin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { setAdmin, setNotification } = useApp();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        setNotification({ type: 'error', message: 'Por favor completa todos los campos' });
        setLoading(false);
        return;
      }

      // Pattern: Llamada a API para autenticación
      const response = await apiService.loginAdmin(formData.email, formData.password);

      if (response.success) {
        setAdmin(response.admin, response.token);
        setNotification({ type: 'success', message: 'Bienvenido Admin' });
        navigate('/admin/dashboard');
      } else {
        setNotification({ type: 'error', message: response.message || 'Credenciales inválidas' });
      }
    } catch (error) {
      console.error('[Admin Login Error]', error);
      setNotification({ type: 'error', message: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-header">
          <h1>Panel Admin</h1>
          <p>El Tambo Cañetano</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@eltambocañetano.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Autenticando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="security-notice">
          Solo para administradores autorizados
        </p>
      </div>
    </div>
  );
}
