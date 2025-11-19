import React from 'react';
import { useApp } from '../../context/AppContext';
import './Header.css';

// Componente Header: Patrón presentacional, sin lógica de negocio
export default function Header() {
  const { state, logoutUsuario, logoutAdmin } = useApp();
  const { usuario, admin, isAuthenticated, isAdminAuthenticated, carrito } = state;

  const handleLogout = () => {
    if (isAdminAuthenticated) {
      logoutAdmin();
    } else {
      logoutUsuario();
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>El Tambo Cañetano</h1>
          <p>Comida Criolla Auténtica</p>
        </div>

        <nav className="nav">
          {isAuthenticated && (
            <>
              <span className="user-greeting">Hola, {usuario?.nombre}</span>
              <span className="cart-count">{carrito.length}</span>
            </>
          )}

          {isAdminAuthenticated && (
            <span className="admin-badge">Panel Admin</span>
          )}

          {(isAuthenticated || isAdminAuthenticated) && (
            <button className="logout-btn" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
