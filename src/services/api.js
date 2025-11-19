const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Agregar token de admin si existe
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      headers['Authorization'] = `Bearer ${adminToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[API Error]', error);
      throw error;
    }
  }

  // Categorías
  getCategorias() {
    return this.request('/categorias');
  }

  // Productos
  getProductos() {
    return this.request('/productos');
  }

  getProductosPorCategoria(categoriaId) {
    return this.request(`/productos?categoria=${categoriaId}`);
  }

  // Usuarios - Registro
  registroUsuario(nombre, email, telefono = null) {
    return this.request('/usuarios/registro', {
      method: 'POST',
      body: JSON.stringify({ nombre, email, telefono }),
    });
  }

  // Usuarios - Actualizar
  actualizarUsuario(usuarioId, datos) {
    return this.request(`/usuarios/${usuarioId}`, {
      method: 'PUT',
      body: JSON.stringify(datos),
    });
  }

  // Admin - Login
  loginAdmin(email, password) {
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Pedidos - Crear
  crearPedido(usuarioId, detalles) {
    return this.request('/pedidos', {
      method: 'POST',
      body: JSON.stringify({ usuario_id: usuarioId, detalles }),
    });
  }

  // Pedidos - Obtener
  obtenerPedidos(usuarioId = null) {
    const endpoint = usuarioId ? `/pedidos?usuario=${usuarioId}` : '/pedidos';
    return this.request(endpoint);
  }

  // Pedidos - Actualizar estado (admin)
  actualizarEstadoPedido(pedidoId, estado) {
    return this.request(`/pedidos/${pedidoId}`, {
      method: 'PUT',
      body: JSON.stringify({ estado }),
    });
  }

  // Pagos - Culqi
  procesarPago(pedidoId, datosCulqi) {
    return this.request('/pagos/culqi', {
      method: 'POST',
      body: JSON.stringify({ pedido_id: pedidoId, ...datosCulqi }),
    });
  }

  // Admin - Crear producto
  crearProducto(datos) {
    return this.request('/productos', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
  }

  // Admin - Actualizar producto
  actualizarProducto(productoId, datos) {
    return this.request(`/productos/${productoId}`, {
      method: 'PUT',
      body: JSON.stringify(datos),
    });
  }

  // Admin - Eliminar producto
  eliminarProducto(productoId) {
    return this.request(`/productos/${productoId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new APIService();
