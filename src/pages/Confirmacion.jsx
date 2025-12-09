import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import './Confirmacion.css';

export default function Confirmacion() {
  const location = useLocation();
  const navigate = useNavigate(); // Agregado por si necesitas redireccionar
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtenemos ID del estado de navegación
  const pedidoId = location.state?.pedidoId;

  useEffect(() => {
    if (!pedidoId) {
      setLoading(false);
      return;
    }

    const fetchPedido = async () => {
      try {
        const response = await apiService.getPedido(pedidoId);
        // Manejo seguro de la respuesta
        const data = response.data || response;
        setPedido(data);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la información del pedido.');
      } finally {
        setLoading(false);
      }
    };

    fetchPedido();
  }, [pedidoId]);

  // 1. Si está cargando
  if (loading) {
    return (
      <div className="confirmacion-container">
        <div className="spinner" style={{borderColor: '#d35400', borderTopColor:'transparent'}}></div>
        <p style={{marginLeft:'10px', fontWeight:'bold', color:'#d35400'}}>Generando recibo...</p>
      </div>
    );
  }

  // 2. Si no hay ID o hubo error
  if (!pedidoId || error) {
    return (
      <div className="confirmacion-container">
        <div className="confirmacion-card error" style={{padding: '40px'}}>
            <div style={{fontSize:'3rem', marginBottom:'10px'}}>⚠️</div>
            <h2>Ups, algo pasó</h2>
            <p style={{color:'#666', marginBottom:'20px'}}>
              {error || "No encontramos el pedido. Es posible que hayas recargado la página."}
            </p>
            <Link to="/menu" className="btn-volver" style={{width:'100%'}}>
              Volver al Menú
            </Link>
        </div>
      </div>
    );
  }

  // 3. Si todo salió bien (Vista del Ticket Moderno)
  return (
    <div className="confirmacion-container">
      <div className="confirmacion-card">
        
        {/* Cabecera Verde */}
        <div className="card-header-success">
          <div className="icon-circle">
            <span>✓</span>
          </div>
          <h1>¡Pedido Recibido!</h1>
          <p className="subtitulo">Orden #{pedido.numero_pedido}</p>
        </div>

        <div className="ticket-body">
          
          {/* Detalles estilo Recibo */}
          <div className="ticket-details">
            <div className="ticket-row">
              <span>Fecha:</span>
              <strong>{new Date(pedido.created_at).toLocaleDateString()}</strong>
            </div>
            <div className="ticket-row">
              <span>Método de Pago:</span>
              <strong style={{textTransform:'capitalize', color:'#2c3e50'}}>
                {pedido.metodo_pago}
              </strong>
            </div>
            
            <div className="ticket-total">
              <span>Total Pagado</span>
              <span>S/ {parseFloat(pedido.total).toFixed(2)}</span>
            </div>
          </div>
          
          {/* Bloque de Notas / Delivery */}
          {pedido.observaciones && (
            <div className="info-servicio">
               <strong>📝 Detalles del Servicio:</strong>
               <p>{pedido.observaciones}</p>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="acciones">
            <button onClick={() => window.print()} className="btn-imprimir">
              🖨️ Imprimir
            </button>
            <Link to="/menu" className="btn-volver">
              🍽️ Pedir más
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}