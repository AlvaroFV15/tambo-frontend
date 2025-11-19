import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>El Tambo Cañetano</h3>
          <p>Restaurante de auténtica comida criolla peruana</p>
          <p>Horario: Lunes a Domingo, 11:00 AM - 10:00 PM</p>
        </div>

        <div className="footer-section">
          <h3>Contacto</h3>
          <p>Teléfono: +51 (1) 234-5678</p>
          <p>Email: info@eltambocañetano.com</p>
          <p>Dirección: Jr. Ricardo Palma 123, Cañete</p>
        </div>

        <div className="footer-section">
          <h3>Redes Sociales</h3>
          <div className="social-links">
            <a href="#">Facebook</a>
            <a href="#">Instagram</a>
            <a href="#">WhatsApp</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 El Tambo Cañetano. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
