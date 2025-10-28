// ✅ src/web/components/CardProducto.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { IProductos } from "../../features/interfaces/IProductos";
import "../styles/categoriasproductos.css";

interface Props {
  producto: IProductos;
}

interface IImagenProducto {
  IdImagen: number;
  Url: string;
  Estado: boolean;
}

const CardProducto = ({ producto }: Props) => {
  const [imagenes, setImagenes] = useState<string[]>(["/placeholder.png"]);
  const [imagenActual, setImagenActual] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // ⏳ shimmer
  const navigate = useNavigate();

  // ✅ Navegar al detalle del producto
  const irADetalle = () => {
    const nombreURL = encodeURIComponent(producto.Nombre);
    navigate(`/Detalle_Producto/${nombreURL}`);
  };

  // 📷 Cargar imágenes desde API
  useEffect(() => {
    const fetchImagenes = async () => {
      try {
        if (!producto.Imagen) {
          setIsLoading(false);
          return;
        }
        const resp = await fetch("https://www.apicreartnino.somee.com/api/Imagenes_Productos/Lista");
        if (!resp.ok) throw new Error(`Error HTTP: ${resp.status}`);

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
        setIsLoading(false);
      }
    };

    fetchImagenes();
  }, [producto.Imagen]);

  // ◀️ Imagen anterior
  const imagenAnterior = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagenActual((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  // ▶️ Imagen siguiente
  const imagenSiguiente = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagenActual((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="categoria-card" onClick={irADetalle} style={{ cursor: "pointer" }}>
      <div className="card-imagen-container">
        {isLoading ? (
          <div className="shimmer-wrapper">
            <div className="shimmer" />
          </div>
        ) : (
          <img
            src={imagenes[imagenActual]}
            alt={producto.Nombre}
            onError={(e) => (e.currentTarget.src = "/placeholder.png")}
            className="imagen-producto fade-in"
          />
        )}

        {/* 🎯 Flechas solo si hay más de 1 imagen */}
        {!isLoading && imagenes.length > 1 && (
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
    </div>
  );
};

export default CardProducto;
