import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Registrar componentes de ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminStats() {
  const navigate = useNavigate();
  
  // Fechas (Por defecto ultimos 30 dias)
  const hoy = new Date().toISOString().split('T')[0];
  const haceUnMes = new Date();
  haceUnMes.setMonth(haceUnMes.getMonth() - 1);
  
  const [filtros, setFiltros] = useState({
    inicio: haceUnMes.toISOString().split('T')[0],
    fin: hoy
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargarReporte = async () => {
    try {
      setLoading(true);
      const res = await apiService.getReporteVentas(filtros.inicio, filtros.fin);
      setData(res.data || res); // Manejo robusto
    } catch (error) {
      console.error(error);
      if (error.status === 401) navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin/login');
    cargarReporte();
  }, []);

  const handleFilterChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  // --- CONFIGURACIÓN DE GRÁFICOS ---
  const barData = {
    labels: data?.graficaDias?.labels || [],
    datasets: [
      {
        label: 'Ventas (S/)',
        data: data?.graficaDias?.data || [],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: data?.graficaPlatos?.labels || [],
    datasets: [
      {
        label: '# Cantidad',
        data: data?.graficaPlatos?.data || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>📈 Reporte de Ventas</h1>
        <button onClick={() => navigate('/admin/dashboard')} style={{ padding: '10px', cursor: 'pointer' }}>⬅ Volver</button>
      </div>

      {/* FILTROS */}
      <div style={{ background: '#f0f2f5', padding: '15px', borderRadius: '8px', display: 'flex', gap: '20px', alignItems: 'flex-end', marginBottom: '30px' }}>
        <div>
            <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Fecha Inicio:</label>
            <input type="date" name="inicio" value={filtros.inicio} onChange={handleFilterChange} style={{padding:'8px', borderRadius:'4px', border:'1px solid #ccc'}} />
        </div>
        <div>
            <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Fecha Fin:</label>
            <input type="date" name="fin" value={filtros.fin} onChange={handleFilterChange} style={{padding:'8px', borderRadius:'4px', border:'1px solid #ccc'}} />
        </div>
        <button onClick={cargarReporte} style={{ padding: '9px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Filtrar
        </button>
      </div>

      {loading ? <p>Calculando estadísticas...</p> : (
        <>
          {/* TARJETAS DE RESUMEN */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <div style={{ background: '#28a745', color: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                <h3>Total Recaudado</h3>
                <p style={{ fontSize: '2em', fontWeight: 'bold', margin: '10px 0' }}>S/ {data?.resumen?.ingresos.toFixed(2)}</p>
            </div>
            <div style={{ background: '#17a2b8', color: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                <h3>Pedidos Completados</h3>
                <p style={{ fontSize: '2em', fontWeight: 'bold', margin: '10px 0' }}>{data?.resumen?.pedidos}</p>
            </div>
            <div style={{ background: '#ffc107', color: '#333', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                <h3>Ticket Promedio</h3>
                <p style={{ fontSize: '2em', fontWeight: 'bold', margin: '10px 0' }}>S/ {data?.resumen?.ticketPromedio.toFixed(2)}</p>
            </div>
          </div>

          {/* GRÁFICOS */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'start' }}>
            
            {/* Gráfico de Barras (Ventas por Día) */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h3 style={{ textAlign: 'center' }}>Ventas Diarias (S/)</h3>
                <Bar data={barData} options={{ responsive: true }} />
            </div>

            {/* Gráfico de Pastel (Platos Top) */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h3 style={{ textAlign: 'center' }}>Platos Más Vendidos</h3>
                <div style={{ maxHeight: '400px', display: 'flex', justifyContent: 'center' }}>
                    <Doughnut data={pieData} />
                </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}