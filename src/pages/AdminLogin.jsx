import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import apiService from '../services/api';
import './Login.css'; 

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

      // 1. Intentamos encontrar el token en varias ubicaciones posibles
      // A veces viene directo en response.token, a veces en response.data.token
      const token = response.token || (response.data && response.data.token);
      const adminData = response.admin || (response.data && response.data.admin);

      if (token) {
        console.log("✅ Token encontrado. Redirigiendo...");
        
        // 2. Guardamos en el contexto global
        setAdmin(adminData, token);
        
        // 3. Forzamos la redirección
        navigate('/admin/dashboard', { replace: true });
      } else {
        console.warn("⚠️ No se encontró el token en la respuesta");
        setError('Login correcto pero no se recibió el token.');
      }

    } catch (err) {
      console.error("🔴 Error en login:", err);
      setError('Credenciales incorrectas o error de servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{background: '#2c3e50'}}>
      <div className="login-card">
        <h2 style={{color: '#d4a373'}}>Acceso Administrativo</h2>
        <p>Solo personal autorizado</p>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Admin</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required 
              placeholder="admin@ejemplo.com"
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
          <button type="submit" disabled={loading} style={{background: '#d4a373'}}>
            {loading ? 'Verificando...' : 'Entrar al Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}