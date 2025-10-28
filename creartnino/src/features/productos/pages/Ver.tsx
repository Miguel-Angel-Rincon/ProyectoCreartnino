import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/acciones.css";

// Interfaces
import type { IProductos } from "../../interfaces/IProductos";
import type { IImagenesProductos } from "../../interfaces/IImagenesProductos";
import type { ICatProductos } from "../../interfaces/ICatProductos";

interface Props {
  producto: IProductos;
  onClose: () => void;
}

const VerProductoModal: React.FC<Props> = ({ producto, onClose }) => {
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [imagenActual, setImagenActual] = useState(0);
  const [cargandoImagen, setCargandoImagen] = useState(false);
  const [nombreCategoria, setNombreCategoria] = useState<string>("");

  // 🔹 Cargar imágenes del producto
  useEffect(() => {
    let mounted = true;

    const cargarImagenes = async () => {
      // Si la imagen ya es una URL directa
      if (typeof producto.Imagen === "string" && (producto.Imagen as string).startsWith("http")) {
        if (mounted) setImagenes([producto.Imagen]);
        return;
      }

      // Si es un ID, buscar en la API
      if (typeof producto.Imagen === "number" && producto.Imagen > 0) {
        setCargandoImagen(true);
        try {
          const res = await axios.get<IImagenesProductos>(
            `https://apicreartnino.somee.com/api/Imagenes_Productos/Obtener/${producto.Imagen}`
          );
          if (!mounted) return;

          // 📸 Separar las URLs por |||
          if (res.data?.Url) {
            const urlsSeparadas = res.data.Url.split("|||")
              .map(url => url.trim())
              .filter(url => url.length > 0)
              .map(url => url.startsWith("http") ? url : `https://apicreartnino.somee.com/${url}`);
            
            setImagenes(urlsSeparadas.length > 0 ? urlsSeparadas : []);
          } else {
            setImagenes([]);
          }
        } catch (err) {
          console.error("Error cargando imágenes:", err);
          if (mounted) setImagenes([]);
        } finally {
          if (mounted) setCargandoImagen(false);
        }
      } else {
        if (mounted) setImagenes([]);
      }
    };

    cargarImagenes();
    return () => {
      mounted = false;
    };
  }, [producto]);

  // 🔹 Cargar nombre de categoría por ID
  useEffect(() => {
    let mounted = true;

    const cargarCategoria = async () => {
      try {
        const res = await axios.get<ICatProductos>(
          `https://apicreartnino.somee.com/api/Categoria_Productos/Obtener/${producto.CategoriaProducto}`
        );
        if (mounted) {
          setNombreCategoria(res.data.CategoriaProducto1);
        }
      } catch (error) {
        console.error("Error cargando categoría", error);
        if (mounted) setNombreCategoria(String(producto.CategoriaProducto));
      }
    };

    if (producto.CategoriaProducto) {
      cargarCategoria();
    }

    return () => {
      mounted = false;
    };
  }, [producto]);

  // ◀️ Imagen anterior
  const imagenAnterior = () => {
    setImagenActual((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  // ▶️ Imagen siguiente
  const imagenSiguiente = () => {
    setImagenActual((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="modal d-block overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal">
          <div className="modal-header pastel-header">
            <h5 className="modal-title">👁️ Detalles del Producto</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body px-4 py-3">
            <div className="row g-4">
              {/* Nombre y Categoría */}
              <div className="col-md-12 d-flex gap-3">
                <div className="flex-fill">
                  <label className="form-label">🛍️ Nombre</label>
                  <input className="form-control" value={producto.Nombre} disabled />
                </div>
                <div className="flex-fill">
                  <label className="form-label">📦 Categoría</label>
                  <input className="form-control" value={nombreCategoria} disabled />
                </div>
              </div>

              {/* Cantidad y Precio */}
              <div className="col-md-6">
                <label className="form-label">🔢 Cantidad</label>
                <input className="form-control" value={producto.Cantidad} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label">💲 Precio</label>
                <input
                  className="form-control"
                  value={`$${(producto.Precio ?? 0).toLocaleString("es-CO")}`}
                  disabled
                />
              </div>

              {/* Marca y Estado */}
              <div className="col-md-6">
                <label className="form-label">🏷️ Marca</label>
                <input className="form-control" value={producto.Marca ?? ""} disabled />
              </div>

              {/* Descripción */}
              <div className="col-6">
                <label className="form-label">📝 Descripción</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={producto.Descripcion ?? "Sin descripción disponible"}
                  disabled
                ></textarea>
              </div>

              {/* Imágenes con Carrusel */}
              <div className="col-md-12">
                <label className="form-label">
                  🖼️ Imágenes {imagenes.length > 0 && `(${imagenActual + 1}/${imagenes.length})`}
                </label>
                <div className="border rounded pastel-img-container p-2 text-center position-relative">
                  {cargandoImagen ? (
                    <div style={{ padding: "100px 0" }}>Cargando imágenes...</div>
                  ) : imagenes.length > 0 ? (
                    <>
                      {/* Imagen principal */}
                      <img
                        src={imagenes[imagenActual]}
                        alt={`${producto.Nombre} - Imagen ${imagenActual + 1}`}
                        className="img-fluid rounded"
                        style={{ maxHeight: "350px", objectFit: "contain" }}
                      />

                      {/* Flechas de navegación (solo si hay más de 1 imagen) */}
                      {imagenes.length > 1 && (
                        <>
                          <button
                            className="modal-flecha modal-flecha-izq"
                            onClick={imagenAnterior}
                            aria-label="Imagen anterior"
                          >
                            ‹
                          </button>
                          <button
                            className="modal-flecha modal-flecha-der"
                            onClick={imagenSiguiente}
                            aria-label="Imagen siguiente"
                          >
                            ›
                          </button>
                        </>
                      )}

                      {/* Miniaturas (si hay más de 1 imagen) */}
                      {imagenes.length > 1 && (
                        <div className="modal-miniaturas mt-3">
                          {imagenes.map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Miniatura ${index + 1}`}
                              className={`modal-miniatura ${index === imagenActual ? "activa" : ""}`}
                              onClick={() => setImagenActual(index)}
                              style={{
                                width: "60px",
                                height: "60px",
                                objectFit: "cover",
                                cursor: "pointer",
                                margin: "0 5px",
                                border: index === imagenActual ? "3px solid #007bff" : "2px solid #ddd",
                                borderRadius: "8px",
                                opacity: index === imagenActual ? 1 : 0.6,
                                transition: "all 0.3s ease"
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ padding: "100px 0", color: "#666" }}>
                      No hay imágenes disponibles
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer pastel-footer">
            <button type="button" className="btn pastel-btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerProductoModal;