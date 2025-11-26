import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './Header.css';

export default function Header() {
  const { state, logoutUsuario, logoutAdmin } = useApp();
  const { usuario, admin, carrito } = state;
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Calcular cantidad de items en carrito
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  const handleLogoutUser = () => {
    logoutUsuario();
    navigate('/login');
    setMenuOpen(false);
  };

  const handleLogoutAdmin = () => {
    logoutAdmin();
    navigate('/');
    setMenuOpen(false);
  };

  // Función para saber si un link está activo
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <header className="header">
      <div className="header-container">
        {/* LOGO */}
        <Link to="/" className="logo">
          🥘 El Tambo Cañetano
        </Link>

        {/* Botón Hamburguesa (Móvil) */}
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        {/* NAV LINKS */}
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          
          {/* --- VISTA DE ADMINISTRADOR --- */}
          {admin ? (
            <>
              <Link to="/admin/dashboard" className={isActive('/admin/dashboard')}>
                📊 Panel Admin
              </Link>
              <button onClick={handleLogoutAdmin} className="btn-logout admin">
                Cerrar Sesión Admin
              </button>
            </>
          ) : (
            /* --- VISTA DE USUARIO / VISITANTE --- */
            <>
              <Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>
                Inicio
              </Link>
              
              <Link to="/menu" className={isActive('/menu')} onClick={() => setMenuOpen(false)}>
                🍽️ Menú
              </Link>

              {/* Si hay usuario logueado */}
              {usuario ? (
                <>
                  <div className="user-info">
                    Hola, <strong>{usuario.nombre?.split(' ')[0]}</strong>
                  </div>
                  
                  {/* Carrito (Solo visible si hay items) */}
                  {totalItems > 0 && (
                    <Link to="/pago" className="cart-badge-link">
                      🛒 <span className="badge">{totalItems}</span>
                    </Link>
                  )}

                  <button onClick={handleLogoutUser} className="btn-logout">
                    Salir
                  </button>
                </>
              ) : (
                /* Si es visitante */
                <>
                  <Link to="/login" className={`btn-login ${isActive('/login')}`}>
                    Iniciar Sesión
                  </Link>
                  <Link to="/registro" className={`btn-register ${isActive('/registro')}`}>
                    Registrarse
                  </Link>
                  <Link to="/admin/login" className="link-admin">
                    Soy Admin
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}