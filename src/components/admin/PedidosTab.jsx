import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';
import './PedidosTab.css';

// Patrón: Componente container para gestión de pedidos
export default function PedidosTab({ pedidos }) {
  const { updatePedido, setNotification } = useApp();
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredPedidos = filterStatus
    ? pedidos.filter(p => p.estado === filterStatus)
    : pedidos;

  const handleStatusChange = async (pedidoId, newStatus) => {
    setLoading(true);
    try {
      const response = await apiService.actualizarEstadoPedido(pedidoId, newStatus);
      if (response.success) {
        updatePedido(response.pedido);
        setNotification({ type: 'success', message: 'Estado actualizado' });
      } else {
        setNotification({ type: 'error', message: 'Error al actualizar' });
      }
    } catch (error) {
      console.error('[Update Error]', error);
      setNotification({ type: 'error', message: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pendiente': 'badge-warning',
      'confirmado': 'badge-info',
      'preparando': 'badge-primary',
      'listo': 'badge-success',
      'cancelado': 'badge-danger',
    };
    return colors[status] || 'badge-info';
  };

  return (
    <div className="pedidos-tab">
      <div className="pedidos-header">
        <h2>Pedidos Recibidos</h2>
        <div className="filter-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los Estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmado">Confirmado</option>
            <option value="preparando">Preparando</option>
            <option value="listo">Listo para Recoger</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="pedidos-list">
        {filteredPedidos.length === 0 ? (
          <p className="empty-message">No hay pedidos con este estado</p>
        ) : (
          filteredPedidos.map(pedido => (
            <div key={pedido.id} className="pedido-card">
              <div className="pedido-header">
                <span className={`badge ${getStatusColor(pedido.estado)}`}>
                  {pedido.estado.toUpperCase()}
                </span>
                <h3>Pedido #{pedido.numero_pedido}</h3>
              </div>

              <div className="pedido-details">
                <div className="detail-row">
                  <span>Cliente:</span>
                  <strong>{pedido.usuario_nombre}</strong>
                </div>
                <div className="detail-row">
                  <span>Monto:</span>
                  <strong>S/. {parseFloat(pedido.total).toFixed(2)}</strong>
                </div>
                <div className="detail-row">
                  <span>Fecha:</span>
                  <strong>{new Date(pedido.fecha_pedido).toLocaleString('es-PE')}</strong>
                </div>
              </div>

              {/* Items del pedido */}
              <div className="pedido-items">
                <h4>Ítems:</h4>
                <ul>
                  {pedido.detalles?.map((item, idx) => (
                    <li key={idx}>
                      {item.producto_nombre} x{item.cantidad}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pedido-actions">
                <select
                  value={pedido.estado}
                  onChange={(e) => handleStatusChange(pedido.id, e.target.value)}
                  className="status-select"
                  disabled={loading}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="preparando">Preparando</option>
                  <option value="listo">Listo para Recoger</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              {pedido.observaciones && (
                <div className="pedido-notes">
                  <strong>Notas:</strong>
                  <p>{pedido.observaciones}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
