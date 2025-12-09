import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import apiService from '../services/api';
import './AdminLogin.css'; // <--- Asegúrate de usar el CSS nuevo

export default function AdminLogin() {
  const navigate = useNavigate();
  const { setAdmin } = useApp();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log("🔵 Enviando credenciales...");
      const response = await apiService.loginAdmin(formData.email, formData.password);
      
      console.log("🟢 Respuesta del servidor:", response);

      // 1. Lógica robusta para encontrar el token (Tu código original)
      const token = response.token || (response.data && response.data.token);
      const adminData = response.admin || (response.data && response.data.admin);

      if (token) {
        console.log("✅ Token encontrado. Redirigiendo...");
        
        // 2. Guardamos en el contexto global
        setAdmin(adminData, token);
        
        // 3. Redirección segura
        navigate('/admin/dashboard', { replace: true });
      } else {
        console.warn("⚠️ No se encontró el token en la respuesta");
        setError('Login correcto pero no se recibió el token de seguridad.');
      }

    } catch (err) {
      console.error("🔴 Error en login:", err);
      setError('Credenciales incorrectas o error de servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        
        {/* Ícono de Escudo */}
        <div className="admin-icon">🛡️</div>

        <h1>Acceso Administrativo</h1>
        <p className="subtitle">Solo personal autorizado</p>
        
        {/* Mensaje de error estilizado */}
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Corporativo</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required 
              placeholder="admin@eltambo.com"
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required 
              placeholder="••••••"
            />
          </div>

          {/* Botón con el nuevo estilo */}
          <button type="submit" className="btn-admin" disabled={loading}>
            {loading ? 'Verificando...' : 'Entrar al Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}