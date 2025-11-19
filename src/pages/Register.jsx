import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();
  const { setUsuario, setNotification } = useApp();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
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
      // Validación básica en cliente
      if (!formData.nombre || !formData.email) {
        setNotification({ type: 'error', message: 'Por favor completa todos los campos requeridos' });
        setLoading(false);
        return;
      }

      // Pattern: Llamada al servicio API
      const response = await apiService.registroUsuario(
        formData.nombre,
        formData.email,
        formData.telefono
      );

      if (response.success) {
        setUsuario(response.usuario);
        setNotification({ type: 'success', message: '¡Bienvenido! Registro completado' });
        navigate('/menu');
      } else {
        setNotification({ type: 'error', message: response.message || 'Error al registrarse' });
      }
    } catch (error) {
      console.error('[Register Error]', error);
      setNotification({ type: 'error', message: 'Error de conexión. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Bienvenido a El Tambo Cañetano</h1>
        <p>Regístrate para realizar tu pedido</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre Completo *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Juan Pérez"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="juan@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono (Opcional)</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="+51 999 999 999"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p className="already-registered">
          ¿Ya estás registrado? <a href="#login">Inicia sesión aquí</a>
        </p>
      </div>
    </div>
  );
}
