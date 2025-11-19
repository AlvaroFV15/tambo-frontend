import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Confirmacion.css';

export default function Confirmacion() {
  const navigate = useNavigate();
  const location = useLocation();
  const pedido = location.state?.pedido;

  if (!pedido) {
    return (
      <div className="confirmacion-container">
        <div className="error-message">
          <p>No hay información del pedido</p>
          <button onClick={() => navigate('/menu')}>Volver al Menú</button>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmacion-container">
      <div className="confirmacion-card">
        <div className="success-icon">✓</div>

        <h1>¡Pedido Confirmado!</h1>
        <p className="confirmation-message">
          Tu pedido ha sido registrado exitosamente
        </p>

        <div className="pedido-info">
          <div className="info-row">
            <span>Número de Pedido:</span>
            <strong>#{pedido.numero_pedido}</strong>
          </div>

          <div className="info-row">
            <span>Monto Total:</span>
            <strong>S/. {parseFloat(pedido.total).toFixed(2)}</strong>
          </div>

          <div className="info-row">
            <span>Estado:</span>
            <strong className="badge-pending">{pedido.estado}</strong>
          </div>

          <div className="info-row">
            <span>Fecha:</span>
            <strong>{new Date(pedido.fecha_pedido).toLocaleString('es-PE')}</strong>
          </div>
        </div>

        <div className="next-steps">
          <h3>Próximos Pasos</h3>
          <ol>
            <li>Te enviaremos un email de confirmación</li>
            <li>Nuestro equipo preparará tu pedido</li>
            <li>Recibirás una notificación cuando esté listo</li>
            <li>Recoge tu pedido en nuestro restaurante</li>
          </ol>
        </div>

        <div className="contact-info">
          <p>¿Preguntas? Llámanos al <strong>+51 (1) 234-5678</strong></p>
        </div>

        <button
          className="continue-btn"
          onClick={() => navigate('/menu')}
        >
          Realizar Otro Pedido
        </button>
      </div>
    </div>
  );
}
