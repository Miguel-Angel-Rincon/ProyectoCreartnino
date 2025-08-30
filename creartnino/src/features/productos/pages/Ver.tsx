import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/acciones.css";

// Interfaces
import type { IProductos } from "../../interfaces/IProductos";
import type { IImagenesProductos } from "../../interfaces/IImagenesProductos";
import type { ICatProductos } from "../../interfaces/ICatProductos";

interface Props {
  producto: IProductos;
  categoria?: ICatProductos; // opcional: si quieres pasar el objeto categoría para mostrar nombre
  onClose: () => void;
}

const VerProductoModal: React.FC<Props> = ({ producto, categoria, onClose }) => {
  const [imagenUrl, setImagenUrl] = useState<string>("");
  const [cargandoImagen, setCargandoImagen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const cargarImagen = async () => {
      // si producto.Imagen ya es una URL (por si acaso)
      if (typeof producto.Imagen === "string" && (producto.Imagen as string).startsWith("http")) {
        if (mounted) setImagenUrl(producto.Imagen as string);
        return;
      }

      // si es un id (número) -> pedir la fila de Imagenes_Productos
      if (typeof producto.Imagen === "number" && producto.Imagen > 0) {
        setCargandoImagen(true);
        try {
          const res = await axios.get<IImagenesProductos>(
            `https://apicreartnino.somee.com/api/Imagenes_Productos/Obtener/${producto.Imagen}`
          );
          if (!mounted) return;
          // la API debe devolver { IdImagen, Url, Descripcion } u objeto similar
          setImagenUrl(res.data?.Url ?? "");
        } catch (err) {
          console.error("Error cargando imagen:", err);
          if (mounted) setImagenUrl("");
        } finally {
          if (mounted) setCargandoImagen(false);
        }
      } else {
        // valor inesperado
        if (mounted) setImagenUrl("");
      }
    };

    cargarImagen();

    return () => {
      mounted = false;
    };
  }, [producto]);

  const nombreCategoria = categoria?.CategoriaProducto1 ?? String(producto.CategoriaProducto);

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
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
              <div className="col-md-6">
                <label className="form-label">📌 Estado</label>
                <input
                  className="form-control"
                  value={producto.Estado ? "Activo ✅" : "Inactivo ❌"}
                  disabled
                />
              </div>

              {/* Imagen */}
              <div className="col-md-12">
                <label className="form-label">🖼️ Imagen</label>
                <div className="border rounded pastel-img-container p-2 text-center">
                  {cargandoImagen ? (
                    <div>Loading image...</div>
                  ) : imagenUrl ? (
                    <img
                      src={imagenUrl}
                      alt={producto.Nombre}
                      className="img-fluid rounded"
                      style={{ maxHeight: "250px", objectFit: "contain" }}
                    />
                  ) : (
                    <div style={{ padding: 40, color: "#666" }}>No hay imagen disponible</div>
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
