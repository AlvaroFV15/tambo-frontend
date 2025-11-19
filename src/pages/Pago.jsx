import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import './Pago.css';

export default function Pago() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, addPedido, clearCart, setNotification } = useApp();
  const { usuario } = state;

  const carrito = location.state?.carrito || [];
  const total = location.state?.total || 0;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    email: usuario?.email || '',
  });

  // Cargar script de Culqi - Pattern: Inyección de script externo
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.culqi.com/js/v3';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.slice(0, name === 'cvv' ? 4 : name === 'cardNumber' ? 16 : 50),
    }));
  };

  const validateCardData = () => {
    const { cardNumber, cardHolder, expiryMonth, expiryYear, cvv } = formData;

    if (!cardNumber || cardNumber.length < 13) {
      setNotification({ type: 'error', message: 'Número de tarjeta inválido' });
      return false;
    }
    if (!cardHolder || cardHolder.trim().length < 3) {
      setNotification({ type: 'error', message: 'Nombre del titular inválido' });
      return false;
    }
    if (!expiryMonth || !expiryYear) {
      setNotification({ type: 'error', message: 'Fecha de vencimiento inválida' });
      return false;
    }
    if (!cvv || cvv.length < 3) {
      setNotification({ type: 'error', message: 'CVV inválido' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!usuario) {
      setNotification({ type: 'error', message: 'Debes iniciar sesión primero' });
      navigate('/registro');
      return;
    }

    if (!validateCardData()) {
      return;
    }

    setLoading(true);

    try {
      // Paso 1: Crear pedido en el backend
      const pedidoResponse = await apiService.criarPedido(usuario.id, carrito.map(item => ({
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
      })));

      if (!pedidoResponse.success) {
        throw new Error(pedidoResponse.message || 'Error al crear pedido');
      }

      const pedidoId = pedidoResponse.pedido.id;

      // Paso 2: Procesar pago con Culqi
      const pagoResponse = await apiService.procesarPago(pedidoId, {
        card_number: formData.cardNumber.replace(/\s/g, ''),
        expiry_month: formData.expiryMonth,
        expiry_year: formData.expiryYear,
        cvv: formData.cvv,
        cardholder_name: formData.cardHolder,
        amount: Math.round(total * 100), // Culqi en céntimos
        email: formData.email,
      });

      if (pagoResponse.success) {
        addPedido(pedidoResponse.pedido);
        clearCart();
        setNotification({ type: 'success', message: 'Pago realizado exitosamente' });
        navigate('/confirmacion', { state: { pedido: pedidoResponse.pedido } });
      } else {
        setNotification({ type: 'error', message: pagoResponse.message || 'Error en el pago' });
      }
    } catch (error) {
      console.error('[Payment Error]', error);
      setNotification({ type: 'error', message: error.message || 'Error al procesar el pago' });
    } finally {
      setLoading(false);
    }
  };

  if (carrito.length === 0) {
    return (
      <div className="pago-container">
        <div className="empty-payment">
          <p>No hay items en el carrito</p>
          <button onClick={() => navigate('/menu')}>Volver al Menú</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pago-container">
      <div className="pago-content">
        <div className="pago-header">
          <h1>Resumen de Compra</h1>
        </div>

        <div className="pago-grid">
          {/* Order Summary */}
          <div className="order-summary">
            <h2>Tu Pedido</h2>
            <div className="order-items">
              {carrito.map(item => (
                <div key={item.id} className="order-item">
                  <span>{item.nombre} x{item.cantidad}</span>
                  <span>S/. {(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="order-total">
              <span>Total a Pagar:</span>
              <strong>S/. {total.toFixed(2)}</strong>
            </div>
          </div>

          {/* Payment Form */}
          <div className="payment-form">
            <h2>Datos de la Tarjeta</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Número de Tarjeta *</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber.replace(/(.{4})/g, '$1 ')}
                  onChange={handleChange}
                  placeholder="4111 1111 1111 1111"
                  maxLength="19"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Nombre del Titular *</label>
                <input
                  type="text"
                  name="cardHolder"
                  value={formData.cardHolder}
                  onChange={handleChange}
                  placeholder="Juan Pérez"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mes (MM) *</label>
                  <select
                    name="expiryMonth"
                    value={formData.expiryMonth}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Selecciona</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {String(i + 1).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Año (YY) *</label>
                  <select
                    name="expiryYear"
                    value={formData.expiryYear}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Selecciona</option>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <option key={year} value={String(year).slice(-2)}>
                          {String(year).slice(-2)}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label>CVV *</label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    placeholder="123"
                    maxLength="4"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  disabled={loading}
                />
              </div>

              <div className="security-note">
                <p>Tu información de pago es procesada de forma segura por Culqi</p>
              </div>

              <button
                type="submit"
                className="pay-btn"
                disabled={loading}
              >
                {loading ? 'Procesando...' : `Pagar S/. ${total.toFixed(2)}`}
              </button>

              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate('/menu')}
                disabled={loading}
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
