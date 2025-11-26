import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import apiService from '../services/api';
import './Pago.css';

export default function Pago() {
  const navigate = useNavigate();
  const { state, clearCart } = useApp();
  const { carrito, usuario } = state;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipoServicio: 'mesa',
    horaLlegada: '',
    comentarios: '',
    metodoPago: 'efectivo' 
  });

  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  // --- LÓGICA DE PROCESAMIENTO (Memorizada) ---
  const procesarPedidoCompleto = useCallback(async (tokenCulqi = null, emailCliente = null) => {
    try {
      setLoading(true);
      
      const infoAdmin = `SERVICIO: ${formData.tipoServicio} | HORA: ${formData.horaLlegada} | NOTAS: ${formData.comentarios}`;

      const pedidoData = {
        usuario_id: usuario.id,
        total: total,
        metodo_pago: formData.metodoPago,
        direccion_envio: infoAdmin, 
        items: carrito.map(item => ({
          producto_id: item.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio
        })),
        email_cliente: emailCliente || usuario.email
      };

      console.log("📝 Enviando pedido:", pedidoData);

      const resPedido = await apiService.crearPedido(pedidoData);
      // Manejo robusto del ID
      const idPedido = resPedido.id || (resPedido.data && resPedido.data.id);

      if (!idPedido) throw new Error('No se recibió el ID del pedido');

      if (tokenCulqi) {
        await apiService.procesarPago(idPedido, tokenCulqi, emailCliente || usuario.email);
      }

      clearCart();
      navigate('/confirmacion', { state: { pedidoId: idPedido } });

    } catch (error) {
      console.error(error);
      alert('Error: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
      // Cerrar Culqi si está abierto
      if (window.Culqi && window.Culqi.close) {
          window.Culqi.close();
      }
    }
  }, [usuario, total, formData, carrito, navigate, clearCart]);

  // --- EFECTO PARA ASIGNAR LA FUNCIÓN CULQI AL WINDOW ---
  // Esto solo define qué hacer cuando Culqi responda, NO abre la ventana todavía.
  useEffect(() => {
    window.culqi = async function () {
      if (window.Culqi.token) {
        console.log("💳 Token generado:", window.Culqi.token.id);
        await procesarPedidoCompleto(window.Culqi.token.id, window.Culqi.token.email);
      } else {
        console.error(window.Culqi.error);
        alert(window.Culqi.error ? window.Culqi.error.user_message : 'Error en el pago');
        setLoading(false);
      }
    };
  }, [procesarPedidoCompleto]);

  // Redirecciones de seguridad
  useEffect(() => {
    if (!usuario) navigate('/login');
    if (carrito.length === 0) navigate('/menu');
  }, [usuario, carrito, navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // --- MANEJO DEL BOTÓN PAGAR ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.metodoPago === 'tarjeta') {
      // 1. Verificar si Culqi cargó
      if (typeof window.Culqi === 'undefined') {
        alert('Error: La pasarela de pagos no cargó. Por favor recarga la página.');
        return;
      }

      try {
        // --- CAMBIO AQUÍ: LLAVE DIRECTA ---
        window.Culqi.publicKey = 'pk_test_p9bbH9KTgrxQKHLH';
        // ----------------------------------

        window.Culqi.settings({
          title: 'El Tambo Cañetano',
          currency: 'PEN',
          description: 'Consumo Restaurante',
          amount: Math.round(total * 100) 
        });
        
        window.Culqi.open();
        
      } catch (err) {
        console.error("Error abriendo Culqi:", err);
        alert("No se pudo abrir la pasarela de pagos.");
      }
      
    } else {
      // Pago Efectivo / Yape
      await procesarPedidoCompleto();
    }
  };

  if (!usuario) return null;

  return (
    <div className="pago-container">
      <div className="pago-content">
        <div className="resumen-compra">
          <h2>Resumen</h2>
          <div className="lista-items">
            {carrito.map(item => (
              <div key={item.id} className="item-resumen">
                <span>{item.cantidad}x {item.nombre}</span>
                <span>S/ {(item.precio * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="total-final">
            <span>Total:</span>
            <span>S/ {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="formulario-envio">
          <h2>Detalles del Servicio</h2>
          <form onSubmit={handleSubmit}>
            
            <div className="form-group">
              <label>Opción de servicio</label>
              <select name="tipoServicio" value={formData.tipoServicio} onChange={handleChange}>
                <option value="mesa">Para comer en el local</option>
                <option value="llevar">Para llevar</option>
              </select>
            </div>

            <div className="form-group">
              <label>Hora de llegada</label>
              <input type="time" name="horaLlegada" value={formData.horaLlegada} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Notas (Opcional)</label>
              <textarea name="comentarios" value={formData.comentarios} onChange={handleChange} rows="2" />
            </div>

            <div className="form-group">
              <label>Método de Pago</label>
              <select name="metodoPago" value={formData.metodoPago} onChange={handleChange}>
                <option value="efectivo">Efectivo</option>
                <option value="yape">Yape / Plin</option>
                <option value="tarjeta">Tarjeta (Online)</option>
              </select>
            </div>

            <button type="submit" className="btn-confirmar" disabled={loading}>
              {loading ? 'Procesando...' : (formData.metodoPago === 'tarjeta' ? 'Pagar con Tarjeta' : 'Confirmar Reserva')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}