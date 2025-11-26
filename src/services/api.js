const RAW_API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export const API_BASE = RAW_API.replace(/\/+$/,'') + '/api';

// Función auxiliar robusta para peticiones
async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  
  // 1. Asegurar Headers
  const headers = {
    'Content-Type': 'application/json', 
    ...(options.headers || {}) 
  };

  const opts = {
    ...options,
    headers,
  };

  console.debug(`[API] ${opts.method || 'GET'} ${url}`, opts);

  try {
    const res = await fetch(url, opts);
    
    // Manejo seguro del cuerpo de respuesta
    const text = await res.text().catch(() => null);
    let data = null;
    if (text) {
      try { 
        data = JSON.parse(text); 
      } catch (e) { 
        data = { rawText: text }; 
      }
    }

    if (!res.ok) {
      const serverMessage = (data && (data.message || data.error)) || res.statusText;
      const err = new Error(serverMessage);
      err.status = res.status;
      err.response = { data, status: res.status };
      throw err;
    }

    return (data && typeof data === 'object') ? data : { success: true, data };
  } catch (err) {
    console.error("Error API:", err);
    if (!err.response) err.response = { url };
    throw err;
  }
}

export const apiService = {
  // --- USUARIOS ---
  registroUsuario: (nombre, email, telefono, password) =>
    request('/usuarios/registro', {
      method: 'POST',
      body: JSON.stringify({ nombre, email, telefono, password }),
    }),

  loginUsuario: (identifier, password) =>
    request('/usuarios/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),

  // --- PRODUCTOS (PÚBLICO) ---
  getCategorias: () => request('/categorias'),
  getProductos: () => request('/productos'),
  
  // --- PEDIDOS ---
  getPedido: (id) => request(`/pedidos/${id}`),
  
  crearPedido: (pedidoData) => 
    request('/pedidos', {
      method: 'POST',
      body: JSON.stringify(pedidoData),
    }),

  // --- PAGOS ---
  procesarPago: (pedidoId, tokenCulqi, email) => 
    request('/pagos/procesar', {
      method: 'POST',
      body: JSON.stringify({ 
        pedido_id: pedidoId, 
        token_culqi: tokenCulqi,
        email: email 
      }),
    }),

  // --- ADMINISTRADOR (LOGIN) ---
  loginAdmin: (email, password) =>
    request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // --- ADMINISTRADOR (PEDIDOS) ---
  getPedidosAdmin: () => {
    const token = localStorage.getItem('adminToken');
    return request('/admin/pedidos', {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    });
  },

  actualizarEstadoPedido: (id, nuevoEstado) => {
    const token = localStorage.getItem('adminToken');
    return request(`/admin/pedidos/${id}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ estado: nuevoEstado })
    });
  }, // <--- ¡AQUÍ PROBABLEMENTE FALTABA LA COMA!

  // --- ADMINISTRADOR (GESTIÓN DE MENÚ) ---
  crearProducto: (productoData) => {
    const token = localStorage.getItem('adminToken');
    return request('/productos', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(productoData)
    });
  },

  actualizarProducto: (id, productoData) => {
    const token = localStorage.getItem('adminToken');
    return request(`/productos/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(productoData)
    });
  },

  eliminarProducto: (id) => {
    const token = localStorage.getItem('adminToken');
    return request(`/productos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },
  // --- REPORTES Y ESTADÍSTICAS ---
  getReporteVentas: (fechaInicio, fechaFin) => {
    const token = localStorage.getItem('adminToken');
    // Construimos la URL con parámetros query ?inicio=...&fin=...
    let query = '';
    if (fechaInicio && fechaFin) {
        query = `?inicio=${fechaInicio}&fin=${fechaFin}`;
    }
    
    return request(`/reportes/ventas${query}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
};

export default apiService;