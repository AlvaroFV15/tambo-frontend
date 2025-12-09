import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import Swal from 'sweetalert2'; 
import './AdminDashboard.css'; 

export default function AdminDashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- NUEVO: ESTADOS PARA LOS FILTROS ---
  // Inicializamos con la fecha de hoy para que la cocina vea lo urgente
  const hoy = new Date().toISOString().split('T')[0];
  const [filterDate, setFilterDate] = useState(hoy); 
  const [filterStatus, setFilterStatus] = useState('todos');

  // 1. Proteger la ruta
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        navigate('/admin/login');
    }
  }, [navigate]);

  // 2. Cargar Pedidos
  const cargarPedidos = async () => {
    try {
      const response = await apiService.getPedidosAdmin();
      const lista = Array.isArray(response) ? response : (response.data || []);
      
      // Ordenar: Pendientes primero (urgente), luego confirmados, al final entregados
      const ordenEstado = { 'pendiente': 1, 'confirmado': 2, 'entregado': 3 };
      
      lista.sort((a, b) => {
        const diffEstado = ordenEstado[a.estado] - ordenEstado[b.estado];
        if (diffEstado !== 0) return diffEstado;
        // Si el estado es el mismo, mostrar el más reciente primero
        return new Date(b.created_at) - new Date(a.created_at);
      });

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

  // Recarga automática cada 10 segundos
  useEffect(() => {
    cargarPedidos();
    const intervalo = setInterval(cargarPedidos, 10000); 
    return () => clearInterval(intervalo);
  }, []);

  // --- NUEVO: LÓGICA DE FILTRADO ---
  const filteredPedidos = pedidos.filter(pedido => {
    // 1. Filtro de Fecha (Ignora la hora, compara YYYY-MM-DD)
    // Si filterDate está vacío, muestra todas las fechas
    const fechaPedido = new Date(pedido.created_at).toISOString().split('T')[0];
    const matchDate = filterDate ? fechaPedido === filterDate : true;

    // 2. Filtro de Estado
    const matchStatus = filterStatus === 'todos' ? true : pedido.estado === filterStatus;

    return matchDate && matchStatus;
  });

  // Lógica de botones de acción (Mejorada con iconos)
  const getSiguienteEstado = (estadoActual) => {
    if (estadoActual === 'pendiente') return { texto: 'Confirmar', nuevoEstado: 'confirmado', color: 'btn-verde', icon: '👨‍🍳' };
    if (estadoActual === 'confirmado') return { texto: 'Entregar', nuevoEstado: 'entregado', color: 'btn-azul', icon: '✅' };
    return null; // Si es entregado, no retorna nada
  };

  const cambiarEstado = async (id, estadoActual, numeroPedido) => {
    const siguiente = getSiguienteEstado(estadoActual);
    if (!siguiente) return;

    const result = await Swal.fire({
      title: `¿${siguiente.texto} Pedido?`,
      text: `El pedido ${numeroPedido} pasará a estado "${siguiente.nuevoEstado.toUpperCase()}".`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, continuar',
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
    <div className="admin-container"><div className="loading"><div className="spinner"></div><p>Cargando panel...</p></div></div>
  );

  return (
    <div className="admin-container">
      
      {/* HEADER con botones estilizados */}
      <header className="admin-header">
        <h1>👨‍🍳 Panel de Cocina</h1>
        <div className="header-buttons">
             <button onClick={() => navigate('/admin/menu')} className="btn-menu">🥘 Menú</button>
             <button onClick={() => navigate('/admin/stats')} className="btn-reportes">📈 Reportes</button>
             <button onClick={cargarPedidos} className="btn-refresh">🔄</button>
             <button onClick={() => { localStorage.removeItem('adminToken'); navigate('/admin/login'); }} className="btn-logout">Salir</button>
        </div>
      </header>

      {/* --- NUEVA BARRA DE FILTROS --- */}
      <div className="filters-bar">
        <div className="filter-group">
          <label>Filtrar por Fecha:</label>
          <input 
            type="date" 
            className="filter-control"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Estado:</label>
          <select 
            className="filter-control"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="todos">📦 Todos</option>
            <option value="pendiente">⏳ Pendientes</option>
            <option value="confirmado">🔥 En Preparación</option>
            <option value="entregado">✅ Finalizados</option>
          </select>
        </div>

        <button 
          className="btn-clear" 
          onClick={() => { setFilterDate(''); setFilterStatus('todos'); }}
        >
          Limpiar Filtros
        </button>
      </div>

      {/* TABLA DE PEDIDOS */}
      <div className="tabla-responsive">
        <table className="tabla-pedidos">
          <thead>
            <tr>
              <th># Pedido / Hora</th>
              <th>Cliente / Notas</th>
              <th>Detalle (Platos)</th>
              <th>Total</th>
              <th>Estado Actual</th>
              <th>Acción Requerida</th>
            </tr>
          </thead>
          <tbody>
            {filteredPedidos.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{textAlign:'center', padding:'40px', color:'#999', fontSize:'1.1rem'}}>
                    {pedidos.length === 0 ? "No hay pedidos para hoy. 😴" : "No se encontraron pedidos con esos filtros. 🔍"}
                  </td>
                </tr>
            ) : (
                filteredPedidos.map(pedido => {
                    const accion = getSiguienteEstado(pedido.estado);
                    return (
                    <tr key={pedido.id}>
                        <td>
                            <strong>{pedido.numero_pedido}</strong><br/>
                            <small style={{color:'#666'}}>
                              {new Date(pedido.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </small>
                        </td>
                        
                        <td>
                            <div className="cliente-info">
                                <strong>{pedido.usuarios?.nombre || 'Cliente Web'}</strong>
                                
                                {/* Detección de Yape Manual para resaltar */}
                                {pedido.observaciones && pedido.observaciones.includes('[YAPE') ? (
                                  <div style={{background:'#fff3cd', border:'1px solid #ffeeba', color:'#856404', padding:'5px', borderRadius:'4px', marginTop:'5px', fontSize:'0.85rem'}}>
                                    ⚠️ <strong>Verificar Pago:</strong><br/>
                                    {pedido.observaciones}
                                  </div>
                                ) : (
                                  <div className="nota-servicio">
                                      📝 {pedido.observaciones || 'Sin notas'}
                                  </div>
                                )}
                            </div>
                        </td>

                        <td>
                            <ul className="lista-platos">
                                {pedido.detalles_pedidos?.map((d, i) => (
                                    <li key={i}>
                                        <strong>{d.cantidad}x</strong> {d.productos?.nombre}
                                    </li>
                                ))}
                            </ul>
                        </td>

                        <td className="monto-total">S/ {pedido.total?.toFixed(2)}</td>

                        <td>
                            <span className={`status-badge ${pedido.estado}`}>
                                {pedido.estado?.toUpperCase()}
                            </span>
                        </td>

                        <td>
                            {accion ? (
                                <button 
                                    className={`btn-accion ${accion.color}`} 
                                    onClick={() => cambiarEstado(pedido.id, pedido.estado, pedido.numero_pedido)}
                                >
                                    <span>{accion.icon}</span> {accion.texto}
                                </button>
                            ) : (
                                <span className="finalizado-text">
                                  <span>🏁</span> Finalizado
                                </span>
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