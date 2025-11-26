import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import Swal from 'sweetalert2'; 
import './AdminDashboard.css'; 

export default function AdminDashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Proteger la ruta
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        navigate('/admin/login');
    }
  }, [navigate]);

  const cargarPedidos = async () => {
    try {
      const response = await apiService.getPedidosAdmin();
      const lista = Array.isArray(response) ? response : (response.data || []);
      
      const ordenEstado = { 'pendiente': 1, 'confirmado': 2, 'entregado': 3 };
      lista.sort((a, b) => ordenEstado[a.estado] - ordenEstado[b.estado]);

      setPedidos(lista);
    } catch (error) {
      console.error("[Load Pedidos Error]", error);
      if (error.status === 401 || error.response?.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
    const intervalo = setInterval(cargarPedidos, 10000); 
    return () => clearInterval(intervalo);
  }, []);

  const getSiguienteEstado = (estadoActual) => {
    if (estadoActual === 'pendiente') return { texto: 'Confirmar Pedido', nuevoEstado: 'confirmado', color: 'btn-verde' };
    if (estadoActual === 'confirmado') return { texto: 'Marcar Entregado', nuevoEstado: 'entregado', color: 'btn-azul' };
    return null; 
  };

  const cambiarEstado = async (id, estadoActual, numeroPedido) => {
    const siguiente = getSiguienteEstado(estadoActual);
    if (!siguiente) return;

    const result = await Swal.fire({
      title: `¿${siguiente.texto}?`,
      text: `El pedido ${numeroPedido} pasará a estado "${siguiente.nuevoEstado.toUpperCase()}".`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar estado',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            Swal.fire({ title: 'Actualizando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

            await apiService.actualizarEstadoPedido(id, siguiente.nuevoEstado);
            await cargarPedidos(); 
            
            Swal.fire('¡Actualizado!', `El pedido ha sido marcado como ${siguiente.nuevoEstado}.`, 'success');
        } catch (error) {
            Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
        }
    }
  };

  if (loading && pedidos.length === 0) return (
    <div className="admin-container"><div className="admin-loading">Cargando pedidos...</div></div>
  );

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>📋 Panel de Cocina</h1>
        
        <div style={{display:'flex', gap:'10px'}}>
             
             {/* BOTÓN: IR A GESTIÓN DE MENÚ */}
             <button 
                onClick={() => navigate('/admin/menu')} 
                style={{
                    backgroundColor: '#ffc107', // Amarillo
                    color: '#333',
                    border: 'none', 
                    padding: '8px 15px', 
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                }}
             >
                🥘 Gestionar Menú
             </button>

             {/* BOTÓN NUEVO: IR A REPORTES */}
             <button 
                onClick={() => navigate('/admin/stats')} 
                style={{
                    backgroundColor: '#17a2b8', // Cyan
                    color: 'white',
                    border: 'none', 
                    padding: '8px 15px', 
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                }}
             >
                📈 Reportes
             </button>

             <button onClick={cargarPedidos} className="btn-refresh">🔄 Actualizar</button>
             
             <button 
                onClick={() => { localStorage.removeItem('adminToken'); navigate('/admin/login'); }} 
                className="btn-logout" 
                style={{backgroundColor:'#d33', color:'white', border:'none', padding:'5px 10px', cursor:'pointer', borderRadius: '5px'}}
             >
                Cerrar Sesión
             </button>
        </div>
      </header>

      <div className="tabla-responsive">
        <table className="tabla-pedidos">
          <thead>
            <tr>
              <th># Pedido</th>
              <th>Cliente / Mesa</th>
              <th>Detalle (Platos)</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length === 0 ? (
                <tr><td colSpan="6" style={{textAlign:'center', padding:'20px'}}>No hay pedidos pendientes hoy. 😴</td></tr>
            ) : (
                pedidos.map(pedido => {
                    const accion = getSiguienteEstado(pedido.estado);
                    return (
                    <tr key={pedido.id} className={`fila-${pedido.estado}`}>
                        <td>
                            <strong>{pedido.numero_pedido}</strong><br/>
                            <small>{new Date(pedido.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                        </td>
                        <td>
                            <div className="cliente-info">
                                <strong>{pedido.usuarios?.nombre || 'Cliente Web'}</strong>
                                <div className="nota-servicio">{pedido.observaciones || 'Sin notas'}</div>
                            </div>
                        </td>
                        <td>
                            <ul className="lista-platos">
                                {pedido.detalles_pedidos?.map((d, i) => (
                                    <li key={i}>{d.cantidad}x {d.productos?.nombre}</li>
                                ))}
                            </ul>
                        </td>
                        <td className="monto-total">S/ {pedido.total?.toFixed(2)}</td>
                        <td>
                            <span className={`badge ${pedido.estado}`}>{pedido.estado?.toUpperCase()}</span>
                        </td>
                        <td>
                            {accion ? (
                                <button 
                                    className={`btn-accion ${accion.color}`} 
                                    style={{ 
                                        backgroundColor: accion.nuevoEstado === 'confirmado' ? '#28a745' : '#007bff', 
                                        color: 'white', padding: '8px 12px', border: 'none', borderRadius: '5px', cursor: 'pointer' 
                                    }}
                                    onClick={() => cambiarEstado(pedido.id, pedido.estado, pedido.numero_pedido)}
                                >
                                    {accion.texto} ➡️
                                </button>
                                
                            ) : (
                                <span style={{color: 'gray', fontStyle: 'italic'}}>Finalizado ✅</span>
                            )}
                        </td>
                    </tr>
                )})
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}