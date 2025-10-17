import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../styles/inicio.css";

import slider1 from "../../assets/Imagenes/slider1.jpg";
import slider2 from "../../assets/Imagenes/slider2.jpg";
import slider3 from "../../assets/Imagenes/slider3.jpg";
import fraseHero from "../../assets/Imagenes/frase-hero.png";

import { useCarrito } from "../../context/CarritoContext";
import { useAuth } from "../../context/AuthContext";
import type { IProductos } from "../../features/interfaces/IProductos";

interface IImagenProducto {
  IdImagen: number;
  Url: string;
  Estado: boolean;
}

const Inicio = () => {
  const [productos, setProductos] = useState<IProductos[]>([]);
  const [imagenes, setImagenes] = useState<IImagenProducto[]>([]);
  const [cantidades, setCantidades] = useState<{ [key: number]: number }>({});

  const { agregarProducto } = useCarrito();
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const esAdmin = usuario?.IdRol === 1;
  const esCliente = usuario?.IdRol === 4;

  // 📦 Cargar productos y sus imágenes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productosResp, imagenesResp] = await Promise.all([
          fetch("https://www.apicreartnino.somee.com/api/Productos/Lista"),
          fetch("https://www.apicreartnino.somee.com/api/Imagenes_Productos/Lista"),
        ]);

        const productosData = await productosResp.json();
        const imagenesData: IImagenProducto[] = await imagenesResp.json();

        const activos = productosData.filter((p: IProductos) => p.Estado === true);
        const aleatorios = activos.sort(() => 0.5 - Math.random()).slice(0, 5);

        setProductos(aleatorios);
        setImagenes(imagenesData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    fetchData();
  }, []);

  // 🖼️ Obtener URL de imagen real
  const obtenerImagenUrl = (idImagen?: string | number) => {
    if (!idImagen) return "/placeholder.png";
    const img = imagenes.find((i) => i.IdImagen === Number(idImagen));
    if (!img) return "/placeholder.png";
    return img.Url.startsWith("http")
      ? img.Url
      : `https://www.apicreartnino.somee.com/${img.Url}`;
  };

  // 🧮 Manejar cantidad individual por producto (validando stock)
// 🧮 Manejar cantidad individual por producto (con validación de stock)
const handleCantidadChange = (id: number, value: number, stockDisponible: number) => {
  if (value < 1) value = 1;

  if (value > stockDisponible) {
    Swal.fire({
      title: "Cantidad no disponible 😕",
      text: `Solo hay ${stockDisponible} unidades disponibles en stock.`,
      icon: "warning",
      confirmButtonColor: "#f072d1",
    });
    value = stockDisponible;
  }

  setCantidades((prev) => ({ ...prev, [id]: value }));
};


// 🛒 Agregar producto al carrito
const handleAgregar = (producto: IProductos, imagenUrl: string) => {
  const cantidad = cantidades[producto.IdProducto!] || 1;
  const stock = producto.Cantidad ?? 1;

  if (cantidad > stock) {
    Swal.fire({
      icon: "error",
      title: "Cantidad no válida",
      text: `Solo hay ${stock} unidad(es) disponibles.`,
      confirmButtonColor: "#f072d1",
    });
    return;
  }

  if (!usuario) {
    Swal.fire({
      title: "Debes iniciar sesión",
      text: "Inicia sesión para agregar productos al carrito.",
      icon: "info",
      confirmButtonColor: "#f072d1",
      confirmButtonText: "Ir al login",
    }).then((r) => r.isConfirmed && navigate("/ingresar"));
    return;
  }

  if (esAdmin) {
    Swal.fire({
      title: "Acceso restringido",
      text: "El administrador no puede agregar productos al carrito.",
      icon: "warning",
      confirmButtonColor: "#f072d1",
    });
    return;
  }

  if (esCliente) {
    agregarProducto({
      IdProducto: producto.IdProducto!,
      Nombre: producto.Nombre,
      Precio: producto.Precio,
      ImagenUrl: imagenUrl,
      cantidad,
      stock,
      CategoriaProducto: producto.CategoriaProducto,
      tipo: "Prediseñado",
    });

    Swal.fire({
      title: "¡Agregado al carrito!",
      text: `Has agregado ${cantidad} unidad(es) de ${producto.Nombre}`,
      icon: "success",
      confirmButtonColor: "#f072d1",
    });
  }
};

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
            <a href="/nosotros" className="btn pastel-btn mt-3">
              Conócenos más
            </a>
          </div>
          <div className="image-section">
            <img src={fraseHero} alt="creatividad pastel" className="img-fluid rounded" />
          </div>
        </div>
      </section>

      {/* Productos dinámicos */}
      {/* 🌸 Productos destacados (alineados y diseño pastel) */}
<section className="productos-container py-5">
  <h2 className="titulo-productos">Algunos de nuestros productos</h2>

  <div className="productos-grid">
    {productos.length > 0 ? (
      productos.map((producto) => {
        const imagenUrl = obtenerImagenUrl(producto.Imagen);
        return (
          <div className="producto-card" key={producto.IdProducto}>
            <div className="producto-img-container">
              <img
                src={imagenUrl}
                alt={producto.Nombre}
                onError={(e) => (e.currentTarget.src = "/placeholder.png")}
              />
            </div>

            <h3 className="nombre-producto">{producto.Nombre}</h3>
            <p className="precio-producto">
              ${producto.Precio.toLocaleString("es-CO")} COP
            </p>

            {esCliente && (
              <div className="cantidad-container">
                <label className="me-2">Cantidad:</label>
                <input
  type="number"
  min="1"
  value={cantidades[producto.IdProducto!] || 1}
  onChange={(e) =>
    handleCantidadChange(
      producto.IdProducto!,
      Number(e.target.value),
      producto.Cantidad ?? 1 // 🧩 stock disponible
    )
  }
/>


              </div>
            )}

            {(esCliente || !usuario) && (
              <button
                className="btn-agregar"
                onClick={() => handleAgregar(producto, imagenUrl)}
              >
                {usuario ? "Agregar al Carrito" : "Iniciar sesión para comprar"}
              </button>
            )}

            {esAdmin && (
              <small className="text-muted d-block text-center mt-2">
                Vista de administrador
              </small>
            )}
          </div>
        );
      })
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

export default Inicio;
