import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../styles/Inicio.css";

import slider1 from "../../assets/Imagenes/slider1.jpg";
import slider2 from "../../assets/Imagenes/slider2.jpg";
import slider3 from "../../assets/Imagenes/slider3.jpg";
import velas from "../../assets/Imagenes/velas.jpg";
import velasx2 from "../../assets/Imagenes/velasx2.jpg";
import topper from "../../assets/Imagenes/topper.jpg";
import cajita from "../../assets/Imagenes/cajita.jpg";
import topperCircular from "../../assets/Imagenes/topperCircular.jpg";
import tablasStitch from "../../assets/Imagenes/tablasStitch.jpg";
import tazaParaiso from "../../assets/Imagenes/tazaParaiso.jpg";
import fraseHero from "../../assets/Imagenes/frase-hero.png"; // Asegúrate que esta imagen exista

export default function Inicio() {
  return (
    <div className="inicio-container bg-white">
      {/* Carrusel */}
      <div id="carouselExample" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-inner rounded-4 overflow-hidden">
          {[slider1, slider2, slider3].map((img, i) => (
            <div className={`carousel-item ${i === 0 ? "active" : ""}`} key={i}>
              <img src={img} className="d-block w-100" alt={`slide-${i}`} />
            </div>
          ))}
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Anterior</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Siguiente</span>
        </button>
      </div>

      {/* Frase motivacional */}
      <section className="frase-hero-section py-5">
        <div className="container d-flex align-items-center justify-content-between flex-wrap-reverse">
          <div className="text-section">
            <h2 className="fw-bold text-pastel">
              Cada creación cuenta una historia, cada detalle refleja amor 🎨✨
            </h2>
            <p className="lead">
              En CreartNino creemos que los pequeños detalles hacen los grandes momentos.
              Diseñamos con pasión para alegrar tus celebraciones y recuerdos.
            </p>
            <a href="/nosotros" className="btn pastel-btn mt-3">Conócenos más</a>
          </div>
          <div className="image-section">
            <img src={fraseHero} alt="creatividad pastel" className="img-fluid rounded" />
          </div>
        </div>
      </section>

      {/* Productos */}
      <section className="destacados-section py-5">
        <h2 className="text-center text-pastel mb-4">Algunos de nuestros productos</h2>
        <div className="producto-grid producto-grid-4">
          {[
            { img: velas, name: "Velas decorativas" },
            { img: velasx2, name: "Set de velas x2" },
            { img: topper, name: "Topper personalizado" },
            { img: cajita, name: "Caja de regalo" },
            { img: topperCircular, name: "Topper circular" },
            { img: tablasStitch, name: "Tabla Stitch" },
            { img: tazaParaiso, name: "Taza Paraíso" },
          ].map((producto, index) => (
            <div className="producto-card" key={index}>
              <img src={producto.img} alt={`producto-${index}`} className="producto-img" />
              <div className="producto-info">
                <h5>{producto.name}</h5>
                <p>$10.000</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <a href="#productos" className="btn pastel-btn">Ver más</a>
        </div>
      </section>
    </div>
  );
}
