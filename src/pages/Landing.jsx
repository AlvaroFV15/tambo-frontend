import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">El Tambo Cañetano</h1>
          <p className="hero-subtitle">Auténtica Comida Criolla Peruana</p>
          <p className="hero-description">
            Bienvenido a nuestro restaurante, donde la tradición y el sabor se encuentran en cada plato
          </p>
          <button className="hero-btn" onClick={() => navigate('/registro')}>
            Comienza tu Experiencia
          </button>
        </div>
        <div className="hero-image">
          <img src="https://portal.andina.pe/EDPfotografia2/Thumbnail/2009/11/11/000110542W.jpg" alt="Comida Criolla" />
        </div>
      </section>

      {/* About Section */}
      <section className="about">
        <h2>Nuestra Historia</h2>
        <div className="about-content">
          <p>
            El Tambo Cañetano es un referente en la culinaria peruana desde hace más de 20 años. 
            Nos dedica a preservar las tradiciones gastronómicas de nuestra región, ofreciendo 
            platos auténticos preparados con ingredientes frescos y de la más alta calidad.
          </p>
          <p>
            Nuestro compromiso es brindar una experiencia inolvidable a cada cliente, 
            manteniendo vivos los sabores ancestrales de la cocina criolla peruana.
          </p>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="specialties">
        <h2>Nuestras Especialidades</h2>
        <div className="specialty-grid">
          <div className="specialty-card">
            <div className="specialty-icon">🍲</div>
            <h3>Comidas Criollas</h3>
            <p>Sopa seca, chancho a la caja china, arroz con pato y más</p>
          </div>
          <div className="specialty-card">
            <div className="specialty-icon">🥩</div>
            <h3>Parrilla Selecta</h3>
            <p>Carnes a la parrilla: chuleta, bistec, pollo y churrasco</p>
          </div>
          <div className="specialty-card">
            <div className="specialty-icon">🦐</div>
            <h3>Mariscos Frescos</h3>
            <p>Camarones, lenguado, jurel y ceviche de la mejor calidad</p>
          </div>
          <div className="specialty-card">
            <div className="specialty-icon">🍲</div>
            <h3>Caldos Reconfortantes</h3>
            <p>Caldo de gallina y caldo de dieta, preparados con amor</p>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="info">
        <div className="info-card">
          <h3>Dirección</h3>
          <p>Jr. Ricardo Palma 123, Cañete, Lima</p>
        </div>
        <div className="info-card">
          <h3>Teléfono</h3>
          <p>+51 (1) 234-5678</p>
        </div>
        <div className="info-card">
          <h3>Horario</h3>
          <p>Lunes a Domingo: 11:00 AM - 10:00 PM</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Ordena tu Comida Favorita Hoy</h2>
        <p>Disfruta de nuestros deliciosos platos desde la comodidad de tu hogar</p>
        <button className="cta-btn" onClick={() => navigate('/registro')}>
          Hacer un Pedido Ahora
        </button>
      </section>
    </div>
  );
}
