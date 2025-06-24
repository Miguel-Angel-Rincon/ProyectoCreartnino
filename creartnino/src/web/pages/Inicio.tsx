import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

// Imágenes del slider
import slider1 from "../../assets/Imagenes/slider1.png";
import slider2 from "../../assets/Imagenes/slider2.png";
import slider3 from "../../assets/Imagenes/slider3.png";

// Instagram
import velas from "../../assets/Imagenes/velas.jpg";
import velasx2 from "../../assets/Imagenes/velasx2.jpg";
import topper from "../../assets/Imagenes/topper.jpg";
import cajita from "../../assets/Imagenes/cajita.jpg";

// Productos destacados
import topperCircular from "../../assets/Imagenes/topperCircular.jpg";
import tablasStitch from "../../assets/Imagenes/tablasStitch.jpg";
import tazaParaiso from "../../assets/Imagenes/tazaParaiso.jpg";

type ProductoProps = {
  titulo: string;
  precio: string;
  imagen: string;
  enlacePredisenado: string;
  enlacePersonalizado: string;
};

const Producto: React.FC<ProductoProps> = ({ titulo, precio, imagen, enlacePredisenado, enlacePersonalizado }) => {
  const [cantidad, setCantidad] = useState(1);

  return (
    <div className="col-12 col-sm-6 col-md-3">
      <div className="card h-100 shadow-sm">
        <img src={imagen} className="card-img-top rounded-top" alt={titulo} style={{ height: "200px", objectFit: "cover" }} />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{titulo}</h5>
          <p className="card-text">$ {precio} COP</p>
          <div className="d-flex align-items-center mb-3 gap-2">
            <label className="form-label mb-0 me-2">Cantidad:</label>
            <div className="d-flex align-items-center border rounded px-1" style={{ maxWidth: "110px" }}>
              <button className="btn btn-sm px-2 py-0" onClick={() => setCantidad(prev => Math.max(1, prev - 1))}>−</button>
              <span className="mx-2">{cantidad}</span>
              <button className="btn btn-sm px-2 py-0" onClick={() => setCantidad(prev => prev + 1)}>+</button>
            </div>
          </div>
          <p className="mb-1 fw-semibold">Hacer pedido:</p>
          <div className="d-grid gap-2">
            <a href={enlacePredisenado} className="btn rounded fw-medium text-dark" style={{ backgroundColor: "#dea864", padding: "6px 12px" }} target="_blank" rel="noopener noreferrer">Prediseñado</a>
            <a href={enlacePersonalizado} className="btn rounded fw-medium text-dark" style={{ backgroundColor: "#dea864", padding: "6px 12px" }} target="_blank" rel="noopener noreferrer">Personalizado</a>
          </div>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const postsInstagram = [
    { imagen: velas, link: "https://www.instagram.com/p/DB9hDZZv8pm/?img_index=1" },
    { imagen: velasx2, link: "https://www.instagram.com/p/DC5UreesXuA/?img_index=1" },
    { imagen: topper, link: "https://www.instagram.com/p/DCxpxSSsIjD/?img_index=1" },
    { imagen: cajita, link: "https://www.instagram.com/p/DBrXGOSvvz7/?img_index=1" },
  ];

  return (
    <div className="container-fluid px-3 px-md-4">
      
      {/* CARRUSEL */}
      <div
        id="inicioCarousel"
        className="carousel slide mx-auto mb-4"
        data-bs-ride="carousel"
        style={{
          maxWidth: "1200px",
          width: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 0 20px rgba(0,0,0,0.1)"
        }}
      >
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src={slider1} className="d-block w-100" alt="Slide 1"
              style={{ height: "auto", maxHeight: "500px", objectFit: "cover" }} />
          </div>
          <div className="carousel-item">
            <img src={slider2} className="d-block w-100" alt="Slide 2"
              style={{ height: "auto", maxHeight: "500px", objectFit: "cover" }} />
          </div>
          <div className="carousel-item">
            <img src={slider3} className="d-block w-100" alt="Slide 3"
              style={{ height: "auto", maxHeight: "500px", objectFit: "cover" }} />
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#inicioCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Anterior</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#inicioCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Siguiente</span>
        </button>
      </div>

      {/* SECCIÓN INSTAGRAM */}
      <section className="p-4">
        <h2 className="fw-bold mb-4 text-center">INSTAGRAM</h2>
        <div className="row gx-5 gy-5 text-center">
          {postsInstagram.map((post, i) => (
            <div className="col-6 col-md-3" key={i}>
              <a href={post.link} target="_blank" rel="noopener noreferrer">
                <img
                  src={post.imagen}
                  alt={`Post ${i + 1}`}
                  className="rounded shadow"
                  style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }}
                />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* SEPARADOR */}
      <hr className="my-4" style={{ borderTop: "5px double #C1E3E2", width: "80%", margin: "0 auto", opacity: 1 }} />

      {/* SECCIÓN PRODUCTOS DESTACADOS */}
      <section className="p-4">
        <div className="row gy-4">
          <Producto
            titulo="Topper circular"
            precio="12.000"
            imagen={topperCircular}
            enlacePredisenado="https://wa.link/predisenado1"
            enlacePersonalizado="https://wa.link/personalizado1"
          />
          <Producto
            titulo="Topper perros criollos"
            precio="12.000"
            imagen={topper}
            enlacePredisenado="https://wa.link/predisenado2"
            enlacePersonalizado="https://wa.link/personalizado2"
          />
          <Producto
            titulo="Tablas de Stitch"
            precio="12.000"
            imagen={tablasStitch}
            enlacePredisenado="https://wa.link/predisenado3"
            enlacePersonalizado="https://wa.link/personalizado3"
          />
          <Producto
            titulo="Taza, el paraíso"
            precio="14.000"
            imagen={tazaParaiso}
            enlacePredisenado="https://wa.link/predisenado4"
            enlacePersonalizado="https://wa.link/personalizado4"
          />
        </div>
      </section>

      {/* BOTÓN VER MÁS */}
      <div className="text-center my-4">
        <a
          href="https://wa.link/vermas"
          className="btn"
          style={{
            backgroundColor: "#b5e2dc",
            color: "#000",
            borderRadius: "20px",
            padding: "6px 20px",
            fontWeight: "500"
          }}
        >
          Ver más
        </a>
      </div>

      {/* BANNER CREARTNINO */}
      <div className="text-center my-4">
        <a
          href="https://wa.link/banner"
          className="d-block py-3 px-4"
          style={{
            backgroundColor: "#b3641e",
            color: "#fff",
            fontSize: "1.5rem",
            borderRadius: "10px",
            fontWeight: "500",
            textDecoration: "none"
          }}
        >
          CreartNino tú mejor opción ★ 👤
          <div style={{ fontSize: "0.75rem", marginTop: "4px", color: "#eee" }}>
            ¿Quieres saber más sobre nosotros? Presiona aquí
          </div>
        </a>
      </div>

    </div>
  );
};

export default HomePage;
