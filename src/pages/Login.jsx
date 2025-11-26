import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiService from '../services/api';
import { useApp } from '../context/AppContext'; // <--- 1. IMPORTAR CONTEXTO
import './Login.css'; 

export default function Login() {
  const navigate = useNavigate();
  
  // 2. EXTRAER LA FUNCIÓN setUsuario DEL CONTEXTO
  const { setUsuario } = useApp();

  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log("Enviando login...", formData);
      
      const response = await apiService.loginUsuario(formData.identifier, formData.password);
      console.log('Login exitoso:', response);

      // Verificamos la estructura de la respuesta
      // A veces viene directo, a veces dentro de .data, ajustamos según tu API
      const token = response.token || response.data?.token;
      const user = response.user || response.data?.user || response.usuario;

      if (token && user) {
        // A. Guardamos el token manualmente
        localStorage.setItem('token', token);

        // B. ¡AQUÍ ESTÁ EL ARREGLO!
        // Usamos setUsuario del contexto. Esto hace 2 cosas:
        // 1. Guarda en localStorage ('usuario')
        // 2. Actualiza el estado de React para que el menú cambie YA MISMO.
        setUsuario(user);

        // Redirigir
        navigate('/menu'); 
      } else {
        throw new Error('La respuesta del servidor no contiene token o usuario.');
      }

    } catch (err) {
      console.error("Error en login:", err);
      setError(err.message || 'Credenciales incorrectas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        <p>Bienvenido de nuevo</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email o Teléfono</label>
            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="ejemplo@correo.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Tu contraseña"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-login">
            {loading ? 'Cargando...' : 'Ingresar'}
          </button>
        </form>

        <div className="login-footer">
          <p>¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link></p>
        </div>
      </div>
    </div>
  );
}