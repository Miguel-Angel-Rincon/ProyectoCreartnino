import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../styles/inicio.css";

import slider1 from "../../assets/Imagenes/slider1.jpg";
import slider2 from "../../assets/Imagenes/slider2.jpg";
import slider3 from "../../assets/Imagenes/slider3.jpg";
import fraseHero from "../../assets/Imagenes/frase-hero.png";

import type { IProductos } from "../../features/interfaces/IProductos";

interface IImagenProducto {
  IdImagen: number;
  Url: string;
  Estado: boolean;
}

const Inicio = () => {
  const [productos, setProductos] = useState<IProductos[]>([]);

  // 📦 Cargar productos desde API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch("https://www.apicreartnino.somee.com/api/Productos/Lista");
        const data = await resp.json();
        const activos = data.filter((p: IProductos) => p.Estado === true);
        const aleatorios = activos.sort(() => 0.5 - Math.random()).slice(0, 5);
        setProductos(aleatorios);
      } catch (error) {
        console.error("Error cargando productos:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="inicio-container bg-white">
      {/* Carrusel principal */}
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

      {/* Frase hero */}
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
            <a href="/nosotros" className="btn pastel-btn mt-3">
              Conócenos más
            </a>
          </div>
          <div className="image-section">
            <img src={fraseHero} alt="creatividad pastel" className="img-fluid rounded" />
          </div>
        </div>
      </section>

      {/* 🌸 Productos destacados */}
      <section className="productos-container py-5">
        <h2 className="titulo-productos">Algunos de nuestros productos</h2>

        <div className="productos-grid">
          {productos.length > 0 ? (
            productos.map((producto) => <MiniCardProducto key={producto.IdProducto} producto={producto} />)
          ) : (
            <p className="text-center text-muted">Cargando productos...</p>
          )}
        </div>

        <div className="text-center mt-4">
          <a href="/productos/todos" className="btn pastel-btn">
            Ver más
          </a>
        </div>
      </section>
    </div>
  );
};

// ✅ Componente interno que copia el estilo exacto de CardProducto
const MiniCardProducto = ({ producto }: { producto: IProductos }) => {
  const [imagenes, setImagenes] = useState<string[]>(["/placeholder.png"]);
  const [imagenActual, setImagenActual] = useState(0);
  const [cargando, setCargando] = useState(true);

  const navigate = useNavigate();

  const irADetalle = () => {
    const nombreURL = encodeURIComponent(producto.Nombre);
    navigate(`/Detalle_Producto/${nombreURL}`);
  };

  // 📷 Cargar imágenes desde la API con soporte |||
  useEffect(() => {
  const fetchImagenes = async () => {
    try {
      if (!producto.Imagen) {
        setCargando(false);
        return;
      }
      const resp = await fetch("https://www.apicreartnino.somee.com/api/Imagenes_Productos/Lista");
      const data: IImagenProducto[] = await resp.json();

      const idImagen = Number(producto.Imagen);
      const imagenRegistro = data.find((img) => img.IdImagen === idImagen);

      if (imagenRegistro) {
        const urlsSeparadas = imagenRegistro.Url.split("|||").map((url) =>
          url.trim().startsWith("http")
            ? url.trim()
            : `https://www.apicreartnino.somee.com/${url.trim()}`
        );
        setImagenes(urlsSeparadas.length > 0 ? urlsSeparadas : ["/placeholder.png"]);
      }
    } catch (err) {
      console.error("Error al cargar imagen:", err);
    } finally {
      setCargando(false);
    }
  };

  fetchImagenes();
}, [producto.Imagen]);


  const imagenAnterior = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagenActual((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  const imagenSiguiente = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagenActual((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="categoria-card" onClick={irADetalle} style={{ cursor: "pointer" }}>
  {cargando ? (
    <div className="card-loader">
      <div className="shimmer"></div>
    </div>
  ) : (
    <>
      <div className="card-imagen-container">
        <img
          src={imagenes[imagenActual]}
          alt={producto.Nombre}
          onError={(e) => (e.currentTarget.src = "/placeholder.png")}
          className="imagen-producto"
        />

        {imagenes.length > 1 && (
          <>
            <button className="card-flecha card-flecha-izq" onClick={imagenAnterior}>
              ‹
            </button>
            <button className="card-flecha card-flecha-der" onClick={imagenSiguiente}>
              ›
            </button>

            <div className="card-indicadores">
              {imagenes.map((_, index) => (
                <span
                  key={index}
                  className={`card-indicador ${index === imagenActual ? "activo" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagenActual(index);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <h3>{producto.Nombre}</h3>
      <p className="card-precio">${producto.Precio.toLocaleString()} COP</p>
      <small style={{ color: "#888" }}>Haz clic para ver más detalles</small>
    </>
  )}
</div>

  );
};

export default Inicio;
