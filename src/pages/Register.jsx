import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      // Validación básica en cliente
      if (!formData.nombre || !formData.email) {
        setNotification({ type: 'error', message: 'Por favor completa todos los campos requeridos' });
        setLoading(false);
        return;
      }

      // Pattern: Llamada al servicio API
      // Enviar registro SIN password
      const response = await apiService.registroUsuario(
        formData.nombre,
        formData.email,
        formData.telefono,
        formData.password
      );

      if (response && response.success) {
        setUsuario(response.usuario);
        setNotification({ type: 'success', message: '¡Bienvenido! Registro completado' });
        navigate('/menu');
      } else {
        setNotification({ type: 'error', message: response.message || 'Error al registrarse' });
      }
    } catch (error) {
      // Más información útil para debugging
      console.error('[Register Error]', error);
      const status = error?.status || error?.response?.status || null;
      const msg = error?.message || error?.response?.data?.message || 'Error de conexión. Intenta de nuevo.';
      setNotification({ type: 'error', message: status ? `Error ${status}: ${msg}` : msg });
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
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              placeholder="Crea una contraseña segura"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
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
          ¿Ya estás registrado? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}
