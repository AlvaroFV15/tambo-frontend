import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import apiService from '../services/api';
import './Confirmacion.css';

// Usamos export default para importar sin llaves {}
export default function Confirmacion() {
  const location = useLocation();
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
        <h2>Cargando recibo...</h2>
      </div>
    );
  }

  // 2. Si no hay ID o hubo error
  if (!pedidoId || error) {
    return (
      <div className="confirmacion-container">
        <div className="confirmacion-card error">
            <h2>⚠️ Ups...</h2>
            <p>{error || "No encontramos el pedido. Posiblemente recargaste la página."}</p>
            <Link to="/menu" className="btn-volver">Volver al Menú</Link>
        </div>
      </div>
    );
  }

  // 3. Si todo salió bien (Vista del Ticket)
  return (
    <div className="confirmacion-container">
      <div className="confirmacion-card">
        <div className="icon-check">✅</div>
        <h1>¡Pedido Exitoso!</h1>
        <p className="subtitulo">Tu orden #{pedido.numero_pedido} ha sido registrada.</p>

        <div className="ticket-info">
          <div className="ticket-row">
            <span>Total Pagado:</span>
            <span className="precio-final">S/ {pedido.total?.toFixed(2)}</span>
          </div>
          <div className="ticket-row">
            <span>Método:</span>
            <span style={{textTransform:'capitalize'}}>{pedido.metodo_pago}</span>
          </div>
          
          <hr />
          
          <div className="info-servicio">
             <strong>Detalle:</strong>
             <p>{pedido.observaciones}</p>
          </div>
        </div>

        <div className="acciones">
          <button onClick={() => window.print()} className="btn-imprimir">🖨️ Imprimir</button>
          <Link to="/menu" className="btn-volver">Pedir más</Link>
        </div>
      </div>
    </div>
  );
}